"""Render validation charts from the held-out report."""

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

LABELS = {
    "ears_c2": "Absence EARS C2",
    "clinic_cusum": "Clinic CUSUM",
    "fixed_hazard": "Fixed hazard",
    "without_environment": "Environment missing",
    "without_clinic": "Clinic missing",
    "without_workplace": "Workplace missing",
    "district_only": "District only",
    "reporting_delay_2d": "Two-day reporting delay",
    "extra_noise_30pct": "30% extra noise",
}


def render(report, output_dir):
    plt.rcParams.update({"svg.hashsalt": "canary", "font.size": 10, "svg.fonttype": "none"})
    fig, (left, right) = plt.subplots(1, 2, figsize=(10.5, 4.0), layout="constrained")
    leads = report["lead_time"]
    names = list(leads)
    medians = [leads[name]["median_days"] for name in names]
    positions = range(len(names))
    left.barh(positions, [value or 0 for value in medians], color="#31746b")
    left.set_yticks(list(positions), [LABELS[name] for name in names])
    left.invert_yaxis()
    left.axvline(0, color="#334155", lw=0.8)
    left.set_xlim(
        min(-2, min(value or 0 for value in medians) - 1),
        max(2, max(value or 0 for value in medians) + 1.65),
    )
    left.set_title("Paired lead time")
    left.set_xlabel("Median days earlier for Canary")
    for i, name in enumerate(names):
        label = (
            f"{medians[i]:+g} d  |  n={leads[name]['paired_events']}"
            if (medians[i] is not None)
            else "No paired events"
        )
        left.text(max(0, medians[i] or 0) + 0.10, i, label, va="center", fontsize=9)

    ablations = report["ablations"]
    labels = list(ablations)
    right.barh(
        range(len(labels)),
        [100 * ablations[name]["sensitivity"] for name in labels],
        color="#82a89a",
    )
    right.set_yticks(range(len(labels)), [LABELS[name] for name in labels])
    right.invert_yaxis()
    right.axvline(
        100 * report["comparators"]["canary"]["sensitivity"],
        color="#1e524a",
        ls="--",
        label="All feeds",
    )
    right.set(
        xlim=(0, 100), title="Sensitivity under degraded inputs", xlabel="Events detected (%)"
    )
    right.legend(loc="upper center", bbox_to_anchor=(0.5, -0.15), frameon=False)
    for axis in (left, right):
        axis.spines[["top", "right"]].set_visible(False)
    fig.suptitle("Canary  /  Held-out simulated surveillance", fontsize=14, weight="bold")
    chart = output_dir / "validation.svg"
    fig.savefig(chart, metadata={"Date": None})
    plt.close(fig)
    chart.write_text("\n".join(line.rstrip() for line in chart.read_text().splitlines()) + "\n")
