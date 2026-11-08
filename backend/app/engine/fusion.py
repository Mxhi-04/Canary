"""
Canary Detection Engine: Multi-Signal Bayesian Fusion
Core Principle: Exposure leads; outcomes confirm.

Combines:
1. Stage 1: Environmental Hazard Prior (PM2.5 / WBGT heat index) -> Lead Time Gain (+2.0 to +3.0 days).
2. Stage 2: Outcome Confirmation (Clinic visits, Teleconsults, Sickness Absences).
3. Caps individual contributions (max 40% per stream) to prevent single-stream dominance.
4. Discounts correlated streams (e.g. 15% discount when clinic and telehealth co-occur).
"""

from dataclasses import dataclass
from typing import Any

import numpy as np

try:
    from backend.app.data.catalog import OUTCOMES, PRIMARY, SYNDROMES, Dataset
    from backend.app.engine.baseline import Baseline
except ImportError:
    try:
        from app.data.catalog import OUTCOMES, PRIMARY, SYNDROMES, Dataset
        from app.engine.baseline import Baseline
    except ImportError:
        OUTCOMES = ()
        PRIMARY = {}
        SYNDROMES = ()
        Dataset = Any
        Baseline = Any

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
CLINIC_INDEX = (
    {name: OUTCOMES.index(stream) for name, stream in PRIMARY.items()}
    if (PRIMARY and OUTCOMES and all(stream in OUTCOMES for stream in PRIMARY.values()))
    else {}
)


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


class MultiSignalFusionEngine:
    """
    Transparent statistical fusion of environmental hazard exposure
    with aggregated syndromic and absence health outcomes.
    """

    MAX_STREAM_CONTRIBUTION = 40.0  # Cap at 40% to prevent single-stream false alarms
    CORRELATION_DISCOUNT = 0.85  # 15% discount for co-occurring clinic + teleconsult

    def compute_hazard_prior(self, hazard_type: str, hazard_val: float) -> dict[str, Any]:
        """
        Stage 1: Computes hazard exposure prior.
        - Heat WBGT: Threshold 29°C (moderate), 31°C (high), 33°C (extreme)
        - Air PM2.5: Threshold 35 ug/m3 (moderate), 55 ug/m3 (high), 110 ug/m3 (severe dust)
        """
        score = 0.0
        lead_days = 0.0

        if hazard_type == "HEAT_WBGT":
            if hazard_val >= 33.0:
                score = 38.0
                lead_days = 2.8
            elif hazard_val >= 31.0:
                score = 28.0
                lead_days = 2.4
            elif hazard_val >= 29.0:
                score = 15.0
                lead_days = 1.5
        elif hazard_type == "AIR_PM25":
            if hazard_val >= 110.0:
                score = 36.0
                lead_days = 3.1
            elif hazard_val >= 55.0:
                score = 26.0
                lead_days = 2.7
            elif hazard_val >= 35.0:
                score = 14.0
                lead_days = 1.8
        elif hazard_type == "WATER_GI":
            # Turbidity / municipal pressure drops
            if hazard_val >= 80.0:
                score = 30.0
                lead_days = 2.1
            elif hazard_val >= 50.0:
                score = 18.0
                lead_days = 1.4

        return {
            "hazard_type": hazard_type,
            "observed_value": hazard_val,
            "raw_prior_score": score,
            "estimated_lead_days": lead_days,
        }

    def fuse_signals(
        self,
        hazard_evidence: dict[str, Any],
        outcome_streams: list[dict[str, Any]],
        completeness_pct: float = 95.0,
    ) -> dict[str, Any]:
        """
        Fuses hazard prior with syndromic outcomes into a final composite anomaly score.
        outcome_streams item format:
        {
            "stream": "clinic_respiratory",
            "observed": 28,
            "expected": 12.0,
            "z_score": 3.2,
            "category": "syndromic" | "absence"
        }
        """
        waterfall: list[dict[str, Any]] = []

        # 1. Add Hazard Prior Contribution
        hazard_prior = hazard_evidence.get("raw_prior_score", 0.0)
        capped_hazard = min(self.MAX_STREAM_CONTRIBUTION, hazard_prior)
        waterfall.append(
            {
                "stream": f"Hazard: {hazard_evidence.get('hazard_type', 'UNKNOWN')}",
                "raw_score": round(hazard_prior, 1),
                "effective_contribution": round(capped_hazard, 1),
                "explanation": f"Observed {hazard_evidence.get('observed_value')} (Lead: +{hazard_evidence.get('estimated_lead_days', 0):.1f}d)",
            }
        )

        # 2. Add Outcome Stream Contributions
        has_clinic = False
        has_telehealth = False
        total_outcome_score = 0.0

        for stream in outcome_streams:
            z = stream.get("z_score", 0.0)
            if z <= 0:
                continue

            # Scale z-score to contribution points (approx 10 pts per sigma above baseline)
            raw_contrib = z * 9.5
            capped_contrib = min(self.MAX_STREAM_CONTRIBUTION, raw_contrib)

            # Check correlation overlap between clinic visits and teleconsults
            stream_name = stream.get("stream", "").lower()
            discount_applied = False
            if "clinic" in stream_name:
                has_clinic = True
                if has_telehealth:
                    capped_contrib *= self.CORRELATION_DISCOUNT
                    discount_applied = True
            elif "tele" in stream_name:
                has_telehealth = True
                if has_clinic:
                    capped_contrib *= self.CORRELATION_DISCOUNT
                    discount_applied = True

            waterfall.append(
                {
                    "stream": stream.get("stream"),
                    "observed": stream.get("observed"),
                    "expected": stream.get("expected"),
                    "z_score": round(z, 2),
                    "raw_score": round(raw_contrib, 1),
                    "effective_contribution": round(capped_contrib, 1),
                    "discount_applied": discount_applied,
                    "explanation": f"Z={z:.1f} vs expected baseline ({stream.get('expected')})",
                }
            )
            total_outcome_score += capped_contrib

        # 3. Completeness penalty if data is missing (< 90%)
        completeness_factor = min(1.0, completeness_pct / 100.0)
        unadjusted_sum = capped_hazard + total_outcome_score
        final_fused_score = min(100.0, max(0.0, unadjusted_sum * completeness_factor))

        return {
            "fused_anomaly_score": round(final_fused_score, 1),
            "completeness_factor": round(completeness_factor, 2),
            "lead_time_gain_days": hazard_evidence.get("estimated_lead_days", 0.0),
            "waterfall": waterfall,
        }
