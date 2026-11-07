"""Fetch Open-Meteo forecast or archive data into the hazard adapter's Parquet cache."""

import argparse
import fcntl
import os
from datetime import UTC, date, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile

import httpx
import numpy as np
import pandas as pd

from backend.app.data.catalog import DISTRICTS, HAZARDS

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
WEATHER_FIELDS = ("temperature_2m", "relative_humidity_2m")
AIR_FIELDS = HAZARDS[:-1]
MIN_HOURS = 18
ATTRIBUTION = "Open-Meteo; Copernicus Atmosphere Monitoring Service (CAMS), ECMWF"


def wbgt_proxy(temperature, humidity):
    vapor_pressure = (humidity / 100) * 6.105 * np.exp(17.27 * temperature / (237.7 + temperature))
    return 0.567 * temperature + 0.393 * vapor_pressure + 3.94


def _request(client, url, fields, params):
    response = client.get(url, params={**params, "hourly": ",".join(fields)})
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list) or len(payload) != len(DISTRICTS):
        raise ValueError("Open-Meteo returned an unexpected set of locations")
    frames = []
    for unit, result in zip(DISTRICTS, payload, strict=True):
        hourly = result["hourly"]
        frame = pd.DataFrame({field: hourly[field] for field in fields}, dtype=float)
        frame["time"] = pd.to_datetime(hourly["time"])
        frame["district"] = unit.id
        frames.append(frame)
    return pd.concat(frames, ignore_index=True)


def refresh(cache: Path, start: date | None = None, end: date | None = None):
    if (start is None) != (end is None):
        raise ValueError("Provide both archive dates or use forecast mode")
    if start is not None and (not 0 <= (end - start).days <= 30 or start < date(2022, 8, 1)):
        raise ValueError("Archive requests cover up to 31 days starting August 2022 or later")
    params = {
        "latitude": ",".join(str(unit.lat) for unit in DISTRICTS),
        "longitude": ",".join(str(unit.lon) for unit in DISTRICTS),
        "timezone": "Asia/Dubai",
    }
    time_range = {"start_date": str(start), "end_date": str(end)} if start else {"forecast_days": 5}
    with httpx.Client(timeout=30, transport=httpx.HTTPTransport(retries=2)) as client:
        weather = _request(
            client, ARCHIVE_URL if start else FORECAST_URL, WEATHER_FIELDS, {**params, **time_range}
        )
        air = _request(
            client, AIR_URL, AIR_FIELDS, {**params, **time_range, "domains": "cams_global"}
        )
    hourly = weather.merge(air, on=["time", "district"], how="outer", validate="one_to_one")
    hourly["wbgt_proxy"] = wbgt_proxy(hourly["temperature_2m"], hourly["relative_humidity_2m"])
    hourly["date"] = hourly["time"].dt.date
    grouped = hourly.groupby(["district", "date"])[list(HAZARDS)]
    daily = grouped.agg({**dict.fromkeys(AIR_FIELDS, "mean"), "wbgt_proxy": "max"})
    daily = daily.where(grouped.count() >= MIN_HOURS).reset_index()
    daily["source"] = "archive" if start else "forecast"
    daily["fetched_at"] = datetime.now(UTC)

    cache.parent.mkdir(parents=True, exist_ok=True)
    with cache.with_suffix(".lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        previous = pd.read_parquet(cache) if cache.exists() else None
        if previous is not None:
            daily = pd.concat([previous, daily], ignore_index=True)
        daily = (
            daily.sort_values(["source", "fetched_at"], ascending=[False, True])
            .drop_duplicates(["district", "date"], keep="last")
            .sort_values(["district", "date"])
        )
        with NamedTemporaryFile(dir=cache.parent, suffix=".parquet", delete=False) as temp:
            temporary_path = Path(temp.name)
        try:
            daily.to_parquet(temporary_path, index=False)
            os.replace(temporary_path, cache)
        finally:
            temporary_path.unlink(missing_ok=True)
    return daily


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--cache", type=Path, default=Path(os.getenv("CANARY_WEATHER_CACHE", "var/weather.parquet"))
    )
    parser.add_argument("--start", type=date.fromisoformat)
    parser.add_argument("--end", type=date.fromisoformat)
    args = parser.parse_args()
    try:
        result = refresh(args.cache, args.start, args.end)
    except (ValueError, KeyError, httpx.HTTPError) as error:
        parser.exit(1, f"Weather refresh failed: {error}\n")
    print(f"Cached {len(result)} district-days at {args.cache}. Source: {ATTRIBUTION}.")


if __name__ == "__main__":
    main()
