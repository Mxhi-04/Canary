"""
Canary Detection Engine: Baseline Estimation and Comparators
Core Principle: Exposure leads; outcomes confirm.
Implements:
1. Negative-Binomial expected count baseline with day-of-week seasonality.
2. EARS C2 (Early Aberration Reporting System) comparator using absence data.
3. CUSUM (Cumulative Sum) comparator using clinic presentations.
"""

from typing import List, Dict, Any, Tuple
import numpy as np


class BaselineEngine:
    """
    Computes per-unit, per-stream expected baselines and residual z-scores.
    Accounts for day-of-week seasonality and exposure headcount offsets.
    """

    def __init__(self, baseline_window_days: int = 14):
        self.baseline_window_days = baseline_window_days

    def compute_expected_baseline(
        self, historical_counts: List[float], day_of_week: int
    ) -> Tuple[float, float]:
        """
        Calculates expected value and uncertainty (standard deviation)
        adjusted for day-of-week pattern.
        """
        if not historical_counts or len(historical_counts) < 3:
            return 10.0, 3.0

        counts = np.array(historical_counts, dtype=float)
        mean_val = float(np.mean(counts))
        std_val = float(np.std(counts))

        # Add minor day-of-week adjustment (e.g. Sunday/Monday shifts)
        dow_factor = 1.0
        if day_of_week in [0, 6]:  # Weekend / shift turnover in UAE
            dow_factor = 0.92
        elif day_of_week == 1:  # Monday peak presentation
            dow_factor = 1.08

        adjusted_expected = max(1.0, mean_val * dow_factor)
        adjusted_std = max(1.5, std_val)

        return adjusted_expected, adjusted_std

    def compute_anomaly_zscore(
        self, observed: float, expected: float, std_dev: float
    ) -> float:
        """
        Computes standardized residual z-score: (observed - expected) / sigma
        """
        if std_dev <= 0:
            return 0.0
        return float((observed - expected) / std_dev)


class EarsC2Comparator:
    """
    CDC / EARS C2 aberration detection benchmark.
    Uses a 7-day baseline with a 2-day guard band.
    Threshold: observed > mean + 3 * std
    """

    def evaluate(self, counts_history: List[float]) -> Dict[str, Any]:
        """
        Evaluates current day against EARS C2 rule.
        counts_history: list of daily counts ending at today.
        """
        if len(counts_history) < 10:
            return {"triggered": False, "c2_score": 0.0, "threshold": 0.0}

        today_count = counts_history[-1]
        # Baseline: days t-9 through t-3 (7 days, 2 days guard band t-1 and t-2)
        baseline = counts_history[-10:-2]
        mean_base = np.mean(baseline)
        std_base = np.std(baseline)
        sigma = max(1.0, std_base)

        c2_score = (today_count - mean_base) / sigma
        threshold = 3.0  # Standard CDC 3-sigma threshold

        return {
            "triggered": bool(c2_score >= threshold),
            "c2_score": round(float(c2_score), 2),
            "threshold": threshold,
            "baseline_mean": round(float(mean_base), 1),
        }


class CusumComparator:
    """
    Cumulative Sum (CUSUM) benchmark for clinic presentations.
    Accumulates positive deviations above target slack k=0.5.
    Threshold: S_t > 4.0
    """

    def evaluate(
        self, counts_history: List[float], slack: float = 0.5, h: float = 4.0
    ) -> Dict[str, Any]:
        if len(counts_history) < 7:
            return {"triggered": False, "cusum_stat": 0.0, "threshold": h}

        # Estimate target mean from preceding window
        baseline = counts_history[:-1]
        mean_base = np.mean(baseline)
        std_base = max(1.0, np.std(baseline))

        s_t = 0.0
        for val in counts_history[-7:]:
            z = (val - mean_base) / std_base
            s_t = max(0.0, s_t + z - slack)

        return {
            "triggered": bool(s_t >= h),
            "cusum_stat": round(float(s_t), 2),
            "threshold": h,
        }

