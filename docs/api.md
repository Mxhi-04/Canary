# Canary API

Swagger UI is available at `http://127.0.0.1:8000/docs` and its contract at `/openapi.json`. The [OpenAPI snapshot](../fixtures/openapi.json) and fixtures below can be used for frontend development before connecting to the API.

| Method | Endpoint | Parameters and fixture |
| --- | --- | --- |
| GET | `/healthz` | Startup health and operating mode. [Fixture](../fixtures/healthz.json) |
| GET | `/units` | Scope-specific site or district IDs and illustrative coordinates. [Fixture](../fixtures/units.json) |
| GET | `/signals` | Required `unit_id`, `from`, `to`, `stream`. Inclusive ISO dates, up to 366 days. [Fixture](../fixtures/signals.json) |
| GET | `/alerts` | Optional `tier`, `unit_id`, `limit` (default 100), `offset`. Most recent first. [Fixture](../fixtures/alerts.json) |
| GET | `/alerts/{alert_id}` | Score contributions, observed and expected counts, scan zone and window, data availability and recommendation. [Fixture](../fixtures/alert-detail.json) |
| GET | `/replay/{scenario}` | `respiratory`, `gi` or `heat`. Query `day` starts at 0, five days before the event. Markers accumulate through the requested day. [Fixture](../fixtures/replay-respiratory.json) |
| GET | `/backtest/summary` | Held-out simulated results, comparators, ablations and timings. [Fixture](../eval/reports/summary.json) |
| GET | `/compliance` | Regulator-only indicators for scheduled district reports. [Fixture](../fixtures/compliance.json) |
| POST | `/ingest` | Authenticated aggregate feed. [Request](../fixtures/ingest-request.json) · [Receipt example](../fixtures/ingest-receipt.json) |

All scoped reads accept the demo-only role selector `?role=site_hse`, `occupational_physician` (the default), `district_public_health` or `regulator`. The site demo is assigned to `site-07` and the district demo to `al-ain`. Role-scoped replay only includes scenarios in the selected scope. In authenticated mode the bearer credential supplies the role and assigned units. A role parameter must match the credential if supplied. The `ingest` role is separate and write-only.

Signals return `available`, `missing`, `suppressed` or `rolled_up`. A missing cell is unreported. A suppressed cell has no exposed value or count-based diagnostic. A rolled-up cell supplies an inclusive `observed_band`. When available, `expected_band` is the central 90% predictive interval of the fitted count baseline. A `reported_late` flag marks authenticated counts first received after the next reporting day. Readings before baseline warmup can lack diagnostics. The exposure streams use μg/m³ for `pm2_5`, `pm10` and `dust`, and °C for `wbgt_proxy`.

The waterfall can render numeric `contribution` values and mark the rest as unavailable. The `hazard_prior` term includes its source inputs. Suppression can hide parts of the waterfall, so an exact total is omitted. `completeness` is the fraction of applicable inputs with usable readings and reference estimates. `confidence` is a coverage label rather than a probability. Recommendation review dates use the alert date in Asia/Dubai.

A credential outside the requested scope gets 404 for unit and alert details. A denied role or write receives 403. Invalid payloads receive 422 with generic issue types. A missing or invalid credential in authenticated mode receives 401. Re-run `uv run python -m scripts.generate_fixtures` to update examples after changing the API.
