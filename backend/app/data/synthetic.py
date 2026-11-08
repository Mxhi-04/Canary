from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import yaml

from backend.app.data.catalog import (
    DISTRICTS,
    OUTCOMES,
    PRIMARY,
    SITES,
    STREAMS,
    SYNDROMES,
    Dataset,
)

SCENARIO_DIR = Path(__file__).resolve().parents[3] / "eval" / "scenarios"
START = date(2024, 11, 1)
DAYS = 730
WARMUP = 365
RAMADAN = (
    (date(2025, 3, 1), date(2025, 3, 29)),
    (date(2026, 2, 18), date(2026, 3, 18)),
)
EID = (
    (date(2025, 3, 30), date(2025, 4, 1)),
    (date(2025, 6, 6), date(2025, 6, 8)),
    (date(2026, 3, 19), date(2026, 3, 21)),
    (date(2026, 5, 26), date(2026, 5, 28)),
)
PROFILES = {
    "calibration": {"season": 1.0, "noise": 0.10, "size": (0.90, 1.65), "outage": 0.008},
    "test": {"season": 1.20, "noise": 0.14, "size": (0.75, 1.70), "outage": 0.016},
    "demo": {"season": 1.0, "noise": 0.10, "size": (0.90, 1.60), "outage": 0.005},
}


@dataclass(frozen=True)
class Event:
    id: str
    syndrome: str
    units: tuple[str, ...]
    start: int
    end: int
    clinical_day: int | None


def calendar_flags(dates: tuple[date, ...]) -> tuple[np.ndarray, np.ndarray]:
    ramadan = np.array([any(a <= day <= b for a, b in RAMADAN) for day in dates])
    holiday = np.array(
        [
            (day.month, day.day) in {(1, 1), (12, 2), (12, 3)} or any(a <= day <= b for a, b in EID)
            for day in dates
        ]
    )
    return ramadan, holiday


def named_scenarios() -> dict:
    return {
        path.stem: yaml.safe_load(path.read_text()) for path in sorted(SCENARIO_DIR.glob("*.yaml"))
    }


def generate(seed: int, profile: str) -> tuple[Dataset, list[Event]]:
    cfg = PROFILES[profile]
    rng = np.random.default_rng(seed)
    dates = tuple(START + timedelta(days=i) for i in range(DAYS))
    seasonal = np.cos(2 * np.pi * (np.arange(DAYS) - 45) / 365.25)
    weekend = np.array([day.weekday() >= 5 for day in dates])
    ramadan, holiday = calendar_flags(dates)
    size = np.array([site.headcount for site in SITES]) / 500
    site_mix = rng.uniform(0.80, 1.22, (len(SITES), len(OUTCOMES)))
    base = np.array([8.5, 3.2, 2.25, 1.8, 3.1, 1.35])
    means = (base * size[:, None] * site_mix)[None, :, :] * (
        1
        + seasonal[:, None, None]
        * cfg["season"]
        * np.array([0.10, 0.24, 0.05, -0.34, -0.10, -0.09])
    )
    means[weekend] *= np.array([0.63, 0.91, 0.93, 0.74, 0.69, 0.71])
    means[ramadan] *= np.array([1.08, 1, 1.17, 0.89, 0.95, 0.92])
    means[holiday] *= np.array([1.27, 0.83, 1.05, 0.73, 0.74, 0.79])
    noise = np.full(len(SITES), cfg["noise"])
    noise[8] *= 2.4
    shape = 1 / noise[None, :, None]
    counts = rng.negative_binomial(shape, shape / (shape + means)).astype(float)

    values = np.full((DAYS, len(SITES), len(STREAMS)), np.nan)
    values[:, :, : len(OUTCOMES)] = counts
    district_for_site = [
        next(i for i, d in enumerate(DISTRICTS) if d.id == s.district) for s in SITES
    ]
    air = np.maximum(4, rng.lognormal(2.9, 0.29, (DAYS, len(DISTRICTS))))
    heat = 25.5 - 6.7 * seasonal[:, None] + rng.normal(0, 1.05, air.shape)
    values[:, :, 6:10] = np.stack(
        (
            air,
            air * 2.2,
            air * 1.35,
            heat,
        ),
        axis=-1,
    )[:, district_for_site, :]
    teleconsult = rng.poisson(12 + 2 * seasonal[:, None], size=air.shape).astype(float)

    events = []
    specs = named_scenarios() if profile == "demo" else {}
    for name, spec in specs.items():
        events.append(
            _inject(
                values,
                teleconsult,
                rng,
                name,
                spec["syndrome"],
                tuple(spec["sites"]),
                (spec["start"] - START).days,
                spec["duration_days"],
                spec["severity"],
                spec["outcome_lag_days"],
                spec["ramp"],
            )
        )
    occupied = {
        (unit, t)
        for event in events
        for unit in event.units
        for t in range(event.start - 6, event.end + 7)
    }
    for i in range(48 - len(events)):
        syndrome = SYNDROMES[i % len(SYNDROMES)]
        duration = int(rng.integers(6, 13))
        while True:
            start = int(rng.integers(WARMUP + 10, DAYS - 14))
            site = int(rng.integers(len(SITES)))
            units = [SITES[site].id]
            if rng.random() < 0.42:
                peer = next(
                    s.id
                    for s in SITES[site + 1 :] + SITES[:site]
                    if s.district == SITES[site].district
                )
                units.append(peer)
            window = {(unit, t) for unit in units for t in range(start - 5, start + duration + 6)}
            if not (occupied & window):
                occupied |= window
                break
        events.append(
            _inject(
                values,
                teleconsult,
                rng,
                f"{profile}-{i + 1:02}",
                syndrome,
                tuple(units),
                start,
                duration,
                float(rng.uniform(*cfg["size"])),
                int(rng.integers(1, 4)),
                str(rng.choice(["gradual", "stepped", "fast"])),
            )
        )

    # Unrelated dust and heat episodes challenge the environment-only comparator.
    # They can overlap an event by chance but do not inject health outcomes.
    for _ in range(30):
        t = int(rng.integers(WARMUP, DAYS - 3))
        district = int(rng.integers(len(DISTRICTS)))
        members = [i for i, d in enumerate(district_for_site) if d == district]
        for offset in range(int(rng.integers(1, 4))):
            if rng.random() < 0.65:
                values[t + offset, members, 6:9] += rng.uniform(0.65, 1.45) * np.array([43, 95, 70])
            else:
                values[t + offset, members, 9] += rng.uniform(4, 9)

    outcomes = values[:, :, : len(OUTCOMES)]
    outcomes[rng.random(outcomes.shape) < cfg["outage"]] = np.nan
    values[510:513, 8, : len(OUTCOMES)] = np.nan
    values[589:592, 4, 6:10] = np.nan
    # Single late daily report appears as unavailable in the replay extract.
    for t, s in zip(rng.integers(WARMUP, DAYS, 20), rng.integers(0, len(SITES), 20)):
        outcomes[t, s, 1:4] = np.nan
    teleconsult[rng.random(teleconsult.shape) < cfg["outage"]] = np.nan
    return Dataset(dates, SITES, values, teleconsult), sorted(events, key=lambda e: e.start)


def _inject(values, teleconsult, rng, name, syndrome, units, start, duration, size, lag, ramp):
    primary = STREAMS.index(PRIMARY[syndrome])
    clinical_day = None
    for offset in range(duration):
        health = 0.0
        for member, unit_id in enumerate(units):
            site = next(i for i, unit in enumerate(SITES) if unit.id == unit_id)
            t = start + offset
            if syndrome == "respiratory":
                values[t, site, 6:9] += size * np.array([34, 80, 54])
            if syndrome == "heat":
                values[t, site, 9] += 4.0 + size * 3.8
            age = offset - lag - member
            if age < 0:
                continue
            scale = {
                "fast": 1.2,
                "stepped": 0.60 if age < 2 else 1.35,
                "gradual": min(1.55, 0.42 + age * 0.25),
            }[ramp] * size
            excess = rng.poisson(scale * (7.7 if syndrome == "gi" else 6.9))
            values[t, site, primary] += excess
            values[t, site, 0] += rng.poisson(scale * max(0.5, age - 1.5) * 2.1)
            if syndrome == "heat":
                values[t, site, 4] += rng.poisson(scale * 3.3)
            district = next(
                d for d, unit in enumerate(DISTRICTS) if unit.id == SITES[site].district
            )
            teleconsult[t, district] += rng.poisson(scale * 2)
            health += excess
        if health >= 12 and clinical_day is None:
            clinical_day = start + offset
    return Event(name, syndrome, units, start, start + duration - 1, clinical_day)
