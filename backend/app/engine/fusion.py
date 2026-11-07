from dataclasses import dataclass

import numpy as np

from backend.app.data.catalog import OUTCOMES, PRIMARY, SYNDROMES, Dataset
from backend.app.engine.baseline import Baseline

WEIGHTS = {
    "respiratory": {"clinic_respiratory": 1.0, "absence": 0.72},
    "gi": {"clinic_gi": 1.0, "absence": 0.72},
    "heat": {"first_aid_heat": 1.0, "near_miss": 0.66, "absence": 0.42},
}
ALERT_BUDGET = 1.0
THRESHOLD_CANDIDATES = (2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0)
DEFAULT_THRESHOLD = 3.5
HAZARD_STREAMS = {"respiratory": ("pm2_5", "dust"), "gi": (), "heat": ("wbgt_proxy",)}
HAZARD_CUTS = {"pm2_5": (25, 50), "dust": (40, 88), "wbgt_proxy": (29.5, 36)}
CLINIC_INDEX = {name: OUTCOMES.index(stream) for name, stream in PRIMARY.items()}


@dataclass
class Evidence:
    total: np.ndarray
    outcomes: np.ndarray
    hazard: np.ndarray
    terms: dict[str, np.ndarray]
    available: dict[str, np.ndarray]
    raised: np.ndarray


@dataclass(frozen=True)
class Detection:
    t: int
    u: int
    syndrome: str
    tier: str


def evidence(dataset: Dataset, baseline: Baseline, syndrome: str) -> Evidence:
    terms, available = {}, {}
    primary_up = np.zeros(dataset.values.shape[:2], dtype=bool)
    for stream, weight in WEIGHTS[syndrome].items():
        i = OUTCOMES.index(stream)
        observed = dataset.stream(stream)
        expected = baseline.expected[:, :, i]
        alpha = baseline.alpha[:, :, i]
        valid = np.isfinite(observed) & np.isfinite(expected)
        higher = expected * 1.9
        # NB log likelihood ratio for mean 1.9x versus the fitted baseline.
        ratio = (1 + alpha * higher) / (1 + alpha * expected)
        llr = observed * (np.log(1.9) - np.log(ratio)) - np.log(ratio) / alpha
        terms[stream] = np.where(valid, weight * np.clip(llr, 0, 4.8), 0)
        available[stream] = valid
        if stream == PRIMARY[syndrome]:
            primary_up = valid & (llr > 0.25)

    hazard_terms = []
    for stream in HAZARD_STREAMS[syndrome]:
        signal = dataset.stream(stream)
        lo, hi = HAZARD_CUTS[stream]
        valid = np.isfinite(signal)
        available[stream] = valid
        hazard_terms.append(np.where(valid, 1.9 * np.clip((signal - lo) / (hi - lo), 0, 1), 0))
    hazard = np.maximum.reduce(hazard_terms) if hazard_terms else np.zeros_like(primary_up, float)
    # Correlated environmental inputs supply one capped prior. Outcome streams
    # retain separate terms, with the two heat workplace signals down-weighted.
    if hazard_terms:
        terms["hazard_prior"] = hazard
    outcome = sum(terms[stream] for stream in WEIGHTS[syndrome])
    workplace_up = (
        sum(terms[stream] for stream in WEIGHTS[syndrome] if stream != PRIMARY[syndrome]) >= 0.65
    )
    raised = (primary_up & ((hazard >= 0.45) | workplace_up)) | (
        ~available[PRIMARY[syndrome]] & (hazard >= 0.9) & workplace_up
    )
    return Evidence(outcome + hazard, outcome, hazard, terms, available, raised)


def detect(scores: dict[str, Evidence], threshold: float, start: int) -> list[Detection]:
    detections = []
    for syndrome, score in scores.items():
        daily = score.raised & (score.total >= threshold) & (score.outcomes >= 1.1)
        for unit in range(daily.shape[1]):
            last_alert = -100
            watch = False
            level = 0
            clear_days = 3
            for t in range(start, daily.shape[0]):
                hit = daily[t, unit]
                clear_days = 0 if hit else clear_days + 1
                if clear_days >= 3:
                    level = 0
                persistent = hit and daily[max(start, t - 2) : t + 1, unit].sum() >= 2
                if persistent and level == 0 and t - last_alert >= 3:
                    detections.append(Detection(t, unit, syndrome, "Alert"))
                    last_alert = t
                    level = 1
                elif (
                    persistent
                    and level == 1
                    and t - last_alert >= 3
                    and score.total[t, unit] >= threshold + 1.8
                ):
                    detections.append(Detection(t, unit, syndrome, "Action"))
                    level = 2
                watching = score.total[t, unit] >= min(1.65, threshold - 0.3)
                if watching and not watch and level == 0:
                    detections.append(Detection(t, unit, syndrome, "Watch"))
                watch = watching
    return sorted(detections, key=lambda d: (d.t, d.u, d.syndrome, d.tier))


def all_evidence(dataset, baseline):
    return {syndrome: evidence(dataset, baseline, syndrome) for syndrome in SYNDROMES}
