"""Export sample JSON through the running API contract for the frontend handoff."""

import json
from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient

from backend.app.api.main import create_app
from backend.app.api.service import Settings

ROOT = Path(__file__).resolve().parents[1] / "fixtures"


def save(name, value):
    (ROOT / f"{name}.json").write_text(json.dumps(value, indent=2) + "\n")


def main():
    with TemporaryDirectory() as directory:
        temp = Path(directory)
        app = create_app(Settings(True, temp / "demo.sqlite", temp / "weather.parquet", 5))
        with TestClient(app) as client:

            def get(path, **params):
                return client.get(path, params=params).raise_for_status().json()

            save("healthz", get("/healthz"))
            save("units", get("/units"))
            save(
                "signals",
                get(
                    "/signals",
                    unit_id="site-07",
                    stream="clinic_respiratory",
                    **{"from": "2026-08-07", "to": "2026-08-20"},
                ),
            )
            replay = get("/replay/respiratory", day=16)
            save("replay-respiratory", replay)
            marker = next(
                item
                for item in replay["markers"]["canary"]
                if item["tier"] == "Alert" and item["unit_id"] == "site-07"
            )
            save("alerts", get("/alerts", tier="Alert", unit_id="site-07", limit=10))
            save("alert-detail", get(f"/alerts/{marker['id']}"))
            save("compliance", get("/compliance", role="regulator"))
            save("openapi", get("/openapi.json"))
    save(
        "ingest-request",
        {
            "records": [
                {
                    "unit": "site-07",
                    "date": "2026-08-14",
                    "category": "clinic_respiratory",
                    "count": 11,
                }
            ]
        },
    )
    save("ingest-receipt", {"accepted": 1, "scoring_latency_ms": 31.4})


if __name__ == "__main__":
    main()
