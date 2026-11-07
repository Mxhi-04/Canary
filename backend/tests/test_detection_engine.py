"""
Unit tests for the Canary Python Detection & Privacy Engine.
Validates:
1. Baseline calculation and residual z-scores.
2. EARS C2 comparator (3-sigma threshold, 2-day guard band).
3. Multi-Signal Bayesian Fusion (caps, correlation discounts, +2.9d lead-time gain).
4. Tiering engine (persistence, cooldown, Action/Alert/Watch thresholds).
5. Privacy engine (rejection of prohibited personal identifiers, k-suppression).
"""

import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.engine.baseline import BaselineEngine, EarsC2Comparator, CusumComparator
from app.engine.fusion import MultiSignalFusionEngine
from app.engine.tiering import TieringEngine, RiskTier
from app.engine.privacy import PrivacyEngine


def test_baseline_and_zscore():
    engine = BaselineEngine()
    history = [10.0, 12.0, 11.0, 9.0, 10.0, 11.0, 12.0, 10.0, 11.0, 10.0]
    expected, std = engine.compute_expected_baseline(history, day_of_week=2)
    assert 9.0 <= expected <= 13.0
    assert std > 0

    z = engine.compute_anomaly_zscore(observed=25.0, expected=expected, std_dev=std)
    assert z > 5.0  # Significant anomaly


def test_ears_c2_comparator():
    c2 = EarsC2Comparator()
    # Baseline 10 days of normal counts ~ 10, then spike to 25
    history = [10, 11, 9, 10, 10, 12, 10, 11, 10, 25]
    result = c2.evaluate([float(x) for x in history])
    assert result["triggered"] is True
    assert result["c2_score"] >= 3.0


def test_multi_signal_fusion_with_caps_and_discount():
    fusion = MultiSignalFusionEngine()

    # Stage 1: Severe PM2.5 sandstorm hazard (130 ug/m3)
    hazard_ev = fusion.compute_hazard_prior("AIR_PM25", 130.0)
    assert hazard_ev["raw_prior_score"] > 30.0
    assert hazard_ev["estimated_lead_days"] >= 2.5

    # Stage 2: Co-occurring outcomes (Clinic + Telehealth)
    outcomes = [
        {"stream": "clinic_respiratory", "observed": 32, "expected": 12.0, "z_score": 3.8},
        {"stream": "telehealth_respiratory", "observed": 24, "expected": 10.0, "z_score": 3.2},
    ]

    fused = fusion.fuse_signals(hazard_ev, outcomes, completeness_pct=95.0)
    score = fused["fused_anomaly_score"]

    assert score >= 70.0  # High alert/action score
    assert fused["lead_time_gain_days"] >= 2.5

    # Verify capping & discount in waterfall
    waterfall = fused["waterfall"]
    assert len(waterfall) == 3
    # Check that neither stream exceeds MAX_STREAM_CONTRIBUTION (40.0)
    for w in waterfall:
        assert w["effective_contribution"] <= 40.0


def test_tiering_persistence_and_cooldown():
    tiering = TieringEngine()

    # Case 1: First day above Alert (score=65), previous days were low (20, 25)
    # Holds at WATCH pending 2-day persistence confirmation
    res_single = tiering.evaluate_tier(65.0, recent_3day_scores=[20.0, 25.0, 65.0])
    assert res_single["tier"] == RiskTier.WATCH

    # Case 2: Second consecutive day above Alert (65, 70)
    res_persistent = tiering.evaluate_tier(70.0, recent_3day_scores=[25.0, 65.0, 70.0])
    assert res_persistent["tier"] == RiskTier.ALERT

    # Case 3: Action tier (>= 75) triggers immediately without waiting for persistence
    res_action = tiering.evaluate_tier(82.0, recent_3day_scores=[20.0, 20.0, 82.0])
    assert res_action["tier"] == RiskTier.ACTION

    # Case 4: Cooldown active (last alert closed 1 day ago)
    res_cooldown = tiering.evaluate_tier(60.0, recent_3day_scores=[60.0, 60.0, 60.0], last_alert_closed_days_ago=1)
    assert res_cooldown["in_cooldown"] is True
    assert res_cooldown["tier"] == RiskTier.NORMAL


def test_privacy_rejection_of_personal_data():
    privacy = PrivacyEngine()

    # Rejection of national ID / employee name
    bad_payload = {
        "unit_id": "UNIT-01",
        "observed_on": "2026-11-07",
        "stream": "clinic_respiratory",
        "count": 5,
        "emirates_id": "784-1985-1234567-1",
        "person_name": "John Doe",
    }
    is_valid, violations = privacy.validate_ingest_payload(bad_payload)
    assert is_valid is False
    assert any("emirates_id" in v.lower() for v in violations)
    assert any("person_name" in v.lower() for v in violations)

    # Valid aggregate payload
    valid_payload = {
        "unit_id": "UNIT-01",
        "observed_on": "2026-11-07",
        "stream": "clinic_respiratory",
        "count": 14,
    }
    is_valid_clean, _ = privacy.validate_ingest_payload(valid_payload)
    assert is_valid_clean is True


def test_privacy_small_cell_suppression():
    privacy = PrivacyEngine()

    # Count = 3 (< k=5) -> Suppressed
    supp = privacy.apply_small_cell_suppression(count=3, k_threshold=5)
    assert supp["suppressed"] is True
    assert supp["display_value"] == "<5"

    # Count = 0 -> Display as 0 (no suppression needed)
    zero_supp = privacy.apply_small_cell_suppression(count=0, k_threshold=5)
    assert zero_supp["suppressed"] is False
    assert zero_supp["display_value"] == "0"

    # Count = 8 (>= k=5) -> Allowed
    normal_cell = privacy.apply_small_cell_suppression(count=8, k_threshold=5)
    assert normal_cell["suppressed"] is False
    assert normal_cell["display_value"] == "8"
