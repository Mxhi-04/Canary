'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SurveillanceHeader } from '@/components/dashboard/SurveillanceHeader';
import { SurveillanceMapCard } from '@/components/dashboard/SurveillanceMapCard';
import { KeyMetricsCard } from '@/components/dashboard/KeyMetricsCard';
import { DiseaseTrendsBreakdownCard } from '@/components/dashboard/DiseaseTrendsBreakdownCard';
import { DiseaseTrendsChartCard } from '@/components/dashboard/DiseaseTrendsChartCard';
import { GeographicSpreadCard } from '@/components/dashboard/GeographicSpreadCard';
import { OutbreakSourcesCard } from '@/components/dashboard/OutbreakSourcesCard';
import { SiteDrawer } from '@/components/map/SiteDrawer';
import { fetchUnits } from '@/lib/api/client';
import { useDemoRole } from '@/context/RoleContext';
import { MonitoringUnit } from '@/lib/types/domain';

export default function DashboardPage() {
  const { activeRole } = useDemoRole();
  const [units, setUnits] = useState<MonitoringUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MonitoringUnit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchUnits(activeRole)
      .then((data) => {
        if (!isMounted) return;
        setUnits(data.units);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load surveillance data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  return (
    <AppShell
      title="DISEASE SURVEILLANCE"
      description="Population and workforce health early-warning surveillance room."
    >
      {/* Top Hero Banner matching Reference Image */}
      <SurveillanceHeader />

      {/* Main Bento Grid: 2 Columns matching Reference Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Map + Disease Trends Spline Chart (7 of 12 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Top Left: Global / Regional Outbreak Map with 142 ACTIVE pill & DATA SOURCES strip */}
          <SurveillanceMapCard
            units={units}
            onSelectUnit={(u) => setSelectedUnit(u)}
            selectedUnitId={selectedUnit?.id}
          />

          {/* Bottom Left: Disease Trends Chart & Dual Metrics */}
          <DiseaseTrendsChartCard />
        </div>

        {/* Right Column: Key Metrics, Breakdown, Geographic Spread & Sources (5 of 12 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Top Right: Key Metrics with 3 Semicircular Gauges (87,462 | 26 | 419) */}
          <KeyMetricsCard
            totalCases={87462}
            outbreaks={26}
            criticalAlerts={419}
          />

          {/* Middle Right: Disease Trends (Ranked horizontal bars with status dots) */}
          <DiseaseTrendsBreakdownCard />

          {/* Bottom Right: 2 Split Cards (Geographic Spread & Outbreak Sources) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GeographicSpreadCard />
            <OutbreakSourcesCard />
          </div>
        </div>
      </div>

      {/* Selected Site Drawer Modal (Enforces strict k >= 5 privacy suppression) */}
      <SiteDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </AppShell>
  );
}
