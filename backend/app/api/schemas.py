from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt

Role = Literal["site_hse", "occupational_physician", "district_public_health", "regulator"]
Tier = Literal["Watch", "Alert", "Action"]
Category = Literal[
    "absence",
    "clinic_respiratory",
    "clinic_gi",
    "first_aid_heat",
    "near_miss",
    "clinic_injury",
    "teleconsult",
]


class Aggregate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    unit: str = Field(pattern=r"^[a-z0-9-]{1,40}$")
    date: date
    category: Category
    count: StrictInt = Field(ge=0, le=100_000)


class Batch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    records: list[Aggregate] = Field(min_length=1, max_length=2_000)


class Receipt(BaseModel):
    accepted: int
    scoring_latency_ms: float


class UnitView(BaseModel):
    id: str
    name: str
    district: str
    kind: str
    latitude: float
    longitude: float


class SignalPoint(BaseModel):
    date: date
    status: Literal["available", "missing", "suppressed", "rolled_up"]
    observed: int | float | None = None
    observed_band: tuple[int, int] | None = None
    expected: float | None = None
    expected_band: tuple[int, int] | None = None
    p_value: float | None = None
    z: float | None = None
    dispersion: float | None = None
    reported_late: bool | None = None


class AlertSummary(BaseModel):
    id: str
    unit_id: str
    syndrome: str
    tier: Tier
    start: date
    completeness: float
    confidence: Literal["higher", "reduced", "low"]


class SignalSeries(BaseModel):
    unit_id: str
    stream: str
    source: str
    points: list[SignalPoint]


class EvidenceLink(BaseModel):
    title: str
    url: str


class Recommendation(BaseModel):
    action: str
    owner_role: str
    review_by: date
    evidence: list[EvidenceLink]
    assumptions: list[str]
    escalation_path: str
    requires_human_signoff: bool


class Zone(BaseModel):
    unit_ids: list[str]
    label: str


class ScanWindow(BaseModel):
    start: date = Field(alias="from")
    end: date = Field(alias="to")


class AlertDetail(AlertSummary):
    contributions: list[dict]
    zone: Zone
    window: ScanWindow
    scan: dict
    recommendation: Recommendation
    data_availability: dict[str, bool]
