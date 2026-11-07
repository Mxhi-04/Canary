from datetime import timedelta
from pathlib import Path

import yaml

PLAYBOOK = yaml.safe_load(Path(__file__).with_name("handoff.yaml").read_text())


def recommendation(syndrome, tier, day):
    entry = PLAYBOOK[syndrome]
    step = entry["tiers"][tier]
    return {
        "action": step["action"],
        "owner_role": step["owner"],
        "review_by": (day + timedelta(days=step["days"])).isoformat(),
        "evidence": entry["evidence"],
        "assumptions": entry["assumptions"],
        "escalation_path": entry["escalation"],
        "requires_human_signoff": True,
    }
