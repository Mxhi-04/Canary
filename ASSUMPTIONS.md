# Assumptions & Open Questions: Canary

**Project:** Canary — Population and Workforce Health Early-Warning Platform  
**Challenge:** Future Health Digital Innovation Challenge (Challenge 06)  
**Version:** 1.0  

---

## 1. Explicit Modeling Assumptions

1. **Exposure Leads; Outcomes Confirm:**
   - Environmental hazard spikes (PM2.5, ambient heat) precede measurable clinic presentation increases by 24 to 48 hours for respiratory and thermal stress syndromes.
   - Sickness absence is an administrative trailing indicator with an operational reporting lag of 48 to 72 hours.
2. **Synthetic Syndromic Ground Truth:**
   - Health-service clinical encounters, teleconsultation surges, and workplace absence are reproducibly generated using calibrated statistical distributions (negative-binomial GLM with seasonal and weekend effects) to demonstrate multi-signal fusion without compromising real patient confidentiality.
3. **Intervention Attenuation:**
   - In the illustrative impact estimator, timely human execution of recommended playbooks (e.g., FFP2 mask enforcement, hydration rest cycles, bulk water quarantine) achieves between 20% and 70% reduction in secondary transmission/incidence during the lead time window.

---

## 2. Technical Decisions & Open Items

| Item | Decision in Prototype | Target in Shadow-Mode Pilot |
|---|---|---|
| **Role Authentication** | Client-selected demo session stored in signed HTTP-only cookie with server-side authorization enforcement. | OIDC / SAML 2.0 integration with enterprise identity providers. |
| **Environmental Coverage** | Open-Meteo European CAMS air quality and ECMWF atmospheric forecasts for Abu Dhabi, Al Ain, and Dubai. | National Centre of Meteorology (NCM) official telemetry feeds. |
| **Spatial Cluster Method** | District roll-up and facility graph links with Poisson space-time scan fallback. | Full Monte Carlo spatial scan statistic with high-performance C/NumPy acceleration. |
| **Clinical Significance Threshold** | Defined as observed encounters exceeding the 95th percentile GLM forecast upper bound for $\ge 2$ consecutive days. | Calibrated against MOHAP / ADPHC syndromic surveillance thresholds. |

