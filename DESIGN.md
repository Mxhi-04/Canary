# DESIGN: Canary

## Visual and interaction design specification

**Product:** Canary, a population and workforce health early-warning platform
**Companion to:** `PRD.md` v1.0
**Theme reference:** Dark "Disease Surveillance" dashboard (charcoal panels, amber/gold glow, semicircular gauges)
**Prototype target:** 20 November 2026

---

## 1. Design intent

Canary is a monitoring room, not a marketing site. An HSE officer, occupational physician or district public-health officer opens it to answer four questions quickly: *what changed, where, how sure are we, and what should I consider doing.*

The look comes from the theme reference: a dark charcoal canvas, lightly lit panels, and a single warm amber light source that gets brighter as risk rises. Calm areas stay dim. Risk is the thing that glows.

### Principles

1. **Risk glows; everything else is quiet.** Amber and red are reserved for signal and risk. Chrome, borders and labels stay in neutral charcoal and warm grey. If everything glows, nothing reads as urgent.
2. **Evidence before score.** No screen shows a lone number as the reason for an alert. Every score sits next to observed vs expected, contributing streams and completeness (PRD Feature 7).
3. **Provenance is always visible.** Real environmental data, simulated outcome data and illustrative estimates look different at a glance (section 5).
4. **Missing is not zero.** Absent data has its own visual state. It never renders as a flat line or an empty bar (PRD Feature 10).
5. **Colour never works alone.** Every tier and status pairs colour with a shape and a text label (PRD section 9).
6. **Decision support, not decision.** Language and layout make human review explicit. Nothing looks like an auto-executed action.

### What we take from the reference and what we fix

| Take | Fix |
|---|---|
| Charcoal canvas, soft panel depth, subtle topographic header art | The reference has garbled labels, a non-chronological month axis and a duplicated "15K" tick. Canary uses real, ordered, labelled axes. |
| Amber glow hot-spots on a dark map | The reference is a world map. Canary is a UAE-focused map (Abu Dhabi, Al Ain, Dubai) with site and district layers. |
| Semicircular gauges with gradient arcs | Gauges only show bounded quantities (completeness, share of sites by tier). Unbounded counts use plain numerals. |
| Large light-weight numerals with ▲ trend and %. | Every trend states its comparison period ("vs previous 7 days"). |
| Ranked horizontal bar lists with coloured dots | Dots become tier or provenance shapes, so colour is never the only cue. |
| Ghost "Full report" buttons | Buttons say what happens: "Open alert", "Replay scenario", "Review and sign off". |

---

## 2. Design tokens

### 2.1 Colour

All colours are defined once as CSS variables and consumed by the app, the charts and the map style.

```css
:root {
  /* Surfaces */
  --canvas:        #121213;  /* page background */
  --canvas-deep:   #0D0D0E;  /* header band, map ocean */
  --panel:         #1B1B1C;  /* default panel */
  --panel-raised:  #232324;  /* hover, selected row, popover */
  --panel-inset:   #161617;  /* wells inside panels, chart plots */
  --border:        #2C2C2E;  /* panel and divider lines */
  --border-strong: #3A3A3D;  /* inputs, focus-adjacent */
  --highlight:     rgba(255, 255, 255, 0.04); /* 1px top inner edge on panels */

  /* Text */
  --text:          #EDE8DF;  /* primary, warm off-white */
  --text-2:        #B3AEA4;  /* secondary */
  --text-3:        #8A857C;  /* tertiary, non-essential only (4.5:1 on --panel) */

  /* Brand / signal light */
  --amber:         #F2A33A;  /* primary accent, links, focus ring, active nav */
  --amber-glow:    rgba(242, 163, 58, 0.35);

  /* Risk tiers (always paired with shape + label) */
  --tier-watch:    #E8C14A;  /* gold */
  --tier-alert:    #F08A2E;  /* orange */
  --tier-action:   #E5483D;  /* red */
  --tier-watch-text:  #EDCB63;
  --tier-alert-text:  #F59A4A;
  --tier-action-text: #F06B5E; /* lighter red for text, passes 4.5:1 */

  /* Status */
  --ok:            #7FB45A;  /* complete, within expected range, improving */
  --stale:         #B89A5B;  /* delayed or stale feed */
  --missing:       #6F6B64;  /* no data (rendered hatched, never filled) */
  --info:          #6FA8C7;  /* real environmental series */

  /* Provenance */
  --prov-real:     #6FA8C7;  /* real data */
  --prov-sim:      #C58BD9;  /* simulated data */
  --prov-illus:    #D9B26F;  /* illustrative estimate */
}
```

Notes

- `--prov-*` hues are deliberately outside the amber/red risk range so provenance never gets confused with severity.
- Use the `-text` tier variants for any small tier-coloured text. Use the base tier colours for fills, rings and glows.
- Do not use pure `#000` or pure `#FFF`.

### 2.2 Gauge and bar gradients

Taken from the reference: arcs run from a cool-warm start to a hot end.

| Use | Gradient (start → end) |
|---|---|
| Neutral progress (completeness) | `#7FB45A` → `#E8C14A` |
| Warning progress (sites at Alert or above) | `#E8C14A` → `#F08A2E` |
| Critical progress (sites at Action) | `#F08A2E` → `#E5483D` |
| Tier bars in ranked lists | Solid tier colour with a 2px brighter leading cap |

### 2.3 Typography

One family, used in two weights to get the reference's look: light for big numerals, medium for everything that must be read.

- **Family:** Manrope, with `Inter, system-ui, sans-serif` fallback.
- **Numerals:** `font-variant-numeric: tabular-nums` on every number so columns and live-updating values do not jitter. Do not use a monospace face.
- **Case:** Sentence case everywhere. The only uppercase text is the screen title in the header band, as in the reference.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 56 / 60 | 300 | Hero numerals in gauges and key metrics |
| `title-screen` | 28 / 32, letter-spacing 0.02em, uppercase | 500 | Screen title in header band |
| `title-panel` | 20 / 26 | 500 | Panel titles ("Global outbreak map" style) |
| `numeral-lg` | 32 / 36 | 300 | Secondary numerals (observed, expected) |
| `body` | 15 / 22 | 400 | Body and table cells |
| `body-strong` | 15 / 22 | 600 | Row titles, button labels |
| `caption` | 13 / 18 | 400 | Captions, axis labels, legends |
| `micro` | 12 / 16 | 500 | Badges, chips (never below 12px) |

Line length for explanatory text (alert summaries, assumptions) is capped at 70 characters. Left-align all text. Right-align numeric table columns.

### 2.4 Spacing, radius, elevation

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48. Panel padding 24 (16 on mobile). Gap between panels 16.
- **Radius:** panels 14, controls and chips 8, badges 6, gauge and bar ends fully round. Different roles get different radii; do not use one radius everywhere.
- **Panel elevation:** `background: var(--panel)`, `border: 1px solid var(--border)`, plus a 1px top inner highlight (`inset 0 1px 0 var(--highlight)`) and a soft outer shadow `0 12px 32px rgba(0,0,0,.35)`. This reproduces the slightly embossed look of the reference.
- **Glow:** a tier glow is a `drop-shadow` of the tier colour at 35% opacity and 12 to 20px blur. It is used only on map hot-spots, the active gauge arc and an unacknowledged Action alert.

### 2.5 Iconography

Line icons, 1.5px stroke, 20px default, rounded caps (Lucide or Phosphor). Tier shapes are custom and always filled:

| Tier | Shape | Colour | Label |
|---|---|---|---|
| Watch | ● circle | `--tier-watch` | "Watch" |
| Alert | ▲ triangle | `--tier-alert` | "Alert" |
| Action | ◆ diamond | `--tier-action` | "Action" |

---

## 3. Layout system

### 3.1 App shell

- **Header band** (160px desktop, 96px mobile): `--canvas-deep` with the topographic contour artwork from the reference, low contrast (about 6% lighter than the band), fading out at the bottom. Holds the screen title, a one-sentence plain-language description, and on the right: role switcher, provenance legend and data-freshness indicator.
- **Navigation:** a slim left rail (72px, icons with tooltips, expands to 220px on hover or focus) for the seven screens. It collapses to a bottom bar below 768px.
- **Content:** a 12-column grid, max width 1440, 16px gutters, panels as grid items (the reference's bento arrangement).
- **Persistent demo strip** (24px, under the header): "Demo mode. Outcome data is simulated. Decision support only." It cannot be dismissed.

### 3.2 Breakpoints

| Name | Width | Behaviour |
|---|---|---|
| Desktop | ≥ 1200 | Full bento grid |
| Tablet | 768–1199 | Two columns, map spans full width |
| Mobile | < 768 | Single column, tables become stacked rows, bottom nav (read-only; no mobile app is in scope) |

### 3.3 Reading order

Top-left is always the primary spatial or evidence view. Right column is the "so what" (metrics, tiers, actions). Bottom row is supporting history and detail. The reference's order (map → metrics → trends) is kept on the overview.

---

## 4. Screen specifications

Wireframes are layout intent, not pixel specs.

### 4.1 Overview map (PRD Screen 1)

```
┌──────────────────────────────────────────────────────────────────────┐
│ OVERVIEW        one-sentence description        [Role ▾] [Legend] ⟳  │
├───────────────────────────────────────┬──────────────────────────────┤
│ Site and district map                 │ Key metrics                  │
│  (UAE, glow markers, tier shapes)     │  ◜gauge◝  ◜gauge◝  ◜gauge◝   │
│                                       │  Data     Sites at  Open     │
│  [3 open alerts ▾]                    │  complete Alert+    Actions  │
│                                       ├──────────────────────────────┤
│                                       │ Sites by tier  (ranked bars) │
│  Layers: Sites | Districts | Hazard   │  ◆ Action  ▲ Alert  ● Watch  │
├───────────────────────────────────────┼──────────────────┬───────────┤
│ Hazard trend (heat, PM2.5), real data │ Feed health      │ Data      │
│ with observed outcomes (sim) overlay  │ (stale/failed)   │ sources   │
└───────────────────────────────────────┴──────────────────┴───────────┘
```

- **Map:** MapLibre with a custom dark style. Land `#2A2418`, water `#0D0D0E`, borders `#3A3A3D`, labels `--text-3`. Four districts shown as choropleth in tier-tinted browns/golds (the reference's US choropleth treatment).
- **Site markers:** a tier shape inside a ring. Ring size encodes headcount band. Ring is dashed when completeness is below 80%. A radial glow in the tier colour sits behind Alert and Action markers only.
- **Pill control** (reference "142 active"): `[▲ 3 open alerts ▾]` opens a filter by tier.
- **Key metric gauges** (reference "Key metrics"): Data completeness (%), Sites at Alert or above (share of sites), Open Action alerts (share of open alerts). Each shows a ▲▼ delta with an explicit period.
- **Data sources strip** (reference footer): chips for each feed with a provenance badge and last-updated time.
- **Stale or unavailable feeds:** a feed-health panel lists each failed or late stream. Affected markers show a ⚠ corner mark. The overview never hides a failing feed.
- **Selecting a site:** opens a right-side drawer with permitted detail and an "Open alerts for this site" button.

### 4.2 Alert inbox (PRD Screen 2)

- Table with row height 56. Columns: Tier (shape + word), Hazard or syndrome, Unit, Started, Status, Confidence, Completeness (mini meter).
- Left edge of the row carries a 3px tier-coloured bar; the tier shape and word remain in the cell.
- Filters: tier, hazard, unit (limited to role-permitted units), status. Filters are sticky chips above the table.
- Default sort: tier descending, then start time descending.
- States: loading uses skeleton rows; empty reads "No alerts match these filters. Clear filters or widen the date range."; error reads "Alerts could not be loaded. Check the connection and retry." with a Retry button.

### 4.3 Alert detail (PRD Screen 3)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▲ Alert · Respiratory · Site 04 (labour accommodation)  started 3 Nov│
│ Plain-language summary (deterministic template)        [Review ▸]    │
├──────────────────────────────────┬───────────────────────────────────┤
│ What changed                     │ Why Canary raised this            │
│  Signal strips: observed (line)  │  Contribution waterfall           │
│  vs expected (dashed) + band     │  PM2.5 ████  Clinic ███  Absence ▌│
│  PM2.5 (real) | Clinic (sim)     │  Persistence 2 of last 3 days ✓   │
│  Absence (sim)                   │  Correlation discount applied     │
├──────────────────────────────────┼───────────────────────────────────┤
│ Where and when                   │ How reliable is this              │
│  Zone map + 1/3/7-day window     │  Completeness per stream          │
│  selector, scan significance     │  Freshness, delays, uncertainty   │
├──────────────────────────────────┴───────────────────────────────────┤
│ What to consider doing                                               │
│  Action · Owner role · Evidence · Assumptions · Escalation · Review  │
│  by date        [Review and sign off]   Decision support only        │
└──────────────────────────────────────────────────────────────────────┘
```

- The page is organised under the five questions from PRD Feature 7: what changed, why, where and when, how reliable, what to consider doing. Panel titles use those plain words.
- **Signal strip:** observed as a solid amber line with point markers (the reference's line-chart style), expected as a dashed `--text-2` line, expected range as a translucent band. Exceedance points are drawn as filled tier shapes. Missing days are a hatched gap with the label "No data", not a zero.
- **Waterfall:** horizontal bars from a baseline prior to the final score. Bars show each stream's capped contribution. A stream removed for missing data appears as a hatched empty row labelled "Not available, contribution removed". A correlation-discount step is its own labelled row.
- **No headline score.** The tier is the headline; the waterfall is the explanation.
- **Action panel:** each field has its own labelled row. The primary button reads "Review and sign off" and is disabled with a tooltip in the read-only demo ("Demo roles are read-only"). The text "Decision support. Requires human review. Nothing is executed automatically." is always shown.
- **Reference line:** each playbook entry shows its guidance source (WHO, ILO or other) as a link-styled caption.

### 4.4 Scenario replay (PRD Screen 4)

- Scenario selector as three tabs: Respiratory (dust / PM2.5), Gastrointestinal cluster, Heat-related illness.
- A large scrubber under the signal view with day ticks. Keyboard: ← → step one day, Shift+← → step seven days, Space plays or pauses.
- Marker rows on the timeline, each with its own shape and label:
  - Canary Watch ●, Alert ▲, Action ◆ (tier colours)
  - Comparator alerts as hollow shapes in `--text-2` with the method name (EARS C2, CUSUM, fixed threshold)
  - Ground-truth event window as a hatched `--prov-sim` band labelled "Simulated event (evaluation context)"
- The panel to the right shows the evidence available at the selected day, so users see what Canary knew at that moment and nothing later.
- Replay is deterministic. The seed and scenario ID appear in the caption.

### 4.5 Validation (PRD Screen 5)

- Top: a banner "Results use simulated data and held-out test seeds. They are not clinical validation."
- Metric summary table: rows are the four methods (EARS C2 on absence, CUSUM on clinic visits, fixed hazard threshold, Canary fusion); columns are event-level sensitivity, lead time, alert-level PPV, false alerts per site-month, ingest-to-alert latency. Canary's row is highlighted with an amber left edge. Values come from the back-test endpoint only. No number is hard-coded in the UI.
- Lead-time comparison: horizontal bars per method relative to the clinical-significance threshold day, with a labelled zero line.
- Ablation and robustness: a small-multiples grid (one panel per condition: feed removed, no geolocation, 2-day delay, 30% noise). Each shows degradation against the full model.
- Each metric has an info popover with its definition and test configuration.
- Placeholders until the back-test runs read "Not yet computed", never an expected or target value.

### 4.6 Privacy and governance (PRD Screen 6)

- **Data contract panel:** the four approved fields (`unit_id`, `date`, `category`, `count`) shown as a schema card, and a rejected example payload with the reason ("Rejected: contains a person-level field").
- **Live suppression demo:** a small table where counts below k are replaced by a suppression cell showing "< 5". A slider for k (default 5). Secondary suppression is shown with a link icon and the tooltip "Also hidden so this value cannot be calculated from totals".
- **Role view demo:** side-by-side previews of what each of the four roles sees. The regulator preview shows compliance indicators only.
- **Audit log:** a table of access events (time, role, view, outcome). New rows appear when the user opens a protected view.
- **Boundary statement:** a fixed card, "Not for disciplinary use or individual employment profiling."
- **Suppressed cell style:** `--panel-inset` background, diagonal hatch, centered "< 5". Never blank and never "0".

### 4.7 Impact estimator (PRD Screen 7)

- Three result columns: Low, Base, High, each with avoided cases, severe incidents and absence days. Each column is labelled "Illustrative" and uses the `--prov-illus` dotted outline.
- Assumption controls: intervention uptake, effectiveness, detection lead gain. Sliders with numeric inputs and a reset control.
- A "How this is calculated" panel shows the formula chain and source references. Caveats are always visible, not in a collapsed accordion.
- Result numerals use `display` weight, but always carry the "Illustrative, scenario-based" tag beside them.

---

## 5. Provenance language (honest data)

This is a core design requirement, not decoration.

| Kind | Badge | Chart treatment | Where it appears |
|---|---|---|---|
| Real | Solid chip, `--prov-real`, label "Real" + source name | Solid line | Environmental feeds (heat, PM2.5, PM10) |
| Simulated | Chip with diagonal hatch, `--prov-sim`, label "Simulated" | Dashed-dot line or hatched fill | Clinic, absence, first-aid, incident, teleconsultation data |
| Illustrative | Dotted outline chip, `--prov-illus`, label "Illustrative" | Dotted outline on cards | Impact estimates |
| Approximation | Small "≈" prefix and "approximation" label | n/a | WBGT-derived heat stress |

Rules

- Every panel that contains simulated outcome data shows a "Simulated" chip in its header.
- Exports and screenshots keep the chip in the image.
- The same symbols are used in the legend of every chart.

---

## 6. Component library

| Component | Spec |
|---|---|
| **Panel** | Section 2.4 elevation. Title row (`title-panel`), optional trailing action, optional provenance chip. |
| **Ghost button** | 1px `--border-strong`, `--panel-raised` on hover, text `--text`. Used for secondary actions. |
| **Primary button** | `--amber` fill, `#1B1203` text, 8px radius. One per view. |
| **Tier badge** | Shape + word, tier colour at 16% fill, 1px tier-colour border, `-text` colour. |
| **Gauge** | 240° arc, 10px stroke, round caps, gradient from 2.2. Centre: `display` numeral, `caption` label, delta row beneath. Track is `--panel-inset`. Has a text alternative: "Data completeness 94%, up 2 points vs previous 7 days". |
| **Delta** | ▲ or ▼ + percentage + comparison period. Colour follows meaning (rising risk is amber/red, improving is `--ok`), and the arrow carries direction. |
| **Ranked bar row** | Tier shape, name, bar (4px, round), delta, count. Used for sites by tier and hazard lists. |
| **Completeness meter** | Segmented bar with percentage. Under 80% it turns `--stale` and gets a ⚠ icon. |
| **Signal strip** | Section 4.3. Height 120 in lists, 220 in detail. |
| **Waterfall** | Section 4.3. Horizontal, labelled, value at the bar end. |
| **Suppressed cell** | Section 4.6. |
| **Scrubber** | 8px track, 20px amber thumb with glow, day ticks, marker rows beneath. |
| **Role switcher** | Select in the header. Label "Demo role". Tooltip: "Demonstration control only. Production uses real identity and access management." |
| **Disclaimer bar** | Used on alert detail and playbooks: "Decision support. Requires human review." |
| **Toast** | Bottom-left, auto-dismiss after 5s, uses the same verb as the action ("Filters cleared"). |

---

## 7. State design

| State | Treatment |
|---|---|
| Loading | Skeleton blocks matching final layout; map shows grey markers. No spinners over charts. |
| Empty | One plain sentence plus the action that fixes it. Example: "No open alerts for this site. Canary is still monitoring 4 streams." |
| Error | What failed and what to do. Example: "Signals for Site 04 did not load. Retry, or check the feed health panel." No apologies. |
| Stale feed | ⚠ + "Last updated 2 days ago" in `--stale`. Contribution is dimmed and labelled. |
| Missing feed | Hatched `--missing` fill, "No data". Distinguish from "No events reported" (a true zero, shown as 0). |
| Suppressed | Section 4.6. |
| Read-only | Actions that would change data are disabled with a tooltip explaining why. |

---

## 8. Motion

Motion is minimal and meaningful.

- **One page-load moment:** on the overview, the map markers fade in with a staggered glow pulse once (about 900ms total), then stay still.
- **Unacknowledged Action alert:** a slow glow breathe (4s cycle) on the marker. Stops once the alert is viewed.
- **User-triggered only elsewhere:** drawer slide (200ms), scrubber updates (instant), tab changes (120ms crossfade). No entrance animations on panels or hover lifts on cards.
- Respect `prefers-reduced-motion`: replace pulses with a static ring, keep all state changes instant.

---

## 9. Accessibility

- Text contrast of at least 4.5:1 against its surface (use `-text` tier colours and `--text-3` only for non-essential captions). Chart marks and UI boundaries at least 3:1.
- Tiers always use shape + word + colour. The colour-blind check must show Watch, Alert and Action distinguishable in greyscale.
- All maps and charts have titles, legends and a text or table alternative ("View as table").
- Visible keyboard focus: 2px `--amber` outline with 2px offset on every interactive element. Logical tab order. Map markers are reachable by keyboard and also listed in the inbox.
- Targets at least 40px (44px on touch).
- Screen-reader announcements for live updates ("Site 04 moved to Alert") use polite live regions.
- Plain language: no unexplained acronyms. First use of WBGT, PM2.5, PPV and EARS C2 gets an inline explanation or popover.

---

## 10. Voice and copy

- Plain verbs, sentence case, active voice. Name things by what users do ("Review and sign off"), not how the system works.
- The same action keeps the same name everywhere ("Open alert" never becomes "View details").
- Always say "decision support", "may indicate", "suggested". Never "diagnosis", "outbreak confirmed" or "will become ill".
- Evidence is never causal: "Heat and clinic visits rose together" rather than "Heat caused the increase".
- Numbers are given with units, period and provenance.

Examples

| Situation | Copy |
|---|---|
| Alert summary | "Respiratory clinic visits at Site 04 are 2.3 times the expected level for the third day, after two days of high PM2.5. Review the evidence and suggested actions." |
| Missing feed | "Absence data for Site 07 is missing since 4 Nov. Its contribution has been removed and confidence is lower." |
| Suppression tooltip | "Counts under 5 are hidden to protect privacy." |
| Impact label | "Illustrative estimate based on the assumptions shown. Not observed impact." |

---

## 11. Implementation notes

Stack from `PRD.md`: Next.js + TypeScript, MapLibre, Recharts or ECharts.

- **Tokens:** define section 2 variables in one `tokens.css` and mirror them in a typed `theme.ts` so chart and map code reads the same values.
- **Charts:** one shared theme object (axis colour `--text-3`, grid `--border` at 50%, tooltip `--panel-raised`). All charts use tier and provenance tokens, not ad hoc colours. Gauges are custom SVG for the gradient arcs.
- **Map:** one MapLibre style JSON using the token colours; the glow is a blurred circle layer under the marker layer.
- **Fonts:** self-host Manrope (300, 400, 500, 600) to keep the hosted demo fast and independent of third-party calls.
- **Components:** build `TierBadge`, `ProvenanceChip`, `CompletenessMeter`, `SuppressedCell` and `Panel` first. Every screen depends on them.
- **Typed fixtures:** screens render from the shared API fixtures so empty, loading, error, stale and suppressed states can be previewed without the backend.
- **Security note:** hiding controls in the UI is for clarity only. The backend enforces roles (PRD section 4.2).

### Suggested build order (aligned with PRD P0/P1)

1. Tokens, shell, Panel, TierBadge, ProvenanceChip
2. Overview map with key metrics and feed health
3. Alert inbox and alert detail with signal strips and waterfall (P0 core)
4. Validation table
5. Privacy and governance screen
6. Scenario replay
7. Impact estimator
8. Motion polish and accessibility pass

---

## 12. Design acceptance checklist

- [ ] Overview shows tiers, completeness and failing feeds without opening any other view.
- [ ] No screen shows an unexplained score.
- [ ] Real, simulated and illustrative data are visually distinct on every panel and chart.
- [ ] Missing data is never drawn as zero.
- [ ] Tiers are distinguishable in greyscale and by shape.
- [ ] Suppressed cells never reveal a value; hover, filters and exports do not either.
- [ ] Every recommendation shows owner, evidence, assumptions, escalation path, review-by date and the human-review statement.
- [ ] Validation values come from the back-test only; unreached values read "Not yet computed".
- [ ] Keyboard-only use works end to end, including the replay scrubber.
- [ ] Layout holds at 1440, 1024 and 390 widths.
