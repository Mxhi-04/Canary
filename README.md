# Canary — Population and Workforce Health Early-Warning Platform

> **Challenge:** Future Health Digital Innovation Challenge — Challenge 06  
> **Core Principle:** *Exposure leads; outcomes confirm.*  
> **Status:** Prototype Target 20 November 2026

Canary is an early-warning and decision-support platform designed to detect emerging population and workforce health risks across enterprise and community facilities. By fusing environmental hazard signals (particulate matter PM2.5/PM10, ambient heat, and WBGT thermal index) with aggregate health-service and workplace outcome signals (syndromic clinic presentations, teleconsultation surges, and sickness absence), Canary identifies developing clusters **2.0 to 3.0 days earlier** than single-signal surveillance methods.

When an anomaly is detected, Canary explains **what changed, why the system raised the alert, where and when it occurred, how reliable the evidence is, and what proportionate action a responsible human should consider**.

---

## Key Capabilities & Core Screens

1. **Overview & Spatial Surveillance (`/`)**:
   - UAE geospatial map across Abu Dhabi Central, Musaffah & ICAD, Al Ain, and Dubai South.
   - Semicircular operational gauges for data completeness, percentage of sites at Alert or above, and open Action alerts.
   - Ranked horizontal site bars by anomaly severity.
   - Exposure vs confirmatory outcome trends (European CAMS PM2.5 vs site clinic visits).
   - Real-time data quality and feed health auditing (detects and isolates delayed feeds).

2. **Alert Inbox (`/alerts`)**:
   - Multi-tiered operational queue categorized into **Watch (●)**, **Alert (▲)**, and **Action (◆)**.
   - Filterable by tier, hazard type (Respiratory, Gastrointestinal, Heat Stress), monitoring unit, and status.
   - Left-edge 3px severity bar, stream completeness meter, and uncertainty indicator.

3. **Explainable Alert Detail (`/alerts/[id]`)**:
   - Organized strictly under the **five core PRD questions**:
     1. *What changed*: Observed count vs rolling negative-binomial GLM baseline with 95% forecast interval.
     2. *Why Canary raised this*: Evidence contribution waterfall, evidence capping, correlation discounts, and persistence rules.
     3. *Where and when*: Geographic cluster zone, time window selector (1d, 3d, 7d), and spatial scan significance.
     4. *How reliable*: Stream completeness, sensor freshness, and missing feed handling.
     5. *What to consider doing*: Action playbook, designated owner role, supporting evidence, explicit assumptions, escalation criteria, review-by deadline, and authoritative WHO/ILO citations.
   - Mandatory human-review disclaimer bar and read-only demo sign-off workflow.

4. **Scenario Replay (`/replay`)**:
   - Interactive 14-day timeline scrubber with day ticks, play/pause controls, and keyboard navigation (`←`/`→`, `Space`).
   - Replays three distinct scenarios:
     - *Scenario 1:* Respiratory Dust / PM2.5 Episode (Musaffah Sector 14).
     - *Scenario 2:* Gastrointestinal Cluster in Shared Accommodation (ICAD Village 02).
     - *Scenario 3:* Heat-Related Illness & WBGT Thermal Stress (Dubai South Aviation District).
   - Real-time marker tracks comparing Canary against **EARS C2 (absence)** and **CUSUM (clinic visits)** baselines.
   - Live evidence snapshot reconstructing what Canary knew at that exact day with zero future data leakage.

5. **Validation & Benchmarks (`/validation`)**:
   - Empirical back-testing summary on held-out synthetic test seeds (Calibration Seed 42, Test Seed 108).
   - Comparator matrix reporting event-level sensitivity, lead time (days), alert-level PPV, and false alerts per site-month.
   - Lead time advantage chart relative to the clinical-significance zero line (+2.9 days for Canary).
   - Ablation and robustness stress testing (evaluates feed removal, 48h reporting delays, and 30% noise).

6. **Privacy & Governance (`/privacy`)**:
   - Canonical 4-field aggregate data contract (`unit_id`, `date`, `category`, `count`).
   - Interactive ingestion testing sandbox that rejects prohibited person-level fields (`patient_id`, `employee_name`).
   - Live small-cell suppression engine with an interactive threshold slider ($k=3$ to $10$, default $k=5$) showing primary suppression and secondary total-protection suppression.
   - Server-enforced role access comparison across Site HSE, OH Lead, District Health Officer, and Regulator compliance views.
   - Immutable append-only audit event log.

7. **Health & Resilience Impact Estimator (`/impact`)**:
   - Low, Base, and High scenario projections for avoided clinical presentations, severe cases, and lost workdays.
   - Interactive sliders for intervention uptake, preventive efficacy, and lead time gain.
   - Transparent mathematical equation breakdown and ILO/WHO citation caveats.

---

## Honest Data & Provenance Language

Canary adheres to strict honest provenance marking:
- <span style="color:#6FA8C7">**Real Feed**</span>: Ambient environmental observations (European CAMS PM2.5/PM10 and ECMWF atmosphere via Open-Meteo).
- <span style="color:#C58BD9">**Simulated**</span>: Health-service clinical encounters, teleconsultations, and workplace absence generated for scenario evaluation.
- <span style="color:#D9B26F">**Illustrative**</span>: Scenario-based impact estimates and projections.
- <span style="color:#E8C14A">**≈ Approximation**</span>: Derived indices such as the WBGT heat-stress proxy.

---

## Local Development & Quick Start

### Prerequisites
- Node.js 18+ or 20+ (tested on Node 24)
- npm 10+

### Running the Web Platform
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
cd frontend
npm run build
npm run start
```

---

## Demo Roles Switcher

Switch roles dynamically via the top-right header selector:
1. **Occupational Physician / OH Lead**: Multi-site aggregate operational view with full syndromic signal strips.
2. **Site HSE Officer**: Scoped specifically to Musaffah Sector 14 Heavy Steel Fabrication (Site 04).
3. **District Public-Health Officer**: Regional district surveillance view with cross-site cluster visibility.
4. **Health & Safety Regulator**: Compliance-only view with granular health-count fields masked server-side.

---

## Project Structure

```text
Canary/
├── PRD.md                  # Product Requirements Document
├── ARCHITECTURE.md         # System Architecture & Technical Specifications
├── DESIGN.md               # Visual Tokens, Components & UI Specs
├── RULES.md                # Engineering Rules & Architecture Boundaries
├── MODEL_CARD.md           # Model Card: Intended use, methods, limitations
├── DATA_GOVERNANCE.md      # Data contracts, retention & privacy rules
├── ASSUMPTIONS.md          # Open assumptions & evidence base
├── TASKS.md                # Task backlog & delivery tracking
├── CHANGELOG.md            # Version changelog
│
├── frontend/               # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/            # App routes (/, /alerts, /replay, /validation, /privacy, /impact)
│   │   │   └── api/v1/     # REST API route handlers
│   │   ├── components/     # Reusable layout, map, dashboard, and shared components
│   │   ├── context/        # RoleProvider demo session context
│   │   ├── lib/            # Seeded data, API client, domain & API TypeScript types
│   │   └── globals.css     # Design tokens and custom theme styling
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── backend/                # Python backend blueprints & YAML playbooks
    └── app/playbooks/rules # Editable YAML response playbooks (respiratory, GI, heat)
```

---

## License & Responsible Use

Canary is designed for the Future Health Digital Innovation Challenge. It is an early-warning decision-support system requiring human clinical and HSE review before interventions are enacted. It is not approved for automated clinical diagnosis, individual profiling, or employee disciplinary action.
