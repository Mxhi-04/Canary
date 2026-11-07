'use client';

import React, { useEffect, useState } from 'react';
import { SurveillanceHeader } from './SurveillanceHeader';
import { SurveillanceMapCard } from './SurveillanceMapCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { DiseaseTrendsBreakdownCard } from './DiseaseTrendsBreakdownCard';
import { DiseaseTrendsChartCard } from './DiseaseTrendsChartCard';
import { GeographicSpreadCard } from './GeographicSpreadCard';
import { OutbreakSourcesCard } from './OutbreakSourcesCard';
import { SiteDrawer } from '@/components/map/SiteDrawer';
import { fetchUnits } from '@/lib/api/client';
import { useDemoRole } from '@/context/RoleContext';
import { MonitoringUnit } from '@/lib/types/domain';

interface SurveillanceRoomSectionProps {
  id?: string;
  className?: string;
}

export const SurveillanceRoomSection: React.FC<SurveillanceRoomSectionProps> = ({
  id = 'surveillance-room',
  className = '',
}) => {
  const { activeRole } = useDemoRole();
  const [units, setUnits] = useState<MonitoringUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MonitoringUnit | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchUnits(activeRole)
      .then((data) => {
        if (!isMounted) return;
        setUnits(data.units);
      })
      .catch((err) => {
        console.error('Failed to load surveillance data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  return (
    <section id={id} className={`relative mb-20 scroll-mt-20 ${className}`}>
      {/* Top Header Banner matching Reference Image */}
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
          {/* Top Right: Key Metrics with 3 Semicircular Gauges (Monitored Sites | Active Alerts | Action Required) */}
          <KeyMetricsCard
            monitoredSites={87462}
            activeAlerts={26}
            actionRequired={419}
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
    </section>
  );
};

