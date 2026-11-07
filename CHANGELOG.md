# Changelog: Canary

All notable changes to the Canary platform are documented in this file.

## [1.0.0-prototype] — 2026-11-07
### Added
- **Core Platform Architecture:**
  - Next.js 15 App Router frontend with TypeScript strict mode and Tailwind CSS.
  - Comprehensive dark "Disease Surveillance" theme matching `DESIGN.md` tokens (`--canvas: #121213`, `--amber: #F2A33A`, tier shapes ● ▲ ◆).
- **Surveillance & Analytics Screens:**
  - Overview Map & Bento Dashboard (`/`) with UAE vector projection across Abu Dhabi, Musaffah, Al Ain, and Dubai South.
  - Semicircular operational gauges with SVG gradient arcs.
  - Alert Inbox (`/alerts`) with multi-tier filtering and 3px severity edge bars.
  - Alert Detail (`/alerts/[alertId]`) structured strictly under the 5 PRD questions with observed vs expected signal strips and evidence contribution waterfalls.
  - Scenario Replay (`/replay`) with 14-day interactive scrubber, keyboard controls, and comparator alert tracking.
  - Validation (`/validation`) featuring comparator matrix (EARS C2, CUSUM, Fixed Threshold, Canary Fusion) and ablation benchmarks.
  - Privacy & Governance (`/privacy`) with canonical 4-field contract, live $k$-suppression slider ($k=3$ to $10$), and interactive ingestion testing sandbox.
  - Impact Estimator (`/impact`) with Low/Base/High projections and adjustable parameter sliders.
- **API Endpoints:**
  - 8 REST endpoints under `/api/v1/` (`units`, `alerts`, `alerts/[id]`, `backtest/summary`, `replay/[scenario]`, `privacy/example`, `audit`, `ingest`).
- **Response Playbooks:**
  - YAML rule templates for Respiratory Dust, Gastrointestinal Accommodation Clusters, and Thermal Stress.
