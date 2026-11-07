from dataclasses import replace

import numpy as np

from backend.app.data.openmeteo import wbgt_proxy
from backend.app.data.synthetic import generate
from backend.app.engine.baseline import fit
from backend.app.engine.fusion import Evidence, detect


def test_fit_uses_past_dates_only():
    data, _ = generate(23, "calibration")
    data = replace(
        data, dates=data.dates[:98], units=data.units[:1], values=data.values[:98, :1, :]
    )
    past = fit(data)
    revised = data.values.copy()
    revised[86:, :, :] = 999
    after = fit(replace(data, values=revised))
    # The same frozen training window precedes day 84 through day 97.
    np.testing.assert_allclose(past.expected, after.expected)


def test_persistence_cooldown_and_rearm():
    totals = np.full((15, 1), 4.0)
    active = np.ones_like(totals, dtype=bool)
    totals[7:10] = 0
    active[7:10] = False
    hits = detect({"respiratory": Evidence(totals, totals, totals, {}, {}, active)}, 2.0, 0)
    assert [(hit.t, hit.tier) for hit in hits if hit.tier != "Watch"] == [
        (1, "Alert"),
        (4, "Action"),
        (11, "Alert"),
        (14, "Action"),
    ]


def test_weather_proxy_handles_missing_inputs():
    result = wbgt_proxy(np.array([30.0, 30.0, np.nan]), np.array([50.0, 80.0, 50.0]))
    assert 28 < result[0] < 31
    assert result[1] > result[0]
    assert np.isnan(result[2])
