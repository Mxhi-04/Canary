# Implementation Backlog & Task Checklist: Canary

## Phase 1 — Project Scaffolding & Design System
- [x] Create project structure conforming to `ARCHITECTURE.md`
- [x] Configure Next.js 15 App Router with TypeScript and strict mode
- [x] Establish Tailwind CSS design tokens according to `DESIGN.md` (surfaces, risk tiers, honest provenance badges)
- [x] Implement core shared components (`RiskTierBadge`, `ProvenanceBadge`, `SemicircularGauge`, `CompletenessMeter`, `SuppressedCell`, `Panel`)
- [x] Build AppShell with collapsible navigation rail, topographic contour header, and persistent demo notice

## Phase 2 — Core Screens
- [x] **Screen 1: Overview Map (`/`)**
  - [x] Interactive UAE geospatial vector map (Abu Dhabi, Musaffah, Al Ain, Dubai South)
  - [x] Semicircular metric gauges (Completeness, Sites at Alert+, Open Actions)
  - [x] Ranked horizontal site bars with tier indicators
  - [x] Exposure vs confirmatory outcomes trend chart
  - [x] Feed health panel with delayed/missing feed warning
  - [x] Selected site detail drawer modal
- [x] **Screen 2: Alert Inbox (`/alerts`)**
  - [x] Table with 3px tier-colored edge bar, syndrome, unit, and mini completeness meter
  - [x] Sticky tier, hazard, and status filter chips
  - [x] Empty, loading, and error states
- [x] **Screen 3: Explainable Alert Detail (`/alerts/[id]`)**
  - [x] 5-Question Bento Layout (What changed, Why raised, Where & when, How reliable, What to consider)
  - [x] Observed vs expected signal strips with 95% forecast credibility band
  - [x] Evidence contribution waterfall with capping and correlation discounts
  - [x] Decision support playbook with designated role, evidence, assumptions, review date, and guidance citations
  - [x] Human review and sign-off modal
- [x] **Screen 4: Scenario Replay (`/replay`)**
  - [x] Scenario selector (Respiratory dust, GI cluster, Heat stress)
  - [x] Interactive 14-day timeline scrubber with play/pause and keyboard shortcuts
  - [x] Comparator markers (Canary vs EARS C2 vs CUSUM)
  - [x] Ground-truth outbreak window reference band
  - [x] Temporal evidence snapshot for selected day
- [x] **Screen 5: Validation & Evaluation (`/validation`)**
  - [x] Comparator benchmark matrix on held-out test seeds
  - [x] Operational lead time chart (+2.9 days advantage)
  - [x] Ablation & robustness small-multiples grid
  - [x] Simulated ground truth disclaimer banner
- [x] **Screen 6: Privacy & Governance (`/privacy`)**
  - [x] Canonical 4-field data contract schema card
  - [x] Interactive API ingestion validator (tests valid vs prohibited person-level fields)
  - [x] Live small-cell suppression demo with adjustable $k$ slider ($k=3$ to $10$)
  - [x] Role-based scope comparison cards
  - [x] Append-only audit access log
- [x] **Screen 7: Health & Resilience Impact Estimator (`/impact`)**
  - [x] Low, Base, and High scenario projection columns
  - [x] Interactive sliders for uptake %, efficacy %, and lead time gain
  - [x] Transparent mathematical formula chain and literature caveats

## Phase 3 — Verification & Production Readiness
- [x] End-to-end Next.js build verification (`npm run build` succeeds with 0 errors)
- [x] All 8 API endpoints operational (`/api/v1/units`, `/alerts`, `/alerts/[id]`, `/replay`, `/backtest/summary`, `/privacy/example`, `/audit`, `/ingest`)
- [x] Documentation suite complete (`README.md`, `MODEL_CARD.md`, `DATA_GOVERNANCE.md`, `ASSUMPTIONS.md`, `TASKS.md`, `CHANGELOG.md`)
