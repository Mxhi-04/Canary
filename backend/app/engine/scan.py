from datetime import timedelta

import numpy as np
from scipy.special import xlogy

from backend.app.data.catalog import LINKS, Dataset
from backend.app.engine.baseline import Baseline
from backend.app.engine.fusion import CLINIC_INDEX, Detection


def _llr(observed, expected):
    return np.where(
        observed > expected, xlogy(observed, observed / expected) - observed + expected, 0
    )


def scan(
    dataset: Dataset,
    baseline: Baseline,
    alert: Detection,
    allowed: set[str],
    k: int,
    simulations: int = 199,
    rounded=None,
) -> dict:
    """Rank connected, in-scope zones and simulate the maximum over eligible windows."""
    t, u, syndrome = alert.t, alert.u, alert.syndrome
    unit = dataset.units[u]
    district = [
        i
        for i, peer in enumerate(dataset.units)
        if peer.id in allowed and peer.district == unit.district
    ]
    nearby = sorted(
        {u}
        | {
            i
            for i, peer in enumerate(dataset.units)
            if peer.id in allowed and frozenset((unit.id, peer.id)) in LINKS
        }
    )
    zones = sorted({(u,), tuple(district), tuple(nearby)}, key=lambda x: (len(x), x))
    start = max(0, t - 6)
    idx = CLINIC_INDEX[syndrome]
    observed = dataset.values[start : t + 1, :, idx]
    expected = baseline.expected[start : t + 1, :, idx]
    candidates = []
    for zone in zones:
        for window in (1, 3, 7):
            if window > len(observed):
                continue
            cells = observed[-window:, zone]
            means = expected[-window:, zone]
            # Avoid releasing totals or test statistics derived from masked cells.
            if rounded is not None and rounded[t - window + 1 : t + 1, zone, idx].any():
                continue
            if not np.all(np.isfinite(cells) & (cells >= k) & np.isfinite(means)):
                continue
            actual, mean = float(cells.sum()), float(means.sum())
            candidates.append((float(_llr(actual, mean)), zone, window, actual, mean))

    if not candidates:
        return {
            "zone": {"unit_ids": [unit.id], "label": unit.name},
            "window": {"from": dataset.dates[t].isoformat(), "to": dataset.dates[t].isoformat()},
            "scan": {"status": "suppressed_or_unavailable"},
        }

    llr, zone, window, actual, mean = max(candidates, key=lambda candidate: candidate[0])
    rng = np.random.default_rng(301 + 1009 * t + 37 * u + idx)
    null = rng.poisson(np.nan_to_num(expected), size=(simulations, *expected.shape))
    best_null = np.maximum.reduce(
        [
            _llr(null[:, -days:, indices].sum(axis=(1, 2)), candidate_mean)
            for _, indices, days, _, candidate_mean in candidates
        ]
    )
    return {
        "zone": {
            "unit_ids": [dataset.units[i].id for i in zone],
            "label": unit.name if len(zone) == 1 else f"{unit.name} and connected sites",
        },
        "window": {
            "from": (dataset.dates[t] - timedelta(days=window - 1)).isoformat(),
            "to": dataset.dates[t].isoformat(),
        },
        "scan": {
            "status": "available",
            "observed": int(actual),
            "expected": round(mean, 3),
            "llr": round(llr, 3),
            "reference_p_value": float(
                (1 + np.count_nonzero(best_null >= llr)) / (simulations + 1)
            ),
            "reference": "Poisson maximum over eligible zones/windows; descriptive only",
        },
    }
