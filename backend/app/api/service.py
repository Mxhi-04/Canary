import os
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from threading import RLock
from time import perf_counter
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd
from fastapi import HTTPException

from backend.app.api.schemas import Aggregate
from backend.app.data.catalog import (
    DISTRICTS,
    HAZARDS,
    OUTCOMES,
    SITES,
    STREAMS,
    UNITS,
    Dataset,
    district_view,
)
from backend.app.data.synthetic import WARMUP, generate
from backend.app.engine.baseline import Baseline, fit
from backend.app.engine.fusion import DEFAULT_THRESHOLD, Detection, Evidence, all_evidence, detect
from backend.app.engine.scan import scan
from backend.app.playbook.engine import recommendation
from backend.app.privacy.access import Actor, parse_credentials
from backend.app.privacy.storage import Store

DUBAI = ZoneInfo("Asia/Dubai")
HORIZON = 730


def today():
    return datetime.now(DUBAI).date()


@dataclass(frozen=True)
class Settings:
    demo: bool
    database: Path
    weather: Path
    k: int
    api_keys: str = "{}"
    origins: tuple[str, ...] = ()

    @classmethod
    def from_env(cls):
        demo = os.getenv("CANARY_DEMO", "1") == "1"
        origins = tuple(
            value.strip()
            for value in os.getenv("CANARY_CORS_ORIGINS", "").split(",")
            if value.strip()
        )
        return cls(
            demo,
            Path(os.getenv("CANARY_DATABASE", "var/canary.sqlite")),
            Path(os.getenv("CANARY_WEATHER_CACHE", "var/weather.parquet")),
            int(os.getenv("CANARY_SUPPRESSION_K", "5")),
            os.getenv("CANARY_API_KEYS", "{}"),
            origins or (("*",) if demo else ()),
        )


@dataclass
class Board:
    dataset: Dataset
    fitted: Baseline
    scores: dict[str, Evidence]
    alerts: list[Detection]
    rounded: np.ndarray
    late: frozenset[tuple[str, date, str]]

    @classmethod
    def build(cls, dataset, threshold, start, rounded=None, late=frozenset()):
        fitted = fit(dataset)
        scores = all_evidence(dataset, fitted)
        if rounded is None:
            rounded = np.zeros(dataset.values.shape, dtype=bool)
        return cls(
            dataset, fitted, scores, detect(scores, threshold, start), rounded, frozenset(late)
        )

    def alert_id(self, hit):
        return (
            f"{self.dataset.units[hit.u].id}.{hit.syndrome}.{self.dataset.dates[hit.t]}.{hit.tier}"
        )

    def summary(self, hit):
        completeness = float(
            np.mean([valid[hit.t, hit.u] for valid in self.scores[hit.syndrome].available.values()])
        )
        return {
            "id": self.alert_id(hit),
            "unit_id": self.dataset.units[hit.u].id,
            "syndrome": hit.syndrome,
            "tier": hit.tier,
            "start": self.dataset.dates[hit.t],
            "completeness": round(completeness, 3),
            "confidence": "higher"
            if completeness == 1
            else "reduced"
            if completeness >= 0.5
            else "low",
        }

    def signal(self, t, u, stream, k):
        idx = STREAMS.index(stream)
        observed = self.dataset.values[t, u, idx]
        point = {"date": self.dataset.dates[t]}
        if (self.dataset.units[u].id, self.dataset.dates[t], stream) in self.late:
            point["reported_late"] = True
        if not np.isfinite(observed):
            return {**point, "status": "missing"}
        if stream in HAZARDS:
            return {**point, "status": "available", "observed": round(float(observed), 3)}
        if observed < k:
            return {**point, "status": "suppressed"}
        if self.rounded[t, u, idx]:
            lower = int(observed // k) * k
            return {**point, "status": "rolled_up", "observed_band": [lower, lower + k - 1]}
        point.update(status="available", observed=int(observed))
        if idx < len(OUTCOMES) and np.isfinite(self.fitted.expected[t, u, idx]):
            point.update(self.fitted.diagnostics(observed, t, u, idx))
        return point

    def detail(self, hit, actor, k):
        t, u = hit.t, hit.u
        score = self.scores[hit.syndrome]
        contributions = []
        for stream, terms in score.terms.items():
            if stream == "hazard_prior":
                hazards = {
                    name: self.signal(t, u, name, k) for name in score.available if name in HAZARDS
                }
                present = any(point["status"] == "available" for point in hazards.values())
                contributions.append(
                    {
                        "stream": stream,
                        "contribution": round(float(terms[t, u]), 3) if present else None,
                        "status": "available" if present else "missing",
                        "inputs": hazards,
                    }
                )
            else:
                point = self.signal(t, u, stream, k)
                contributions.append(
                    {
                        "stream": stream,
                        **point,
                        "contribution": round(float(terms[t, u]), 3)
                        if point["status"] == "available" and score.available[stream][t, u]
                        else None,
                    }
                )
        return {
            **self.summary(hit),
            "contributions": contributions,
            **scan(self.dataset, self.fitted, hit, set(actor.units), k, rounded=self.rounded),
            "recommendation": recommendation(hit.syndrome, hit.tier, self.dataset.dates[t]),
            "data_availability": {
                name: bool(values[t, u]) for name, values in score.available.items()
            },
        }


class Runtime:
    def __init__(self, settings, threshold):
        if not 2 <= settings.k <= 100:
            raise ValueError("CANARY_SUPPRESSION_K must be between 2 and 100")
        if not settings.demo and "*" in settings.origins:
            raise ValueError("Authenticated mode requires an explicit CORS allowlist")
        self.settings = settings
        self.threshold = threshold
        self.store = Store(settings.database)
        self.lock = RLock()
        self.credentials = {} if settings.demo else parse_credentials(settings.api_keys)
        self.snapshot = None
        self.signature = None
        if settings.demo:
            dataset, self.events = generate(43, "demo")
            self.snapshot = self._build(dataset, WARMUP)
        else:
            self.current()

    def _build(self, dataset, start, late=frozenset()):
        district = district_view(dataset)
        rounded = np.zeros(district.values.shape, dtype=bool)
        district_late = set()
        day_index = {day: t for t, day in enumerate(dataset.dates)}
        for d, unit in enumerate(DISTRICTS):
            members = [i for i, site in enumerate(SITES) if site.district == unit.id]
            rounded[:, d, : len(OUTCOMES)] = (
                ~np.isfinite(dataset.values[:, members, : len(OUTCOMES)])
                | (dataset.values[:, members, : len(OUTCOMES)] < self.settings.k)
            ).any(axis=1)
            for key_unit, day, stream in late:
                if UNITS[key_unit].district != unit.id:
                    continue
                if stream == "teleconsult":
                    district_late.add((unit.id, day, stream))
                    continue
                constituent = dataset.values[day_index[day], members, STREAMS.index(stream)]
                complete = np.isfinite(constituent).all()
                if complete == (key_unit != unit.id):
                    district_late.add((unit.id, day, stream))
        return (
            Board.build(dataset, self.threshold, start, late=late),
            Board.build(district, self.threshold, start, rounded, district_late),
        )

    def _weather_signature(self):
        try:
            return self.settings.weather.stat().st_mtime_ns
        except FileNotFoundError:
            return None

    def current(self):
        if self.settings.demo:
            return self.snapshot
        signature = (today(), self._weather_signature())
        if signature != self.signature:
            with self.lock:
                signature = (today(), self._weather_signature())
                if signature != self.signature:
                    day, _ = signature
                    records, late = self.store.load(day - timedelta(days=HORIZON - 1))
                    self.snapshot = self._build(self._live_dataset(day, records), 0, late)
                    self.signature = signature
        return self.snapshot

    def _live_dataset(self, day, records):
        earliest = min((key[1] for key in records), default=day)
        if self.settings.weather.exists():
            weather = pd.read_parquet(self.settings.weather)
            for row in weather.itertuples(index=False):
                if day - timedelta(days=HORIZON - 1) <= row.date <= day:
                    earliest = min(earliest, row.date)
                    for site in SITES:
                        if site.district == row.district:
                            for stream in HAZARDS:
                                records[(site.id, row.date, stream)] = getattr(row, stream)
        dates = tuple(earliest + timedelta(days=i) for i in range((day - earliest).days + 1))
        values = np.full((len(dates), len(SITES), len(STREAMS)), np.nan)
        calls = np.full((len(dates), len(DISTRICTS)), np.nan)
        district_counts = np.full((len(dates), len(DISTRICTS), len(OUTCOMES)), np.nan)
        site_ids = {site.id: i for i, site in enumerate(SITES)}
        district_ids = {district.id: i for i, district in enumerate(DISTRICTS)}
        for (unit, when, stream), count in records.items():
            t = (when - earliest).days
            if stream == "teleconsult":
                calls[t, district_ids[unit]] = count
            elif unit in district_ids:
                district_counts[t, district_ids[unit], OUTCOMES.index(stream)] = count
            else:
                values[t, site_ids[unit], STREAMS.index(stream)] = count
        return Dataset(dates, SITES, values, calls, district_counts)

    def ingest(self, records: list[Aggregate], actor: Actor):
        now = today()
        cutoff = now - timedelta(days=HORIZON - 1)
        updates = {}
        for record in records:
            if record.unit not in actor.units:
                raise HTTPException(403, "Feed credential does not cover that unit")
            district = any(unit.id == record.unit for unit in DISTRICTS)
            if record.category == "teleconsult" and not district:
                raise HTTPException(422, "Teleconsult is district-level")
            if not cutoff <= record.date <= now:
                raise HTTPException(422, "Date is outside the retained reporting window")
            key = (record.unit, record.date, record.category)
            if key in updates:
                raise HTTPException(422, "Duplicate unit, date and category in batch")
            updates[key] = record.count

        started = perf_counter()
        with self.lock:
            signature = (now, self._weather_signature())
            previous, late = self.store.load(cutoff)
            if any(previous.get(key) != value for key, value in updates.items()):
                late.update(
                    key
                    for key in updates
                    if key not in previous and key[1] < now - timedelta(days=1)
                )
                updated = self._build(self._live_dataset(now, previous | updates), 0, late)
                self.store.save(updates, actor, cutoff, now)
                self.snapshot, self.signature = updated, signature
            else:
                self.store.audit(actor, "ingest", "unchanged")
        return {
            "accepted": len(updates),
            "scoring_latency_ms": round((perf_counter() - started) * 1000, 2),
        }


def report_threshold(report):
    return float(report.get("threshold", DEFAULT_THRESHOLD))
