"""Fit on past reports, calibrate on separate seeds and evaluate on held-out scenarios."""

import argparse
import json
from dataclasses import replace
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from time import perf_counter

import numpy as np

from backend.app.api.schemas import Aggregate
from backend.app.api.service import Runtime, Settings, today
from backend.app.data.catalog import OUTCOMES, SYNDROMES, UNITS, district_view
from backend.app.data.synthetic import WARMUP, generate
from backend.app.engine.baseline import Baseline, fit
from backend.app.engine.comparators import NAMES, comparator_days
from backend.app.engine.fusion import (
    ALERT_BUDGET,
    THRESHOLD_CANDIDATES,
    Detection,
    all_evidence,
    detect,
)
from backend.app.privacy.access import Actor

REPORT_DIR = Path(__file__).resolve().parent / "reports"
CALIBRATION_SEEDS = (11, 29)
TEST_SEEDS = (157, 331, 557)
ABLATIONS = (
    "without_environment",
    "without_clinic",
    "without_workplace",
    "district_only",
    "reporting_delay_2d",
    "extra_noise_30pct",
)


def comparator_alerts(dataset, baseline):
    detections = {name: [] for name in NAMES}
    for syndrome in SYNDROMES:
        for name, mask in comparator_days(dataset, baseline, syndrome).items():
            if name == "ears_c2" and syndrome != SYNDROMES[0]:
                continue
            for u in range(mask.shape[1]):
                last = -100
                for t in np.flatnonzero(mask[:, u]):
                    if t >= WARMUP and t - last >= 3:
                        label = "any" if name == "ears_c2" else syndrome
                        detections[name].append(Detection(int(t), u, label, "Alert"))
                        last = t
    return detections


def match(detections, dataset, events):
    """Credit one event per alert; use the earliest alert for each matched event."""
    first = {}
    false = 0
    qualified = [hit for hit in detections if hit.tier == "Alert"]
    for hit in sorted(qualified, key=lambda h: (h.t, h.u)):
        unit = dataset.units[hit.u].id
        candidates = [
            event
            for event in events
            if unit in event.units
            and event.start <= hit.t <= event.end
            and hit.syndrome in ("any", event.syndrome)
        ]
        if candidates:
            event = max(candidates, key=lambda candidate: candidate.start)
            first.setdefault(event.id, hit.t)
        else:
            false += 1
    unit_months = len(dataset.units) * (len(dataset.dates) - WARMUP) / (365.25 / 12)
    return first, len(qualified), false, unit_months


def summarize(runs):
    n_events = sum(len(events) for _, events in runs)
    n_alerts = sum(score[1] for score, _ in runs)
    false = sum(score[2] for score, _ in runs)
    detected = sum(len(score[0]) for score, _ in runs)
    clinical = [
        event.clinical_day - first[event.id]
        for (first, _, _, _), events in runs
        for event in events
        if event.clinical_day is not None and event.id in first
    ]
    return {
        "events": n_events,
        "detected_events": detected,
        "alerts": n_alerts,
        "false_alerts": false,
        "sensitivity": round(detected / n_events, 4),
        "ppv": round((n_alerts - false) / n_alerts, 4) if n_alerts else None,
        "false_alerts_per_unit_month": round(false / sum(score[3] for score, _ in runs), 4),
        "clinical_threshold_pairs": len(clinical),
        "median_lead_vs_clinical_threshold_days": float(np.median(clinical)) if clinical else None,
        "sensitivity_by_syndrome": {
            syndrome: round(
                sum(
                    event.id in score[0]
                    for score, events in runs
                    for event in events
                    if event.syndrome == syndrome
                )
                / sum(event.syndrome == syndrome for _, events in runs for event in events),
                4,
            )
            for syndrome in SYNDROMES
        },
    }


def _transform(dataset, baseline, events, name, seed):
    values = dataset.values.copy()
    if name == "district_only":
        district = district_view(dataset)
        return (
            district,
            fit(district),
            [
                replace(event, units=tuple(sorted({UNITS[u].district for u in event.units})))
                for event in events
            ],
        )
    if name == "without_environment":
        values[:, :, len(OUTCOMES) : -1] = np.nan
    if name == "without_clinic":
        values[:, :, [1, 2, 3, 5]] = np.nan
    if name == "without_workplace":
        values[:, :, [0, 4]] = np.nan
    if name == "reporting_delay_2d":
        # At decision day t the latest outcome reflects occurrence day t-2.
        # Use the expected value of that same occurrence day and current hazards.
        values[2:, :, : len(OUTCOMES)] = values[:-2, :, : len(OUTCOMES)].copy()
        values[:2, :, : len(OUTCOMES)] = np.nan
        expected, alpha = [np.roll(a, 2, axis=0) for a in (baseline.expected, baseline.alpha)]
        expected[:2] = alpha[:2] = np.nan
        baseline = Baseline(expected, alpha)
    if name == "extra_noise_30pct":
        rng = np.random.default_rng(seed + 90_001)
        counts = values[:, :, : len(OUTCOMES)]
        counts[:] = np.maximum(0, np.rint(counts * rng.normal(1, 0.30, counts.shape)))
    return replace(dataset, values=values), baseline, events


def measure_ingest(threshold):
    with TemporaryDirectory() as directory:
        path = Path(directory)
        token = "canary-benchmark-feed-token"
        settings = Settings(
            False,
            path / "db.sqlite",
            path / "weather.parquet",
            5,
            json.dumps({token: {"subject": "benchmark", "role": "ingest", "units": ["site-07"]}}),
        )
        app = Runtime(settings, threshold)
        actor = Actor("benchmark", "ingest", frozenset({"site-07"}))
        day = today()
        app.ingest(
            [
                Aggregate(
                    unit="site-07", date=day - timedelta(days=offset), category=stream, count=3
                )
                for offset in range(2, 93)
                for stream in ("absence", "clinic_gi")
            ],
            actor,
        )
        timings = []
        for offset in (1, 0):
            result = app.ingest(
                [
                    Aggregate(
                        unit="site-07", date=day - timedelta(days=offset), category=stream, count=18
                    )
                    for stream in ("absence", "clinic_gi")
                ],
                actor,
            )
            timings.append(result["scoring_latency_ms"])
        assert any(hit.tier == "Alert" for hit in app.current()[0].alerts)
    return round(float(np.median(timings)), 2)


def run():
    candidates = {threshold: [] for threshold in THRESHOLD_CANDIDATES}
    for seed in CALIBRATION_SEEDS:
        dataset, events = generate(seed, "calibration")
        scores = all_evidence(dataset, fit(dataset))
        for threshold, results in candidates.items():
            evaluated = match(detect(scores, threshold, WARMUP), dataset, events)
            results.append((evaluated, events))
    calibration = {t: summarize(rows) for t, rows in candidates.items()}
    passing = [
        t for t, row in calibration.items() if row["false_alerts_per_unit_month"] <= ALERT_BUDGET
    ]
    if not passing:
        raise RuntimeError("No calibration threshold satisfies the false-alert budget")
    threshold = max(
        passing,
        key=lambda t: (
            calibration[t]["sensitivity"],
            calibration[t]["ppv"] or 0,
            t,
        ),
    )

    results = {name: [] for name in ("canary", *NAMES, *ABLATIONS)}
    refresh_ms, scoring_ms = [], []
    for seed in TEST_SEEDS:
        started = perf_counter()
        dataset, events = generate(seed, "test")
        baseline = fit(dataset)
        refresh_ms.append(1_000 * (perf_counter() - started))
        started = perf_counter()
        hits = detect(all_evidence(dataset, baseline), threshold, WARMUP)
        scoring_ms.append(1_000 * (perf_counter() - started))
        results["canary"].append((match(hits, dataset, events), events))
        for name, detections in comparator_alerts(dataset, baseline).items():
            results[name].append((match(detections, dataset, events), events))
        for name in ABLATIONS:
            data, fitted, truth = _transform(dataset, baseline, events, name, seed)
            detections = detect(all_evidence(data, fitted), threshold, WARMUP)
            results[name].append((match(detections, data, truth), truth))

    leads = {}
    for name in NAMES:
        pairs = [
            comparator[0][event_id] - canary_day
            for ((canary, _, _, _), _), (comparator, _) in zip(results["canary"], results[name])
            for event_id, canary_day in canary.items()
            if event_id in comparator[0]
        ]
        leads[name] = {
            "paired_events": len(pairs),
            "median_days": float(np.median(pairs)) if pairs else None,
            "canary_earlier": sum(day > 0 for day in pairs),
            "ties": pairs.count(0),
            "comparator_earlier": sum(day < 0 for day in pairs),
        }
    return {
        "data": "simulated",
        "calibration_seeds": list(CALIBRATION_SEEDS),
        "test_seeds": list(TEST_SEEDS),
        "threshold": threshold,
        "false_alert_budget_per_site_month": ALERT_BUDGET,
        "calibration_method": "Maximize event sensitivity within the false-alert budget; break ties by PPV, then higher threshold.",
        "comparators": {name: summarize(results[name]) for name in ("canary", *NAMES)},
        "lead_time": leads,
        "ablations": {name: summarize(results[name]) for name in ABLATIONS},
        "latency_ms": {
            "refresh_and_fit_730_days_median": round(float(np.median(refresh_ms)), 2),
            "scoring_365_days_median": round(float(np.median(scoring_ms)), 2),
            "scoring_365_days_p95": round(float(np.quantile(scoring_ms, 0.95)), 2),
            "ingest_to_scored_snapshot_median": measure_ingest(threshold),
            "description": "Local runtime. Ingest timing covers SQLite and scoring for two new daily batches after 91 days of single-site history. Source arrival and HTTP transit excluded.",
        },
        "cadence": {"hazard_fetch_target": "hourly", "outcomes": "daily"},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=REPORT_DIR)
    parser.add_argument("--no-charts", action="store_true")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    report = run()
    (args.output_dir / "summary.json").write_text(json.dumps(report, indent=2) + "\n")
    if not args.no_charts:
        from eval.charts import render

        render(report, args.output_dir)
    print(
        json.dumps(
            {key: report[key] for key in ("threshold", "comparators", "lead_time")}, indent=2
        )
    )


if __name__ == "__main__":
    main()
