"""
Canary Detection Engine: Baseline Estimation and Comparators
Core Principle: Exposure leads; outcomes confirm.
Implements:
1. Negative-Binomial expected count baseline with day-of-week seasonality and GLM fitting.
2. EARS C2 (Early Aberration Reporting System) comparator using absence data.
3. CUSUM (Cumulative Sum) comparator using clinic presentations.
"""

from dataclasses import dataclass
from typing import Any

import numpy as np

try:
    import statsmodels.api as sm
    from scipy.stats import nbinom
except ImportError:
    sm = None
    nbinom = None

try:
    from backend.app.data.catalog import OUTCOMES, Dataset
    from backend.app.data.synthetic import calendar_flags
except ImportError:
    try:
        from app.data.catalog import OUTCOMES, Dataset
        from app.data.synthetic import calendar_flags
    except ImportError:
        OUTCOMES = ()
        Dataset = Any
        calendar_flags = None

REFIT_DAYS = 28
HISTORY_DAYS = 365
MIN_REPORTS = 56


@dataclass
class Baseline:
    expected: np.ndarray
    alpha: np.ndarray

    def diagnostics(self, observed: float, t: int, u: int, s: int) -> dict:
        if nbinom is None:
            raise ImportError("scipy is required for Baseline diagnostics")
        mean = self.expected[t, u, s]
        alpha = self.alpha[t, u, s]
        variance = mean + alpha * mean**2
        return {
            "expected": float(mean),
            "dispersion": float(alpha),
            "p_value": float(nbinom.sf(observed - 1, 1 / alpha, 1 / (1 + alpha * mean))),
            "z": float((observed - mean) / np.sqrt(variance)),
            "expected_band": [
                int(nbinom.ppf(q, 1 / alpha, 1 / (1 + alpha * mean))) for q in (0.05, 0.95)
            ],
        }


def _design(dates):
    day_of_year = np.array([day.timetuple().tm_yday - 1 for day in dates])
    phase = 2 * np.pi * day_of_year / 365.25
    ramadan, holiday = calendar_flags(dates)
    return np.column_stack(
        (
            np.ones(len(dates)),
            *([day.weekday() == d for day in dates] for d in range(1, 7)),
            np.sin(phase),
            np.cos(phase),
            ramadan,
            holiday,
        )
    ).astype(float)


def fit(dataset: Dataset) -> Baseline:
    """Fit using preceding dates only, freezing each fit for 28 days."""
    outcomes = dataset.values[:, :, : len(OUTCOMES)]
    expected = np.full_like(outcomes, np.nan)
    dispersion = np.full_like(outcomes, np.nan)
    design = _design(dataset.dates)
    offsets = np.log([unit.headcount for unit in dataset.units])
    by_kind = {
        kind: [i for i, unit in enumerate(dataset.units) if unit.kind == kind]
        for kind in {unit.kind for unit in dataset.units}
    }

    for t in range(MIN_REPORTS, len(dataset.dates), REFIT_DAYS):
        lo, hi = max(0, t - HISTORY_DAYS), min(t + REFIT_DAYS, len(dataset.dates))
        train, future = design[lo:t], design[t:hi]
        for indices in by_kind.values():
            for s in range(len(OUTCOMES)):
                history = outcomes[lo:t, indices, s]
                pool_x = np.repeat(train, len(indices), axis=0)
                pool_offsets = np.tile(offsets[indices], len(train))
                pool = _fit(history.ravel(), pool_x, pool_offsets, future, 0.0)
                for j, u in enumerate(indices):
                    site = (
                        pool
                        if len(indices) == 1
                        else _fit(
                            history[:, j],
                            train,
                            np.full(len(train), offsets[u]),
                            future,
                            0.0,
                        )
                    )
                    if site is None and pool is None:
                        continue
                    if site is None:
                        mu, alpha = pool
                    elif pool is None:
                        mu, alpha = site
                    else:
                        weight = min(1.0, np.nansum(history[:, j]) / 150)
                        mu = weight * site[0] + (1 - weight) * pool[0]
                        alpha = weight * site[1] + (1 - weight) * pool[1]
                    expected[t:hi, u, s] = mu * np.exp(offsets[u])
                    dispersion[t:hi, u, s] = alpha
    return Baseline(expected, dispersion)


def _fit(y, train, offsets, future, forecast_offset):
    if sm is None:
        raise ImportError("statsmodels is required for GLM baseline fitting")
    observed = np.isfinite(y)
    if observed.sum() < MIN_REPORTS:
        return None
    y, train, offsets = y[observed], train[observed], offsets[observed]
    # Limit the influence of large historical episodes on the reference fit.
    y = np.minimum(y, max(1.0, np.quantile(y, 0.98)))
    columns = np.any(train != 0, axis=0)
    x = train[:, columns]
    if y.sum() == 0:
        return np.full(len(future), 0.1 / np.exp(offsets).mean()), 0.02
    rate = (y.sum() + 0.5) / np.exp(offsets).sum()
    if np.ptp(y / np.exp(offsets)) < 1e-12:
        return np.full(len(future), rate), 0.02
    mu = np.exp(offsets) * rate
    alpha = float(np.clip(np.sum((y - mu) ** 2 - mu) / np.sum(mu**2), 0.02, 1.0))
    model = sm.GLM(y, x, offset=offsets, family=sm.families.NegativeBinomial(alpha=alpha))
    try:
        result = model.fit(maxiter=35)
        if result.converged:
            linear = future[:, columns] @ result.params + forecast_offset
            return np.exp(np.clip(linear, -16, 0)), alpha
    except (ValueError, np.linalg.LinAlgError, FloatingPointError):
        pass
    return np.full(len(future), rate), alpha


class BaselineEngine:
    """
    Computes per-unit, per-stream expected baselines and residual z-scores.
    Accounts for day-of-week seasonality and exposure headcount offsets.
    """

    def __init__(self, baseline_window_days: int = 14):
        self.baseline_window_days = baseline_window_days

    def compute_expected_baseline(
        self, historical_counts: list[float], day_of_week: int
    ) -> tuple[float, float]:
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

    def compute_anomaly_zscore(self, observed: float, expected: float, std_dev: float) -> float:
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

    def evaluate(self, counts_history: list[float]) -> dict[str, Any]:
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
        self, counts_history: list[float], slack: float = 0.5, h: float = 4.0
    ) -> dict[str, Any]:
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
