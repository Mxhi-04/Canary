import numpy as np

from backend.app.data.catalog import Dataset
from backend.app.engine.baseline import Baseline
from backend.app.engine.fusion import CLINIC_INDEX, HAZARD_CUTS, HAZARD_STREAMS

NAMES = ("ears_c2", "clinic_cusum", "fixed_hazard")


def comparator_days(dataset: Dataset, baseline: Baseline, syndrome: str):
    absence = dataset.stream("absence")
    ears = np.zeros_like(absence, dtype=bool)
    for t in range(9, len(absence)):
        history = absence[t - 9 : t - 2]
        complete = np.isfinite(history).all(axis=0)
        threshold = history.mean(axis=0) + 3 * np.maximum(history.std(axis=0, ddof=1), 1)
        ears[t] = complete & (absence[t] > threshold)

    clinic = dataset.values[:, :, CLINIC_INDEX[syndrome]]
    mean = baseline.expected[:, :, CLINIC_INDEX[syndrome]]
    alpha = baseline.alpha[:, :, CLINIC_INDEX[syndrome]]
    residual = (clinic - mean) / np.sqrt(mean + alpha * mean**2)
    cusum = np.zeros_like(ears)
    score = np.zeros(absence.shape[1])
    for t in range(len(absence)):
        valid = np.isfinite(residual[t])
        score = np.where(valid, np.maximum(0, score + residual[t] - 0.75), score)
        cusum[t] = valid & (score >= 5)
        score[cusum[t]] = 0

    hazard = np.zeros_like(ears)
    for stream in HAZARD_STREAMS[syndrome]:
        hazard |= dataset.stream(stream) >= HAZARD_CUTS[stream][1]
    return dict(zip(NAMES, (ears, cusum, hazard), strict=True))
