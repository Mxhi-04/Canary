# Data sources and governance

Canary accepts daily population-level counts to support occupational and public health surveillance. Access and operational use are limited to that purpose. Individual employment, performance and disciplinary decisions are prohibited. Alert recommendations are decision support and require human review.

## Sources and cadence

| Source | Fields | Cadence and handling |
| --- | --- | --- |
| Seeded generator | Absence, clinic respiratory/GI/injury, heat first-aid, near misses, district teleconsults, four exposure fields | Daily over 730 days across 12 fictional sites and four districts. The generator introduces seasonality, weekend effects, illustrative Ramadan/Eid and public holiday dates, outages, a noisy site, short late-feed gaps and unrelated exposure spikes. Three YAML scenarios support replay. |
| Open-Meteo historical weather and forecast | Hourly temperature and relative humidity | A refresh derives a daily maximum temperature-humidity WBGT proxy when at least 18 hours are available. Data use Asia/Dubai dates. |
| CAMS Global via Open-Meteo | PM2.5, PM10 and dust | Hourly values supplied by the API from global-model grid output, aggregated to daily means with the same coverage rule. The adapter requests four district points and shares model estimates across sites within each district. Historical CAMS Global coverage begins in August 2022. |
| Authenticated daily feed | The aggregate contract below | SQLite stores bounded corrections and report dates. The API starts with an empty report history in authenticated mode. |

The demo and scored runs use only generated inputs. Live requests were exercised for forecast data and for archived 1–2 November 2024 weather and air quality. Cache entries contain the district, date, source, fetch time and derived daily values. Archive rows take precedence over forecast rows for the same day. An unsuccessful refresh leaves the previous cache intact. Schedule a refresh externally for an hourly feed and load retrospective archive data separately. The free Open-Meteo API is for non-commercial use. [Open-Meteo terms](https://open-meteo.com/en/terms) · [Weather archive](https://open-meteo.com/en/docs/historical-weather-api) · [CAMS coverage and attribution](https://open-meteo.com/en/docs/air-quality-api)

The WBGT proxy uses the Australian Bureau of Meteorology temperature and vapour-pressure approximation. It omits wind and solar load. Site heat decisions require appropriate local measurement, workload and clothing information. [WBGT methods study](https://openresearch-repository.anu.edu.au/bitstreams/02948e04-e6ef-4188-80ea-b421d14b3562/download) · [WHO workplace heat stress](https://www.who.int/news-room/questions-and-answers/item/workplace-heat-stress)

## Ingest contract

Each row contains exactly `unit`, `date`, `category` and `count`. There is no field for names, worker IDs or free text. Submit zero for a confirmed zero count and omit unreported records. Counts are integers. Batches are atomic upserts keyed by unit, date and category. Replaying the same batch leaves counts unchanged. A revised count overwrites the prior value, and a revised snapshot can change historical alerts. The first receipt day is retained. Arrivals after the next Dubai reporting day are flagged as late in signals and alert contributions.

The closed unit catalog uses illustrative site locations and synthetic headcounts. District teleconsults are separate from site counts. A source without site geolocation can submit a whole-district daily outcome count. A complete sum of the configured site reports takes precedence. Otherwise Canary uses the direct district total if available. Never submit a partial district total through that path. The two sources are never added together. Teleconsult, injury and PM10 are visible streams for authorized roles, with PM10 contextual to dust exposure. Current scoring uses syndrome-specific clinic or first-aid, absence, near-miss and primary exposure signals.

## Release controls and retention

- Site HSE sees its assigned site. An occupational physician sees assigned sites. District public health sees assigned district rollups. Regulators see indicators for expected reporting and suppression policy.
- Counts below the configurable `k` are suppressed, including zeros. District totals are shown in fixed-width bands when any constituent site count is small or unavailable. District users have no site-level view. Scan statistics use only cells that can be released exactly.
- Some indirect information remains visible through alert tiers, scope, coverage and modeled expectations. The prototype does not provide a formal privacy guarantee. Scope overlaps, collusion and repeated corrections require review before a real-data pilot.
- Reads are audited by time, configured service subject, role and route. Logs omit payloads, query strings and tokens. Audit writes prune entries older than 30 days. Successful changed ingests prune reports outside the 730-day window. A persistent deployment needs scheduled cleanup, a backup policy and a restricted database volume.
- Demo roles are intentionally public for simulated data. Authenticated mode binds scopes to bearer keys and uses an explicit CORS allowlist. Production operation requires a jurisdiction-specific governance review, authorised unit catalog, secret rotation, TLS, restricted database access and a source agreement.
