import json
from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.api.schemas import (
    Aggregate,
    AlertDetail,
    AlertSummary,
    Batch,
    Receipt,
    Role,
    SignalSeries,
    Tier,
    UnitView,
)
from backend.app.api.service import Runtime, Settings, report_threshold
from backend.app.data.catalog import HAZARDS, OUTCOMES, PRIMARY, STREAMS, UNITS
from backend.app.data.openmeteo import ATTRIBUTION
from backend.app.data.synthetic import named_scenarios
from backend.app.privacy.access import DEMO_ROLES, Actor, authenticate
from eval.backtest import REPORT_DIR, comparator_alerts

BEARER = HTTPBearer(auto_error=False)
Token = Annotated[HTTPAuthorizationCredentials | None, Depends(BEARER)]
RoleQuery = Annotated[Role | None, Query(description="Read-only synthetic demo role selector")]
REPORT_FILE = REPORT_DIR / "summary.json"


def create_app(settings: Settings | None = None):
    settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app):
        app.state.report = json.loads(REPORT_FILE.read_text()) if REPORT_FILE.exists() else {}
        app.state.runtime = Runtime(settings, report_threshold(app.state.report))
        if settings.demo:
            app.state.scenarios = named_scenarios()
            app.state.comparators = [
                comparator_alerts(board.dataset, board.fitted)
                for board in app.state.runtime.current()
            ]
        yield

    app = FastAPI(
        title="Canary API",
        version="0.1.0",
        description="Aggregate surveillance prototype for population and workforce health.",
        lifespan=lifespan,
    )
    if settings.origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.origins),
            allow_methods=["GET", "POST"],
            allow_headers=["Authorization", "Content-Type"],
        )

    @app.middleware("http")
    async def private_responses(request, call_next):
        if settings.demo and request.method == "POST" and request.url.path.rstrip("/") == "/ingest":
            response = JSONResponse(
                status_code=403, content={"detail": "Synthetic demo is read-only"}
            )
        else:
            response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request, exc):
        # Never reflect submitted values or arbitrary field names back to clients.
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Request does not match the API schema",
                "issues": sorted({issue["type"] for issue in exc.errors()}),
            },
        )

    def viewer(request: Request, token: Token, role: RoleQuery = None) -> Actor:
        runtime = request.app.state.runtime
        if settings.demo:
            actor = DEMO_ROLES[role or "occupational_physician"]
        else:
            actor = authenticate(token.credentials if token else None, runtime.credentials)
        route = request.scope["route"].name
        if actor.role == "ingest" or (role and role != actor.role):
            runtime.store.audit(actor, route, "denied")
            raise HTTPException(403, "Credential does not grant this role")
        runtime.store.audit(actor, route)
        return actor

    Viewer = Annotated[Actor, Depends(viewer)]

    def scoped_board(request: Request, actor: Actor):
        boards = request.app.state.runtime.current()
        return boards[1] if actor.role in {"district_public_health", "regulator"} else boards[0]

    @app.get("/", include_in_schema=False)
    def root():
        return RedirectResponse("/docs")

    @app.get("/healthz")
    def health(request: Request):
        return {
            "status": "ok",
            "mode": "synthetic_demo" if settings.demo else "authenticated",
            "threshold": request.app.state.runtime.threshold,
        }

    @app.get("/units", response_model=list[UnitView])
    def units(actor: Viewer):
        return [
            {
                "id": unit.id,
                "name": unit.name,
                "district": unit.district,
                "kind": unit.kind,
                "latitude": unit.lat,
                "longitude": unit.lon,
            }
            for unit in UNITS.values()
            if unit.id in actor.units
        ]

    @app.get("/signals", response_model=SignalSeries)
    def signals(
        request: Request,
        actor: Viewer,
        unit_id: str,
        stream: str,
        from_day: Annotated[date, Query(alias="from")],
        to_day: Annotated[date, Query(alias="to")],
    ):
        if actor.role == "regulator":
            raise HTTPException(403, "Use /compliance for the regulator view")
        if unit_id not in actor.units:
            raise HTTPException(404, "Unit not found")
        if stream not in STREAMS or (stream == "teleconsult" and UNITS[unit_id].kind != "district"):
            raise HTTPException(422, "Unsupported stream for this unit")
        if not 0 <= (to_day - from_day).days <= 365:
            raise HTTPException(422, "Provide an ordered date range of up to 366 days")
        board = scoped_board(request, actor)
        u = next(i for i, unit in enumerate(board.dataset.units) if unit.id == unit_id)
        points = [
            board.signal(t, u, stream, settings.k)
            for t, day in enumerate(board.dataset.dates)
            if from_day <= day <= to_day
        ]
        source = (
            "synthetic" if settings.demo else ATTRIBUTION if stream in HAZARDS else "aggregate_feed"
        )
        return {"unit_id": unit_id, "stream": stream, "source": source, "points": points}

    @app.get("/alerts", response_model=list[AlertSummary])
    def alerts(
        request: Request,
        actor: Viewer,
        tier: Tier | None = None,
        unit_id: str | None = None,
        limit: Annotated[int, Query(ge=1, le=500)] = 100,
        offset: Annotated[int, Query(ge=0)] = 0,
    ):
        if actor.role == "regulator":
            return []
        if unit_id is not None and unit_id not in actor.units:
            raise HTTPException(404, "Unit not found")
        board = scoped_board(request, actor)
        rows = [
            board.summary(hit)
            for hit in reversed(board.alerts)
            if board.dataset.units[hit.u].id in actor.units
            and (unit_id is None or board.dataset.units[hit.u].id == unit_id)
            and (tier is None or hit.tier == tier)
        ]
        return rows[offset : offset + limit]

    @app.get("/alerts/{alert_id}", response_model=AlertDetail)
    def alert_detail(request: Request, actor: Viewer, alert_id: str):
        if actor.role != "regulator":
            board = scoped_board(request, actor)
            for hit in board.alerts:
                if board.dataset.units[hit.u].id in actor.units and board.alert_id(hit) == alert_id:
                    return board.detail(hit, actor, settings.k)
        raise HTTPException(404, "Alert not found")

    @app.get("/backtest/summary")
    def backtest(request: Request, actor: Viewer):
        if not request.app.state.report:
            raise HTTPException(503, "Run python -m eval.backtest to generate the report")
        return request.app.state.report

    @app.get("/replay/{scenario}")
    def replay(
        request: Request,
        actor: Viewer,
        scenario: str,
        day: Annotated[int, Query(ge=0, le=30)] = 0,
    ):
        if not settings.demo or actor.role == "regulator":
            raise HTTPException(404, "Scenario not found")
        spec = request.app.state.scenarios.get(scenario)
        if spec is None:
            raise HTTPException(404, "Scenario not found")
        board = scoped_board(request, actor)
        district = actor.role == "district_public_health"
        units = {UNITS[u].district if district else u for u in spec["sites"]} & actor.units
        if not units:
            raise HTTPException(404, "Scenario not found")
        dataset = board.dataset
        first = dataset.dates.index(spec["start"])
        last = first + spec["duration_days"] - 1
        cursor = first - 5 + day
        if cursor > last + 5:
            raise HTTPException(422, "Day is outside this replay")
        syndrome = spec["syndrome"]

        def visible(hits):
            return [
                {
                    "day": hit.t - first + 5,
                    "id": board.alert_id(hit),
                    "unit_id": dataset.units[hit.u].id,
                    "syndrome": hit.syndrome,
                    "tier": hit.tier,
                    "start": dataset.dates[hit.t],
                }
                for hit in hits
                if first <= hit.t <= min(last, cursor)
                and hit.syndrome in (syndrome, "any")
                and dataset.units[hit.u].id in units
            ]

        return {
            "id": scenario,
            "title": spec["title"],
            "syndrome": syndrome,
            "data": "simulated",
            "day": day,
            "date": dataset.dates[cursor],
            "max_day": spec["duration_days"] + 9,
            "event_start_day": 5,
            "unit_ids": sorted(units),
            "signals": {
                unit.id: {
                    stream: board.signal(cursor, u, stream, settings.k)
                    for stream in (PRIMARY[syndrome], "absence", *HAZARDS)
                }
                for u, unit in enumerate(dataset.units)
                if unit.id in units
            },
            "markers": {
                "canary": visible(board.alerts),
                **{
                    key: visible(hits)
                    for key, hits in request.app.state.comparators[district].items()
                },
            },
        }

    @app.get("/compliance")
    def compliance(request: Request, actor: Viewer):
        if actor.role != "regulator":
            raise HTTPException(403, "Regulator role required")
        board = scoped_board(request, actor)
        t = max(0, len(board.dataset.dates) - 2)
        return [
            {
                "unit_id": unit.id,
                "date": board.dataset.dates[t],
                "scheduled_report_received": all(
                    board.signal(t, u, stream, settings.k)["status"] != "missing"
                    for stream in OUTCOMES
                ),
                "suppression_policy_active": True,
            }
            for u, unit in enumerate(board.dataset.units)
            if unit.id in actor.units
        ]

    @app.post("/ingest", response_model=Receipt)
    def ingest(request: Request, batch: Batch, token: Token):
        runtime = request.app.state.runtime
        if settings.demo:
            raise HTTPException(403, "Synthetic demo is read-only")
        actor = authenticate(token.credentials if token else None, runtime.credentials)
        if actor.role != "ingest":
            runtime.store.audit(actor, "ingest", "denied")
            raise HTTPException(403, "Ingest credential required")
        try:
            records: list[Aggregate] = batch.records
            return runtime.ingest(records, actor)
        except HTTPException:
            runtime.store.audit(actor, "ingest", "denied")
            raise

    return app


app = create_app()
