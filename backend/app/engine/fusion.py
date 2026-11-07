"""
Canary Detection Engine: Multi-Signal Bayesian Fusion
Core Principle: Exposure leads; outcomes confirm.

Combines:
1. Stage 1: Environmental Hazard Prior (PM2.5 / WBGT heat index) -> Lead Time Gain (+2.0 to +3.0 days).
2. Stage 2: Outcome Confirmation (Clinic visits, Teleconsults, Sickness Absences).
3. Caps individual contributions (max 40% per stream) to prevent single-stream dominance.
4. Discounts correlated streams (e.g. 15% discount when clinic and telehealth co-occur).
"""

from typing import Dict, List, Any
import numpy as np


class MultiSignalFusionEngine:
    """
    Transparent statistical fusion of environmental hazard exposure
    with aggregated syndromic and absence health outcomes.
    """

    MAX_STREAM_CONTRIBUTION = 40.0  # Cap at 40% to prevent single-stream false alarms
    CORRELATION_DISCOUNT = 0.85     # 15% discount for co-occurring clinic + teleconsult

    def compute_hazard_prior(self, hazard_type: str, hazard_val: float) -> Dict[str, Any]:
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
        hazard_evidence: Dict[str, Any],
        outcome_streams: List[Dict[str, Any]],
        completeness_pct: float = 95.0,
    ) -> Dict[str, Any]:
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
        waterfall: List[Dict[str, Any]] = []

        # 1. Add Hazard Prior Contribution
        hazard_prior = hazard_evidence.get("raw_prior_score", 0.0)
        capped_hazard = min(self.MAX_STREAM_CONTRIBUTION, hazard_prior)
        waterfall.append({
            "stream": f"Hazard: {hazard_evidence.get('hazard_type', 'UNKNOWN')}",
            "raw_score": round(hazard_prior, 1),
            "effective_contribution": round(capped_hazard, 1),
            "explanation": f"Observed {hazard_evidence.get('observed_value')} (Lead: +{hazard_evidence.get('estimated_lead_days', 0):.1f}d)",
        })

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

            waterfall.append({
                "stream": stream.get("stream"),
                "observed": stream.get("observed"),
                "expected": stream.get("expected"),
                "z_score": round(z, 2),
                "raw_score": round(raw_contrib, 1),
                "effective_contribution": round(capped_contrib, 1),
                "discount_applied": discount_applied,
                "explanation": f"Z={z:.1f} vs expected baseline ({stream.get('expected')})",
            })
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

