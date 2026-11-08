import hmac
import json
from dataclasses import dataclass

from fastapi import HTTPException

from backend.app.data.catalog import DISTRICTS, SITES

SITE_IDS = {site.id for site in SITES}
DISTRICT_IDS = {district.id for district in DISTRICTS}
ROLE_SCOPES = {
    "site_hse": SITE_IDS,
    "occupational_physician": SITE_IDS,
    "district_public_health": DISTRICT_IDS,
    "regulator": DISTRICT_IDS,
    "ingest": SITE_IDS | DISTRICT_IDS,
}


@dataclass(frozen=True)
class Actor:
    subject: str
    role: str
    units: frozenset[str]


DEMO_ROLES = {
    "site_hse": Actor("demo", "site_hse", frozenset({"site-07"})),
    "occupational_physician": Actor("demo", "occupational_physician", frozenset(SITE_IDS)),
    "district_public_health": Actor("demo", "district_public_health", frozenset({"al-ain"})),
    "regulator": Actor("demo", "regulator", frozenset(DISTRICT_IDS)),
}


def parse_credentials(config: str) -> dict[str, Actor]:
    result = {}
    subjects = set()
    for key, spec in json.loads(config).items():
        subject, role, units = spec["subject"], spec["role"], frozenset(spec["units"])
        if (
            len(key) < 24
            or not key.isascii()
            or not subject
            or subject in subjects
            or role not in ROLE_SCOPES
            or not units
            or not units <= ROLE_SCOPES[role]
            or (role == "site_hse" and len(units) != 1)
        ):
            raise ValueError("Invalid CANARY_API_KEYS configuration")
        subjects.add(subject)
        result[key] = Actor(subject, role, units)
    if not result:
        raise ValueError("CANARY_API_KEYS is required outside demo mode")
    return result


def authenticate(token: str | None, credentials: dict[str, Actor]) -> Actor:
    if token and token.isascii():
        for key, actor in credentials.items():
            if hmac.compare_digest(token, key):
                return actor
    raise HTTPException(
        401, "A valid bearer credential is required", headers={"WWW-Authenticate": "Bearer"}
    )
