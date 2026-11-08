'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SurveillanceHeader } from '@/components/dashboard/SurveillanceHeader';
import { SurveillanceMapCard } from '@/components/dashboard/SurveillanceMapCard';
import { DistrictTelemetryCard } from '@/components/dashboard/DistrictTelemetryCard';
import { KeyMetricsCard } from '@/components/dashboard/KeyMetricsCard';
import { DiseaseTrendsBreakdownCard } from '@/components/dashboard/DiseaseTrendsBreakdownCard';
import { DiseaseTrendsChartCard } from '@/components/dashboard/DiseaseTrendsChartCard';
import { GeographicSpreadCard } from '@/components/dashboard/GeographicSpreadCard';
import { OutbreakSourcesCard } from '@/components/dashboard/OutbreakSourcesCard';
import { fetchUnits } from '@/lib/api/client';
import { useDemoRole } from '@/context/RoleContext';
import { MonitoringUnit } from '@/lib/types/domain';
import { DubaiPlace, DUBAI_PLACES } from '@/components/dashboard/DubaiMapData';

export default function DashboardPage() {
  const { activeRole } = useDemoRole();
  const [units, setUnits] = useState<MonitoringUnit[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<DubaiPlace | null>(DUBAI_PLACES[0]);
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
      {/* Top Hero Banner */}
      <SurveillanceHeader />

      {/* Row 1: Dubai Emirate Surveillance Map (Left) + District Telemetry Dossier Window (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 items-stretch">
        {/* Left Column: Full Unobstructed Dubai Map (7 cols on xl, 8 cols on 2xl) */}
        <div className="xl:col-span-7 2xl:col-span-8 flex flex-col">
          <SurveillanceMapCard
            units={units}
            selectedPlaceId={selectedPlace ? selectedPlace.id : null}
            onSelectPlace={(p) => setSelectedPlace(p)}
          />
        </div>

        {/* Right Column: District Telemetry Dossier Window (Contained Strictly in Map Tab) */}
        <div className="xl:col-span-5 2xl:col-span-4 flex flex-col">
          <DistrictTelemetryCard
            place={selectedPlace}
            onSelectPlace={(p) => setSelectedPlace(p)}
            onClose={() => setSelectedPlace(null)}
          />
        </div>
      </div>

      {/* Row 2: Shifted Graphs Section: Key Metrics Gauges + Disease Trends Spline Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 items-stretch">
        {/* Key Metrics: 3 Animated Gauges (Monitored Sites | Active Alerts | Action Required) */}
        <div className="xl:col-span-5 flex flex-col">
          <KeyMetricsCard
            monitoredSites={87462}
            activeAlerts={26}
            actionRequired={419}
          />
        </div>

        {/* Disease Trends Spline Chart & Key Metrics */}
        <div className="xl:col-span-7 flex flex-col">
          <DiseaseTrendsChartCard />
        </div>
      </div>

      {/* Row 3: Ranked Disease Breakdown + Geographic Spread & Outbreak Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 items-stretch">
        {/* Disease Trends Ranked Breakdown Progress Bars */}
        <div className="xl:col-span-6 flex flex-col">
          <DiseaseTrendsBreakdownCard />
        </div>

        {/* Geographic Spread & Outbreak Sources Split */}
        <div className="xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GeographicSpreadCard />
          <OutbreakSourcesCard />
        </div>
      </div>
    </AppShell>
  );
}
