import json
import sqlite3
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from backend.app.api.main import create_app
from backend.app.api.service import Settings, today

FEED = "canary-test-ingest-secret-01"
HSE = "canary-test-site-hse-secret"
DISTRICT = "canary-test-district-secret"


def credentials(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def demo(tmp_path_factory):
    path = tmp_path_factory.mktemp("demo")
    with TestClient(
        create_app(Settings(True, path / "db.sqlite", path / "weather.parquet", 5))
    ) as api:
        yield api


def test_demo_contract_and_scope(demo):
    assert demo.get("/healthz").json()["mode"] == "synthetic_demo"
    assert len(demo.get("/units").json()) == 12
    assert [unit["id"] for unit in demo.get("/units?role=site_hse").json()] == ["site-07"]
    assert (
        demo.get(
            "/signals",
            params={
                "role": "site_hse",
                "unit_id": "site-01",
                "stream": "absence",
                "from": "2026-08-01",
                "to": "2026-08-10",
            },
        ).status_code
        == 404
    )
    assert demo.get("/alerts?role=regulator").json() == []
    assert "scheduled_report_received" in demo.get("/compliance?role=regulator").json()[0]
    assert demo.get("/compliance?role=site_hse").status_code == 403
    assert demo.get("/backtest/summary").json()["data"] == "simulated"
    assert (
        demo.post(
            "/ingest",
            json={
                "records": [
                    {
                        "unit": "site-07",
                        "date": "2026-08-12",
                        "category": "absence",
                        "count": 11,
                    }
                ]
            },
        ).status_code
        == 403
    )


@pytest.mark.parametrize(("scenario", "day"), [("respiratory", 16), ("gi", 15), ("heat", 14)])
def test_replay_and_explanations(demo, scenario, day):
    response = demo.get(f"/replay/{scenario}", params={"day": day})
    assert response.status_code == 200
    replay = response.json()
    assert replay["data"] == "simulated"
    marker = next(marker for marker in replay["markers"]["canary"] if marker["tier"] == "Alert")
    detail = demo.get(f"/alerts/{marker['id']}")
    assert detail.status_code == 200
    assert detail.headers["cache-control"] == "no-store"
    alert = detail.json()
    assert set(alert["zone"]["unit_ids"])
    assert alert["recommendation"]["requires_human_signoff"]
    assert alert["recommendation"]["evidence"][0]["url"].startswith("https://")
    assert alert["contributions"]
    assert demo.get(f"/alerts/{marker['id']}?role=regulator").status_code == 404
    assert demo.get(f"/replay/{scenario}?day=0").json()["markers"]["canary"] == []


def test_live_atomic_ingest_privacy_and_district_rollup(tmp_path):
    auth = json.dumps(
        {
            FEED: {"subject": "feed", "role": "ingest", "units": ["site-07", "al-ain"]},
            HSE: {"subject": "hse", "role": "site_hse", "units": ["site-07"]},
            DISTRICT: {
                "subject": "district",
                "role": "district_public_health",
                "units": ["al-ain"],
            },
        }
    )
    db = tmp_path / "live.sqlite"
    app = create_app(Settings(False, db, tmp_path / "weather.parquet", 5, auth))
    date = (today() - timedelta(days=2)).isoformat()
    small = {"unit": "site-07", "date": date, "category": "clinic_gi", "count": 2}
    total = {"unit": "al-ain", "date": date, "category": "clinic_gi", "count": 17}
    with TestClient(app) as api:
        assert api.get("/units?role=site_hse").status_code == 401
        assert api.get("/units?role=regulator", headers=credentials(HSE)).status_code == 403
        assert api.get("/units", headers=credentials(FEED)).status_code == 403
        assert (
            api.post("/ingest", json={"records": [small]}, headers=credentials(HSE)).status_code
            == 403
        )
        invalid = api.post(
            "/ingest",
            json={"records": [{**small, "Jane Example": "private"}]},
            headers=credentials(FEED),
        )
        assert invalid.status_code == 422
        assert "Jane" not in invalid.text and "private" not in invalid.text
        duplicate = api.post("/ingest", json={"records": [small, small]}, headers=credentials(FEED))
        assert duplicate.status_code == 422
        outside = api.post(
            "/ingest",
            json={"records": [small, {**small, "unit": "site-08"}]},
            headers=credentials(FEED),
        )
        assert outside.status_code == 403
        assert api.get("/alerts", headers=credentials(HSE)).json() == []

        with sqlite3.connect(db) as connection:
            assert connection.execute("SELECT count(*) FROM reports").fetchone() == (0,)

        for _ in range(2):
            receipt = api.post(
                "/ingest", json={"records": [small, total]}, headers=credentials(FEED)
            )
            assert receipt.status_code == 200
            assert receipt.json()["accepted"] == 2
            assert receipt.json()["scoring_latency_ms"] >= 0

        params = {"stream": "clinic_gi", "from": date, "to": date}
        site = api.get(
            "/signals", params={**params, "unit_id": "site-07"}, headers=credentials(HSE)
        )
        assert site.json()["points"][0]["status"] == "suppressed"
        assert site.json()["points"][0]["observed"] is None
        district = api.get(
            "/signals", params={**params, "unit_id": "al-ain"}, headers=credentials(DISTRICT)
        )
        assert district.json()["points"][0]["status"] == "rolled_up"
        assert district.json()["points"][0]["observed_band"] == [15, 19]
        assert district.json()["points"][0]["observed"] is None
        assert district.json()["points"][0]["reported_late"]

        correction = api.post(
            "/ingest", json={"records": [{**small, "count": 7}]}, headers=credentials(FEED)
        )
        assert correction.status_code == 200
        site = api.get(
            "/signals", params={**params, "unit_id": "site-07"}, headers=credentials(HSE)
        )
        assert site.json()["points"][0]["observed"] == 7
        assert api.get("/replay/gi", headers=credentials(HSE)).status_code == 404

    with sqlite3.connect(db) as connection:
        assert connection.execute("SELECT count(*) FROM reports").fetchone() == (2,)
        assert connection.execute(
            "SELECT count(*) FROM audit WHERE outcome = 'unchanged'"
        ).fetchone() == (1,)


def test_scan_never_releases_overlapping_protected_windows(demo):
    rows = demo.get("/alerts", params={"tier": "Alert", "limit": 60}).json()
    details = (demo.get(f"/alerts/{row['id']}").json() for row in rows)
    detail = next(
        alert
        for alert in details
        if any(point["status"] == "suppressed" for point in alert["contributions"])
    )
    for point in detail["contributions"]:
        if point["status"] == "suppressed":
            assert point["contribution"] is None
            assert "observed" not in point
            assert "expected" not in point
