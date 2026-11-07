'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Panel } from '@/components/shared/Panel';
import { RiskTierBadge } from '@/components/shared/RiskTierBadge';
import { CompletenessMeter } from '@/components/shared/CompletenessMeter';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { fetchUnits } from '@/lib/api/client';
import { useDemoRole } from '@/context/RoleContext';
import { MonitoringUnit, District } from '@/lib/types/domain';
import {
  Layers,
  MapPin,
  Flame,
  Wind,
  Activity,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

type LayerType = 'all' | 'hazard_wbgt' | 'hazard_pm25' | 'syndromic';

export default function DedicatedMapPage() {
  const { activeRole } = useDemoRole();
  const [units, setUnits] = useState<MonitoringUnit[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MonitoringUnit | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');
  const [timeOffsetDays, setTimeOffsetDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchUnits(activeRole)
      .then((data) => {
        if (!isMounted) return;
        setUnits(data.units);
        setDistricts(data.districts);
        if (data.units.length > 0) {
          const alertUnit = data.units.find((u) => u.currentTier === 'ALERT' || u.currentTier === 'ACTION') || data.units[0];
          setSelectedUnit(alertUnit);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load map data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  const mapWidth = 900;
  const mapHeight = 560;

  const projectToSvg = (lat: number, lng: number) => {
    const minLng = 53.6;
    const maxLng = 56.4;
    const minLat = 23.8;
    const maxLat = 25.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };

  const filteredUnits = units.filter((u) => {
    if (selectedDistrict !== 'all' && u.districtId !== selectedDistrict) return false;
    if (activeLayer === 'hazard_wbgt') return u.primaryRiskReason?.toLowerCase().includes('heat') || u.primaryRiskReason?.toLowerCase().includes('thermal');
    if (activeLayer === 'hazard_pm25') return u.primaryRiskReason?.toLowerCase().includes('dust') || u.primaryRiskReason?.toLowerCase().includes('pm2.5') || u.primaryRiskReason?.toLowerCase().includes('respiratory');
    if (activeLayer === 'syndromic') return u.currentTier !== null && u.currentTier !== 'WATCH';
    return true;
  });

  return (
    <AppShell
      title="GEOSPATIAL SURVEILLANCE & ENVIRONMENTAL EXPOSURE MAP"
      description="Interactive spatial mapping of environmental hazard priors and syndromic cluster confirmations across the UAE."
    >
      {/* Top Map Control Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-panel bg-panel border border-border">
        {/* Layer Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-canary-text-3 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-canary-amber" />
            Display Layer:
          </span>

          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              activeLayer === 'all'
                ? 'bg-canary-amber text-canvas-deep shadow-amber-glow'
                : 'bg-panel-inset hover:bg-panel-raised text-canary-text-2'
            }`}
          >
            All Surveillance Units ({units.length})
          </button>

          <button
            onClick={() => setActiveLayer('hazard_wbgt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              activeLayer === 'hazard_wbgt'
                ? 'bg-[#E5483D] text-white shadow-md'
                : 'bg-panel-inset hover:bg-panel-raised text-canary-text-2'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Thermal Stress (WBGT &gt; 31°C)</span>
          </button>

          <button
            onClick={() => setActiveLayer('hazard_pm25')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              activeLayer === 'hazard_pm25'
                ? 'bg-[#F2A33A] text-canvas-deep shadow-md'
                : 'bg-panel-inset hover:bg-panel-raised text-canary-text-2'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Air Quality (PM2.5 Spike)</span>
          </button>

          <button
            onClick={() => setActiveLayer('syndromic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              activeLayer === 'syndromic'
                ? 'bg-[#C58BD9] text-canvas-deep shadow-md'
                : 'bg-panel-inset hover:bg-panel-raised text-canary-text-2'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Active Confirmed Outbreaks</span>
          </button>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-canary-text-3 font-semibold uppercase">District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-panel-inset border border-border text-xs text-canary-text rounded-control px-3 py-1.5 focus:outline-none focus:border-canary-amber"
          >
            <option value="all">All UAE Regions</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map + Side Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center: Interactive SVG Map (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Panel
            title="UAE REGIONAL SURVEILLANCE PROJECTION"
            provenance="real"
            sourceName="Open-Meteo & CAMS Ensembles"
            className="p-0 overflow-hidden relative"
          >
            {/* Map Canvas Box */}
            <div className="relative w-full h-[580px] bg-canvas-deep flex items-center justify-center overflow-hidden">
              <svg
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                className="w-full h-full select-none"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.6))' }}
              >
                <defs>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#252528" strokeWidth="0.5" />
                  </pattern>

                  <radialGradient id="heatGlowMusaffah" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E5483D" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#F08A2E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F08A2E" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="dustGlowAlAin" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F2A33A" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#F2A33A" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#F2A33A" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width={mapWidth} height={mapHeight} fill="url(#mapGrid)" />

                {/* Stylized Coastline */}
                <path
                  d="M 50 300 Q 180 340 320 280 T 520 200 T 720 120 T 880 70"
                  fill="none"
                  stroke="#2D3035"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <text x="120" y="240" fill="#4B4E54" fontSize="13" fontStyle="italic" letterSpacing="3">
                  ARABIAN GULF (AL KHALEEJ)
                </text>
                <text x="700" y="380" fill="#4B4E54" fontSize="13" fontStyle="italic" letterSpacing="3">
                  AL KHATIM / AL AIN OASIS
                </text>

                {(activeLayer === 'all' || activeLayer === 'hazard_wbgt') && (
                  <circle cx="370" cy="310" r="130" fill="url(#heatGlowMusaffah)" pointerEvents="none" />
                )}
                {(activeLayer === 'all' || activeLayer === 'hazard_pm25') && (
                  <circle cx="680" cy="350" r="110" fill="url(#dustGlowAlAin)" pointerEvents="none" />
                )}

                <g fill="#6C6D73" fontSize="11" fontWeight="600" letterSpacing="1">
                  <text x="320" y="240">ABU DHABI ISLAND</text>
                  <text x="380" y="360">MUSAFFAH ICAD</text>
                  <text x="640" y="320">AL AIN OASIS</text>
                  <text x="720" y="150">DUBAI SOUTH LOGISTICS</text>
                </g>

                {filteredUnits.map((unit) => {
                  const { x, y } = projectToSvg(unit.latitude, unit.longitude);
                  const isSelected = selectedUnit?.id === unit.id;
                  const isAction = unit.currentTier === 'ACTION';
                  const isAlert = unit.currentTier === 'ALERT';
                  const isWatch = unit.currentTier === 'WATCH';

                  let pinColor = '#8D8D93';
                  if (isAction) pinColor = '#E5483D';
                  else if (isAlert) pinColor = '#F08A2E';
                  else if (isWatch) pinColor = '#EDCB63';

                  return (
                    <g
                      key={unit.id}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => setSelectedUnit(unit)}
                      transform={`translate(${x}, ${y})`}
                    >
                      {(isAction || isAlert) && (
                        <circle
                          r="18"
                          fill="none"
                          stroke={pinColor}
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}

                      {isSelected && (
                        <circle
                          r="14"
                          fill="none"
                          stroke="#F2A33A"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                      )}

                      <circle
                        r={isSelected ? '9' : '7'}
                        fill={pinColor}
                        stroke="#121213"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      <circle r="3" fill="#121213" />

                      <text
                        y="20"
                        textAnchor="middle"
                        fill={isSelected ? '#F2A33A' : '#D1D1D6'}
                        fontSize="10"
                        fontWeight={isSelected ? '700' : '500'}
                        className="pointer-events-none"
                      >
                        {unit.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-panel/90 backdrop-blur-md px-3.5 py-2 rounded-control border border-border shadow-lg text-xs">
                <span className="text-[11px] font-bold text-canary-text-3 uppercase tracking-wider">
                  Risk Tier:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5483D]" />
                  <span className="text-canary-text font-medium">◆ Action</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F08A2E]" />
                  <span className="text-canary-text font-medium">▲ Alert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EDCB63]" />
                  <span className="text-canary-text font-medium">● Watch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6C6D73]" />
                  <span className="text-canary-text-3 font-medium">Normal</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 z-10 bg-panel/90 backdrop-blur-md px-3 py-1.5 rounded-control border border-border text-[11px] font-mono text-canary-text-2">
                Active Sites Rendered: <strong className="text-canary-amber">{filteredUnits.length}</strong>
              </div>
            </div>

            {/* Bottom Timeline Scrubber */}
            <div className="p-4 bg-panel-raised border-t border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-canary-text-2">
                <Calendar className="w-4 h-4 text-canary-amber" />
                <span>Time-Window Scrub:</span>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-md">
                <span className="text-[10px] text-canary-text-3 font-mono">T-7d</span>
                <input
                  type="range"
                  min="-7"
                  max="0"
                  value={timeOffsetDays}
                  onChange={(e) => setTimeOffsetDays(parseInt(e.target.value))}
                  className="w-full accent-[#F2A33A] h-1.5 bg-panel-inset rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-canary-amber font-mono font-bold">
                  {timeOffsetDays === 0 ? 'Today (Live)' : `T${timeOffsetDays}d`}
                </span>
              </div>

              <span className="text-[11px] text-canary-text-3">
                Deterministic replay window: 14 rolling days
              </span>
            </div>
          </Panel>
        </div>

        {/* Right: Selected Unit / Region Deep Dive Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedUnit ? (
            <Panel
              title={selectedUnit.name.toUpperCase()}
              trailingAction={<RiskTierBadge tier={selectedUnit.currentTier} />}
              className="space-y-5"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-canary-text-3">
                  <span>Unit ID: {selectedUnit.id}</span>
                  <span>District: {selectedUnit.districtName}</span>
                </div>
                <p className="text-xs text-canary-text-2">
                  Category: <strong className="text-canary-text capitalize">{selectedUnit.unitType} Facility</strong> · Population Band: <strong className="text-canary-text font-mono">{selectedUnit.headcountBand}</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-panel bg-panel-inset border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-canary-text-3 font-medium">Data Completeness:</span>
                  <span className="text-canary-amber font-bold font-mono">
                    {selectedUnit.completeness}%
                  </span>
                </div>
                <CompletenessMeter percentage={selectedUnit.completeness} />
                <div className="text-[11px] text-canary-text-3 pt-1 border-t border-border flex items-center justify-between">
                  <span>Privacy Small-Cell:</span>
                  <span className="font-semibold text-emerald-400">k ≥ 5 Enforced</span>
                </div>
              </div>

              {selectedUnit.primaryRiskReason && (
                <div className="p-3 rounded bg-panel-inset border border-border space-y-1 text-xs">
                  <span className="text-canary-text-3 font-semibold uppercase tracking-wider text-[10px] block">
                    Current Risk Context
                  </span>
                  <p className="text-canary-text font-medium leading-relaxed">
                    {selectedUnit.primaryRiskReason}
                  </p>
                </div>
              )}

              {selectedUnit.openAlertCount > 0 && (
                <div className="p-3.5 rounded-panel bg-[#E5483D]/10 border border-[#E5483D]/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F06B5E]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{selectedUnit.openAlertCount} Active Incident Investigation(s)</span>
                  </div>
                  <p className="text-xs text-canary-text-2 leading-relaxed">
                    Elevated multi-signal anomalies exceed 2-day persistence threshold.
                  </p>
                  <Link
                    href="/alerts"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-canary-amber hover:underline pt-1"
                  >
                    <span>Inspect PRD Alert Questions &amp; Playbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/alerts"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-control bg-panel-raised hover:bg-panel border border-border text-xs font-semibold text-canary-text transition-colors"
                >
                  <span>View All Active Region Alerts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Panel>
          ) : (
            <Panel title="REGION INSPECTION">
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-canary-text-3">
                <MapPin className="w-10 h-10 mb-2 opacity-40 text-canary-amber" />
                <p className="text-xs">Click any site pin on the UAE map to inspect its real-time signals.</p>
              </div>
            </Panel>
          )}

          <Panel title="DISTRICT HEALTH ROSTER">
            <div className="space-y-2 text-xs">
              {districts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDistrict(d.id)}
                  className={`p-2.5 rounded cursor-pointer transition-colors flex items-center justify-between border ${
                    selectedDistrict === d.id
                      ? 'bg-panel-raised border-canary-amber text-canary-amber font-semibold'
                      : 'bg-panel-inset border-border text-canary-text-2 hover:bg-panel'
                  }`}
                >
                  <span>{d.name}</span>
                  <span className="font-mono text-xs">{d.code}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
