from dataclasses import dataclass

import numpy as np
import statsmodels.api as sm
from scipy.stats import nbinom

from backend.app.data.catalog import OUTCOMES, Dataset
from backend.app.data.synthetic import calendar_flags

REFIT_DAYS = 28
HISTORY_DAYS = 365
MIN_REPORTS = 56


@dataclass
class Baseline:
    expected: np.ndarray
    alpha: np.ndarray

    def diagnostics(self, observed: float, t: int, u: int, s: int) -> dict:
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
