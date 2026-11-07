# Model Card: Canary Detection Engine

**Model Name:** Canary Multi-Signal Early-Warning Engine  
**Version:** 1.0 (Prototype)  
**Date:** November 2026  
**Type:** Statistical Anomaly Detection & Bayesian Evidence Fusion  

---

## 1. Intended Use

### Primary Intended Uses
- Detecting emerging population and workforce health risk clusters across industrial facilities, construction projects, logistics hubs, and worker accommodations.
- Decision support for Occupational Health leads, Site HSE officers, and District Public Health coordinators.
- Providing transparent, explainable evidence (observed vs. expected baselines, contributing streams, and persistence indicators).

### Out-of-Scope & Prohibited Uses
- Individual-level diagnosis, prognosis, or medical triage.
- Employee performance monitoring, discipline, or individual attendance profiling.
- Automated dispatch of emergency interventions without human validation.

---

## 2. Methodology & Signal Fusion

Canary implements a two-stage fusion model:
1. **Expected Baseline (Stage 1):** Rolling 12-month negative-binomial Generalized Linear Model (GLM) accounting for day-of-week patterns, annual seasonality, and public holiday shifts.
2. **Multi-Signal Evidence Fusion (Stage 2):**
   - Environmental hazard signals (PM2.5, ambient temperature, WBGT) formulate an empirical prior risk.
   - Syndromic outcome signals (clinic encounters, sickness absence, teleconsultation queries) provide confirmatory posterior likelihood.
   - Correlated streams within the same reporting domain are discounted by a correlation attenuation factor ($r=0.45$) to prevent double-counting.
   - Individual stream contributions are capped at 60% of total score to prevent a single noisy feed from dominating the system.

---

## 3. Evaluation & Performance

Evaluated against single-signal baselines on held-out synthetic test seeds (Calibration Seed 42, Test Seed 108):

| Metric | EARS C2 (Absence Only) | CUSUM (Clinic Only) | Fixed Threshold (Hazard) | Canary Fusion |
|---|---|---|---|---|
| **Event-Level Sensitivity** | 68.2% | 74.5% | 62.0% | **91.8%** |
| **Lead Time (vs Clinical Threshold)** | -0.4 days | +0.8 days | +1.2 days | **+2.9 days** |
| **Alert-Level PPV** | 64.0% | 71.3% | 58.6% | **86.4%** |
| **False Alerts / Site-Month** | 1.82 | 1.45 | 2.10 | **0.74** |

---

## 4. Limitations & Caveats

- **Simulated Outcome Ground Truth:** Syndromic health encounters in the prototype are simulated to enable repeatable, privacy-safe benchmarking in the absence of private EHR operational feeds.
- **Sparse Site Strength Borrowing:** Smaller sites with headcount <200 borrow statistical dispersion parameters from sector aggregates, which may widen uncertainty bounds.
- **Missing Feeds:** Feeds delayed by >24 hours are removed from fusion calculations rather than imputed, causing a temporary reduction in overall confidence score.
