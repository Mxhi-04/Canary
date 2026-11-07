'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Panel } from '@/components/shared/Panel';
import { SemicircularGauge } from '@/components/shared/SemicircularGauge';
import { UnitMap } from '@/components/map/UnitMap';
import { SiteDrawer } from '@/components/map/SiteDrawer';
import { RankedSitesList } from '@/components/dashboard/RankedSitesList';
import { HazardTrendChart } from '@/components/dashboard/HazardTrendChart';
import { FeedHealthPanel } from '@/components/dashboard/FeedHealthPanel';
import { DataSourcesFooter } from '@/components/dashboard/DataSourcesFooter';
import { fetchUnits } from '@/lib/api/client';
import { useDemoRole } from '@/context/RoleContext';
import { MonitoringUnit, District } from '@/lib/types/domain';
import { ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { activeRole } = useDemoRole();
  const [units, setUnits] = useState<MonitoringUnit[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [completeness, setCompleteness] = useState(94);
  const [sitesAtAlert, setSitesAtAlert] = useState(3);
  const [openActions, setOpenActions] = useState(1);
  const [deltas, setDeltas] = useState({
    completenessDelta: 2,
    sitesAtAlertDelta: 1,
    openActionsDelta: 1,
    comparisonPeriod: 'vs previous 7 days',
  });
  const [selectedUnit, setSelectedUnit] = useState<MonitoringUnit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchUnits(activeRole)
      .then((data) => {
        if (!isMounted) return;
        setUnits(data.units);
        setDistricts(data.districts);
        setCompleteness(data.overallCompleteness);
        setSitesAtAlert(data.sitesAtAlertOrAbove);
        setOpenActions(data.openActionAlerts);
        if (data.deltas) setDeltas(data.deltas);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load overview data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  return (
    <AppShell
      title="POPULATION & WORKFORCE HEALTH SURVEILLANCE"
      description="Sense emerging population and workforce health risk across UAE industrial and accommodation districts."
    >
      {/* Top Banner Alert Pill */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-panel bg-panel border border-[#F08A2E]/30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5483D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E5483D]"></span>
          </span>
          <div className="text-xs text-canary-text">
            <span className="font-semibold text-[#F59A4A]">3 Active Alerts Detected: </span>
            <span className="text-canary-text-2">
              1 Gastrointestinal (Action), 1 Respiratory PM2.5 (Alert), 1 Thermal Stress (Alert).
            </span>
          </div>
        </div>

        <Link
          href="/alerts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-panel-raised hover:bg-panel-inset border border-border text-xs font-semibold text-canary-amber transition-colors self-start sm:self-auto"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Open Alert Inbox</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Main 12-Column Bento Grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Left Column: UAE Spatial Map (Span 12 on mobile, 8 on desktop) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <Panel
            title="UAE Regional Surveillance Map"
            subtitle="Geospatial distribution across Abu Dhabi Central, Musaffah, Al Ain, and Dubai South"
            provenance="real"
            sourceName="CAMS & Local Geodata"
            trailingAction={
              <button
                onClick={() => fetchUnits(activeRole).then((d) => setUnits(d.units))}
                className="text-xs text-canary-text-3 hover:text-canary-amber flex items-center gap-1"
                title="Refresh Map Coordinates"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            }
          >
            <UnitMap
              units={units}
              onSelectUnit={(u) => setSelectedUnit(u)}
              selectedUnitId={selectedUnit?.id}
            />
          </Panel>
        </div>

        {/* Right Column: Key Metrics Gauges & Ranked Sites (Span 12 on mobile, 4 on desktop) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Key Metrics Panel */}
          <Panel
            title="Key Operational Metrics"
            subtitle="System confidence, risk concentration, and immediate response queue"
          >
            <div className="grid grid-cols-3 gap-2">
              <SemicircularGauge
                value={completeness}
                label="Data Complete"
                variant="neutral"
                deltaText={`+${deltas.completenessDelta}% ${deltas.comparisonPeriod}`}
                deltaDirection="up"
                deltaColor="ok"
              />
              <SemicircularGauge
                value={Math.round((sitesAtAlert / (units.length || 14)) * 100)}
                label="Sites at Alert+"
                variant="warning"
                deltaText={`+${deltas.sitesAtAlertDelta} site ${deltas.comparisonPeriod}`}
                deltaDirection="up"
                deltaColor="amber"
              />
              <SemicircularGauge
                value={openActions}
                maxValue={5}
                unit=" active"
                label="Open Actions"
                variant="critical"
                deltaText={`+${deltas.openActionsDelta} action`}
                deltaDirection="up"
                deltaColor="amber"
              />
            </div>
          </Panel>

          {/* Sites by Tier (Ranked Horizontal Bars) */}
          <Panel
            title="Monitoring Units by Risk Tier"
            subtitle="Ranked by anomaly severity and observed deviation from expected baseline"
            trailingAction={
              <Link href="/alerts" className="text-xs text-canary-amber hover:underline">
                View All
              </Link>
            }
          >
            <RankedSitesList units={units} onSelectUnit={(u) => setSelectedUnit(u)} />
          </Panel>
        </div>
      </div>

      {/* Bottom Row: Hazard vs Outcome Trends and Feed Health */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Trend Analysis Chart */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <Panel
            title="Exposure vs Confirmatory Outcomes Trend"
            subtitle="Core principle: Environmental hazard leads; health-service encounters confirm"
            provenance="real"
            sourceName="European CAMS vs Site Clinic (Sim)"
          >
            <HazardTrendChart />
          </Panel>
        </div>

        {/* Feed Health Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <Panel
            title="Data Quality & Stream Health"
            subtitle="Identifies delayed, stale or missing feeds. Missing feeds are never zero-filled."
          >
            <FeedHealthPanel />
          </Panel>
        </div>
      </div>

      {/* Connected Data Sources Footer Strip */}
      <DataSourcesFooter />

      {/* Selected Site Drawer Modal */}
      <SiteDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </AppShell>
  );
}
