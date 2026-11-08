"""Ensure committed metrics match a new backtest, excluding machine-dependent timings."""

import json
import sys
from pathlib import Path

golden = json.loads(Path("eval/reports/summary.json").read_text())
fresh = json.loads(Path(sys.argv[1]).read_text())
for report in (golden, fresh):
    report.pop("latency_ms")
assert golden == fresh, "Backtest results differ from the committed report"
assert (
    fresh["comparators"]["canary"]["false_alerts_per_unit_month"]
    <= fresh["false_alert_budget_per_site_month"]
)
