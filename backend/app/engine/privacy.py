"""
Canary Privacy & Governance Engine
Enforces:
1. Canonical aggregate-only ingestion contract:
   { "unit_id": str, "observed_on": date, "stream": str, "count": int }
2. Rejection of prohibited personal identifiers:
   (e.g. person_name, national_id, emirates_id, patient_id, disciplinary_record).
3. Small-cell suppression:
   Any count 1 <= count < k is suppressed to prevent re-identification.
"""

from typing import Any

PROHIBITED_PERSON_LEVEL_FIELDS = {
    "person_name",
    "name",
    "national_id",
    "emirates_id",
    "eid",
    "patient_id",
    "mrn",
    "medical_record_number",
    "phone",
    "email",
    "dob",
    "date_of_birth",
    "ssn",
    "disciplinary_record",
    "performance_rating",
    "salary",
}


class PrivacyEngine:
    DEFAULT_K_THRESHOLD = 5

    @classmethod
    def validate_ingest_payload(cls, record: dict[str, Any]) -> tuple[bool, list[str]]:
        """
        Validates aggregate record. Rejects immediately if prohibited person-level fields appear.
        """
        violations: list[str] = []

        # Check prohibited fields
        for field in record:
            normalized = field.strip().lower().replace("-", "_").replace(" ", "_")
            if normalized in PROHIBITED_PERSON_LEVEL_FIELDS:
                violations.append(
                    f"Prohibited person-level field detected: '{field}'. Canary enforces aggregate-only ingestion."
                )

        # Check required aggregate contract fields
        required = ["unit_id", "observed_on", "stream", "count"]
        for req in required:
            if req not in record:
                violations.append(f"Missing mandatory aggregate contract field: '{req}'")

        # Check count format
        if "count" in record:
            try:
                c = int(record["count"])
                if c < 0:
                    violations.append("Aggregate count cannot be negative")
            except (ValueError, TypeError):
                violations.append("Field 'count' must be an integer")

        is_valid = len(violations) == 0
        return is_valid, violations

    @classmethod
    def apply_small_cell_suppression(
        cls, count: int, k_threshold: int = DEFAULT_K_THRESHOLD
    ) -> dict[str, Any]:
        """
        Applies small-cell suppression.
        If count is 0: returns 0.
        If 1 <= count < k: returns suppressed marker with label f'<{k}'.
        If count >= k: returns actual count.
        """
        if count == 0:
            return {"display_value": "0", "suppressed": False, "raw_count": 0}

        if 1 <= count < k_threshold:
            return {
                "display_value": f"<{k_threshold}",
                "suppressed": True,
                "threshold_k": k_threshold,
                "reason": f"Small-cell suppression enforced (k={k_threshold}) to protect workforce confidentiality.",
            }

        return {"display_value": str(count), "suppressed": False, "raw_count": count}
