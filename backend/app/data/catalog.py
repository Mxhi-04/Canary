from dataclasses import dataclass
from datetime import date

import numpy as np

OUTCOMES = (
    "absence",
    "clinic_respiratory",
    "clinic_gi",
    "first_aid_heat",
    "near_miss",
    "clinic_injury",
)
HAZARDS = ("pm2_5", "pm10", "dust", "wbgt_proxy")
STREAMS = OUTCOMES + HAZARDS + ("teleconsult",)
SYNDROMES = ("respiratory", "gi", "heat")
PRIMARY = dict(zip(SYNDROMES, OUTCOMES[1:4], strict=True))


@dataclass(frozen=True)
class Unit:
    id: str
    name: str
    district: str
    kind: str
    headcount: int
    lat: float
    lon: float


DISTRICT_POINTS = {
    "abu-dhabi": ("Abu Dhabi", 24.4539, 54.3773),
    "mussafah": ("Mussafah", 24.3443, 54.4884),
    "al-ain": ("Al Ain", 24.1917, 55.7606),
    "dubai": ("Dubai", 25.2048, 55.2708),
}
SITE_TYPES = ("accommodation", "construction", "logistics", "office")
SITES = tuple(
    Unit(
        f"site-{d * 3 + i + 1:02}",
        f"{name} {SITE_TYPES[(d + i) % 4].title()}",
        district,
        SITE_TYPES[(d + i) % 4],
        320 + ((d * 3 + i) * 137) % 550,
        lat + (i - 1) * 0.012,
        lon + (i - 1) * 0.011,
    )
    for d, (district, (name, lat, lon)) in enumerate(DISTRICT_POINTS.items())
    for i in range(3)
)
DISTRICTS = tuple(
    Unit(
        district,
        name,
        district,
        "district",
        sum(site.headcount for site in SITES if site.district == district),
        lat,
        lon,
    )
    for district, (name, lat, lon) in DISTRICT_POINTS.items()
)
UNITS = {unit.id: unit for unit in (*SITES, *DISTRICTS)}

# Shared transport links connect a few sites across district boundaries.
LINKS = {
    frozenset(pair)
    for pair in (
        ("site-01", "site-02"),
        ("site-02", "site-03"),
        ("site-03", "site-04"),
        ("site-04", "site-05"),
        ("site-07", "site-09"),
        ("site-08", "site-10"),
        ("site-11", "site-12"),
    )
}


@dataclass
class Dataset:
    dates: tuple[date, ...]
    units: tuple[Unit, ...]
    values: np.ndarray
    teleconsult: np.ndarray | None = None
    district_outcomes: np.ndarray | None = None

    def stream(self, name: str) -> np.ndarray:
        return self.values[:, :, STREAMS.index(name)]


def district_view(dataset: Dataset) -> Dataset:
    """Publish only complete sums from fixed district membership."""
    values = np.full((len(dataset.dates), len(DISTRICTS), len(STREAMS)), np.nan)
    for d, district in enumerate(DISTRICTS):
        members = [i for i, unit in enumerate(dataset.units) if unit.district == district.id]
        if not members:
            continue
        counts = dataset.values[:, members, : len(OUTCOMES)]
        total = counts.sum(axis=1)
        if dataset.district_outcomes is not None:
            total = np.where(np.isfinite(total), total, dataset.district_outcomes[:, d, :])
        values[:, d, : len(OUTCOMES)] = total
        hazards = dataset.values[:, members, len(OUTCOMES) : -1]
        # Weather is modelled at district resolution and can be shared across sites.
        present = np.isfinite(hazards).any(axis=1)
        maximum = np.max(np.where(np.isfinite(hazards), hazards, -np.inf), axis=1)
        values[:, d, len(OUTCOMES) : -1] = np.where(present, maximum, np.nan)
    if dataset.teleconsult is not None:
        values[:, :, -1] = dataset.teleconsult
    return Dataset(dataset.dates, DISTRICTS, values)
