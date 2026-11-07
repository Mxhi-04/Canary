'use client';

import React, { useState, useMemo } from 'react';
import { MonitoringUnit } from '@/lib/types/domain';
import {
  ChevronDown,
  Building2,
  FlaskConical,
  Activity,
  Wind,
  MapPin,
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Info,
  Maximize2
} from 'lucide-react';

export interface DubaiPlace {
  id: string;
  name: string;
  arabicName?: string;
  category: 'industrial' | 'worker_zone' | 'urban' | 'logistics' | 'coastal';
  categoryLabel: string;
  x: number;
  y: number;
  tier: 'ACTION' | 'ALERT' | 'WATCH' | 'NORMAL';
  cases: number;
  caseTrend: string;
  primaryRisk: string;
  workforceCount: string;
  leadTimeGain: string;
  playbook: string;
  isHotspot: boolean;
  hotspotRadius?: number;
}

const DUBAI_PLACES: DubaiPlace[] = [
  {
    id: 'dxb-jafza',
    name: 'Jebel Ali Port & JAFZA',
    arabicName: 'جبل علي',
    category: 'industrial',
    categoryLabel: 'Industrial Free Zone & Deepwater Port',
    x: 160,
    y: 375,
    tier: 'ACTION',
    cases: 4850,
    caseTrend: '+18% (7d)',
    primaryRisk: 'WBGT Heat Strain (34.8°C) + PM2.5 Inversion',
    workforceCount: '185,000 workers',
    leadTimeGain: '+2.8d Early Warning',
    playbook: 'Deploy 14 Hydration Stations & Enforce Mandatory 15m Shade Rotations',
    isHotspot: true,
    hotspotRadius: 28,
  },
  {
    id: 'dxb-dip',
    name: 'Dubai Investment Park (DIP)',
    arabicName: 'مجمع دبي للاستثمار',
    category: 'worker_zone',
    categoryLabel: 'Light Manufacturing & Worker Accommodations',
    x: 245,
    y: 405,
    tier: 'ALERT',
    cases: 2340,
    caseTrend: '+12% (7d)',
    primaryRisk: 'Thermal Index Surge & Ambient Particulate Dust',
    workforceCount: '110,000 workers',
    leadTimeGain: '+2.4d Early Warning',
    playbook: 'Activate Electrolyte Hubs & Inspect Residence HVAC Filtration',
    isHotspot: true,
    hotspotRadius: 22,
  },
  {
    id: 'dxb-south',
    name: 'Dubai South & Expo City',
    arabicName: 'دبي الجنوب',
    category: 'logistics',
    categoryLabel: 'Al Maktoum Int Airport & Aviation Cargo',
    x: 325,
    y: 445,
    tier: 'ALERT',
    cases: 2860,
    caseTrend: '+15% (7d)',
    primaryRisk: 'WBGT Heat Wave Precursor (+2.9d Lead Horizon)',
    workforceCount: '78,000 workers',
    leadTimeGain: '+2.9d Early Warning',
    playbook: 'Reschedule Tarmac Operations to Twilight Hours & Deploy Mobile Cooling',
    isHotspot: true,
    hotspotRadius: 24,
  },
  {
    id: 'dxb-marina',
    name: 'Dubai Marina & JBR',
    arabicName: 'مرسى دبي',
    category: 'coastal',
    categoryLabel: 'Waterfront Commercial & Hospitality',
    x: 295,
    y: 285,
    tier: 'NORMAL',
    cases: 510,
    caseTrend: '-3% (7d)',
    primaryRisk: 'Nominal Baseline Operating Parameters',
    workforceCount: '42,000 workers',
    leadTimeGain: '+1.2d Early Warning',
    playbook: 'Standard Environmental Monitoring Protocol',
    isHotspot: false,
  },
  {
    id: 'dxb-palm',
    name: 'Palm Jumeirah',
    arabicName: 'نخلة جميرا',
    category: 'coastal',
    categoryLabel: 'Coastal Tourism & Marine Recreation',
    x: 320,
    y: 195,
    tier: 'NORMAL',
    cases: 380,
    caseTrend: '-1% (7d)',
    primaryRisk: 'Within Normal Baseline Range',
    workforceCount: '28,000 workers',
    leadTimeGain: '+1.0d Early Warning',
    playbook: 'Routine Marine Sensor & Health Telemetry Ingestion',
    isHotspot: false,
  },
  {
    id: 'dxb-barsha',
    name: 'Al Barsha',
    arabicName: 'البرشاء',
    category: 'urban',
    categoryLabel: 'Mixed Commercial & Retail Logistics',
    x: 385,
    y: 280,
    tier: 'WATCH',
    cases: 1120,
    caseTrend: '+5% (7d)',
    primaryRisk: 'Mild Syndromic Cough & Cold Index Rise',
    workforceCount: '65,000 workers',
    leadTimeGain: '+1.8d Early Warning',
    playbook: 'Distribute Clinic Advisories & Monitor Retail Absence Ledgers',
    isHotspot: true,
    hotspotRadius: 16,
  },
  {
    id: 'dxb-alquoz',
    name: 'Al Quoz Industrial (1–4)',
    arabicName: 'القوز الصناعية',
    category: 'industrial',
    categoryLabel: 'Heavy Fabrication & High-Density Worker Quarters',
    x: 450,
    y: 225,
    tier: 'ACTION',
    cases: 3420,
    caseTrend: '+24% (7d)',
    primaryRisk: 'Syndromic Gastrointestinal Cluster + Ambient Heat Load',
    workforceCount: '145,000 workers',
    leadTimeGain: '+2.5d Early Warning',
    playbook: 'Immediate Water Testing Sweep & Central Dining Facility Disinfection',
    isHotspot: true,
    hotspotRadius: 26,
  },
  {
    id: 'dxb-jumeirah',
    name: 'Jumeirah',
    arabicName: 'جميرا',
    category: 'coastal',
    categoryLabel: 'Coastal Heritage & Medical Enclaves',
    x: 435,
    y: 175,
    tier: 'NORMAL',
    cases: 490,
    caseTrend: '+2% (7d)',
    primaryRisk: 'Stable Baseline Telemetry',
    workforceCount: '35,000 workers',
    leadTimeGain: '+1.0d Early Warning',
    playbook: 'Routine Monitoring',
    isHotspot: false,
  },
  {
    id: 'dxb-downtown',
    name: 'Downtown Dubai & DIFC',
    arabicName: 'وسط دبي',
    category: 'urban',
    categoryLabel: 'Financial Freezone & Burj Khalifa Commercial Core',
    x: 530,
    y: 145,
    tier: 'NORMAL',
    cases: 640,
    caseTrend: '-2% (7d)',
    primaryRisk: 'Corporate Indoor Baseline Nominal',
    workforceCount: '92,000 workers',
    leadTimeGain: '+1.1d Early Warning',
    playbook: 'Indoor Air Quality Filtration Optimization',
    isHotspot: false,
  },
  {
    id: 'dxb-bizbay',
    name: 'Business Bay',
    arabicName: 'الخليج التجاري',
    category: 'urban',
    categoryLabel: 'Commercial High-Rise & Services',
    x: 515,
    y: 185,
    tier: 'WATCH',
    cases: 810,
    caseTrend: '+4% (7d)',
    primaryRisk: 'Tower HVAC Recirculation Flag & Mild Particulate',
    workforceCount: '70,000 workers',
    leadTimeGain: '+1.6d Early Warning',
    playbook: 'Issue HVAC Filter Cleaning Advisory to Facilities Teams',
    isHotspot: true,
    hotspotRadius: 15,
  },
  {
    id: 'dxb-burdubai',
    name: 'Bur Dubai',
    arabicName: 'بر دبي',
    category: 'urban',
    categoryLabel: 'Historic Creek South & High-Density Trade',
    x: 610,
    y: 120,
    tier: 'WATCH',
    cases: 1520,
    caseTrend: '+8% (7d)',
    primaryRisk: 'Early Seasonal Influenza Indicator in High-Density Retail',
    workforceCount: '85,000 workers',
    leadTimeGain: '+1.9d Early Warning',
    playbook: 'Issue Community Pharmacy Alert & Syndromic Follow-up',
    isHotspot: true,
    hotspotRadius: 18,
  },
  {
    id: 'dxb-deira',
    name: 'Deira (Old Dubai)',
    arabicName: 'ديرة',
    category: 'urban',
    categoryLabel: 'Wholesale Commerce, Gold Souk & Trading Docks',
    x: 665,
    y: 90,
    tier: 'ALERT',
    cases: 2180,
    caseTrend: '+16% (7d)',
    primaryRisk: 'Acute Respiratory (Influenza A) Cluster Expansion',
    workforceCount: '120,000 workers',
    leadTimeGain: '+2.2d Early Warning',
    playbook: 'Targeted Merchant Health Outreach & Rapid Antigen Testing Kits',
    isHotspot: true,
    hotspotRadius: 22,
  },
  {
    id: 'dxb-dxbairport',
    name: 'DXB Aviation Hub',
    arabicName: 'مطار دبي الدولي',
    category: 'logistics',
    categoryLabel: 'Global Passenger Hub & Air Cargo Terminal',
    x: 720,
    y: 110,
    tier: 'WATCH',
    cases: 1380,
    caseTrend: '+6% (7d)',
    primaryRisk: 'Transit Screening & Cross-Border Infectious Signals',
    workforceCount: '60,000 workers',
    leadTimeGain: '+1.8d Early Warning',
    playbook: 'Coordinate with Airport Quarantine & Border Health Units',
    isHotspot: true,
    hotspotRadius: 18,
  },
  {
    id: 'dxb-rasalkhor',
    name: 'Ras Al Khor Industrial',
    arabicName: 'رأس الخور',
    category: 'industrial',
    categoryLabel: 'Automotive Logistics & Light Fabrication',
    x: 685,
    y: 195,
    tier: 'WATCH',
    cases: 1290,
    caseTrend: '+9% (7d)',
    primaryRisk: 'Elevated Industrial PM2.5 (84 µg/m³ peak)',
    workforceCount: '55,000 workers',
    leadTimeGain: '+2.0d Early Warning',
    playbook: 'Issue Mist Cannon Dust Suppression & Mandatory Particle Masks',
    isHotspot: true,
    hotspotRadius: 18,
  },
  {
    id: 'dxb-warsan',
    name: 'International City & Al Warsan',
    arabicName: 'المدينة العالمية / ورسان',
    category: 'worker_zone',
    categoryLabel: 'Dense Worker Housing & Municipal Utilities',
    x: 755,
    y: 230,
    tier: 'ALERT',
    cases: 1840,
    caseTrend: '+14% (7d)',
    primaryRisk: 'Water Quality Vector Precursor & Thermal Strain',
    workforceCount: '95,000 workers',
    leadTimeGain: '+2.3d Early Warning',
    playbook: 'Inspect Water Distribution Cisterns & Issue Boil Advisories',
    isHotspot: true,
    hotspotRadius: 20,
  },
  {
    id: 'dxb-dso',
    name: 'Dubai Silicon Oasis (DSO)',
    arabicName: 'واحة دبي للسيليكون',
    category: 'urban',
    categoryLabel: 'Technology Freezone & Academic City',
    x: 680,
    y: 290,
    tier: 'NORMAL',
    cases: 520,
    caseTrend: '-1% (7d)',
    primaryRisk: 'Optimal Baseline Conditions',
    workforceCount: '48,000 workers',
    leadTimeGain: '+1.3d Early Warning',
    playbook: 'Routine Telemetry Ingestion',
    isHotspot: false,
  },
  {
    id: 'dxb-mirdif',
    name: 'Mirdif & Al Warqa',
    arabicName: 'مردف',
    category: 'urban',
    categoryLabel: 'Established Residential & Community Healthcare',
    x: 785,
    y: 165,
    tier: 'NORMAL',
    cases: 610,
    caseTrend: '+1% (7d)',
    primaryRisk: 'Within Expected Baseline Envelope',
    workforceCount: '32,000 workers',
    leadTimeGain: '+1.2d Early Warning',
    playbook: 'Standard Community Monitoring',
    isHotspot: false,
  },
  {
    id: 'dxb-khawaneej',
    name: 'Al Khawaneej',
    arabicName: 'الخوانيج',
    category: 'urban',
    categoryLabel: 'Agricultural Belt & Border Zone',
    x: 850,
    y: 170,
    tier: 'NORMAL',
    cases: 390,
    caseTrend: '0% (7d)',
    primaryRisk: 'Baseline Stable Agricultural Index',
    workforceCount: '20,000 workers',
    leadTimeGain: '+1.1d Early Warning',
    playbook: 'Routine Environmental Telemetry',
    isHotspot: false,
  },
  {
    id: 'dxb-hatta',
    name: 'Hatta Mountain Enclave',
    arabicName: 'حتا (جبال الحجر)',
    category: 'logistics',
    categoryLabel: 'Hajar Mountains Outpost · Oman Border (110km SE)',
    x: 875,
    y: 430,
    tier: 'WATCH',
    cases: 180,
    caseTrend: '+5% (7d)',
    primaryRisk: 'Mountain Microclimate & Border Clinic Telemetry',
    workforceCount: '14,000 workers',
    leadTimeGain: '+1.5d Early Warning',
    playbook: 'Monitor Mountain Hydration & Remote Clinic Reporting',
    isHotspot: true,
    hotspotRadius: 14,
  },
];

interface SurveillanceMapCardProps {
  units?: MonitoringUnit[];
  onSelectUnit?: (unit: MonitoringUnit) => void;
  selectedUnitId?: string | null;
}

export const SurveillanceMapCard: React.FC<SurveillanceMapCardProps> = ({
  units = [],
  onSelectUnit,
  selectedUnitId,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'industrial' | 'worker_zone' | 'urban' | 'logistics' | 'critical'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>('dxb-alquoz');
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [showHighways, setShowHighways] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Active highlighted place
  const activePlace = useMemo(() => {
    const id = hoveredPlaceId || selectedPlaceId;
    return DUBAI_PLACES.find((p) => p.id === id) || DUBAI_PLACES[0];
  }, [hoveredPlaceId, selectedPlaceId]);

  // Filtered places according to category
  const visiblePlaces = useMemo(() => {
    if (activeCategoryFilter === 'all') return DUBAI_PLACES;
    if (activeCategoryFilter === 'critical') {
      return DUBAI_PLACES.filter((p) => p.tier === 'ACTION' || p.tier === 'ALERT');
    }
    return DUBAI_PLACES.filter((p) => p.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  const handlePlaceClick = (place: DubaiPlace) => {
    setSelectedPlaceId(place.id);
    if (onSelectUnit) {
      // Adapt to MonitoringUnit interface for the SiteDrawer
      const adaptedUnit: MonitoringUnit = {
        id: place.id,
        name: place.name,
        districtId: 'dis-dxb',
        districtName: 'Dubai Emirate',
        unitType: place.category === 'industrial' ? 'construction' : place.category === 'worker_zone' ? 'accommodation' : place.category === 'logistics' ? 'logistics' : 'office',
        latitude: 25.0 + place.y / 1000,
        longitude: 55.1 + place.x / 1000,
        headcountBand: place.workforceCount,
        currentTier: place.tier === 'NORMAL' ? null : place.tier,
        completeness: 94,
        openAlertCount: place.tier === 'ACTION' ? 2 : place.tier === 'ALERT' ? 1 : 0,
        feedStatus: 'ok',
        primaryRiskReason: place.primaryRisk,
        observedTrendPercent: parseInt(place.caseTrend) || 12,
      };
      onSelectUnit(adaptedUnit);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Top Header inside Map */}
      <div className="relative z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-panel/75 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-canary-text tracking-tight flex items-center gap-2">
              <span>Dubai Emirate Surveillance Map</span>
            </h2>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-canary-amber/15 border border-canary-amber/30 text-[10px] font-mono font-bold text-canary-amber uppercase tracking-wider">
              Dubai Focus
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-canvas-deep border border-white/10 text-xs overflow-x-auto max-w-[420px] sm:max-w-none">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#F2A33A] text-canvas-deep font-bold shadow-sm'
                  : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              All Dubai (19)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('industrial')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategoryFilter === 'industrial'
                  ? 'bg-[#F2A33A] text-canvas-deep font-bold shadow-sm'
                  : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              Industrial Hubs
            </button>
            <button
              onClick={() => setActiveCategoryFilter('worker_zone')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategoryFilter === 'worker_zone'
                  ? 'bg-[#F2A33A] text-canvas-deep font-bold shadow-sm'
                  : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              Worker Quarters
            </button>
            <button
              onClick={() => setActiveCategoryFilter('critical')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategoryFilter === 'critical'
                  ? 'bg-[#E5483D] text-white font-bold shadow-sm'
                  : 'text-canary-text-3 hover:text-[#E5483D]'
              }`}
            >
              Critical (Action)
            </button>
          </div>
        </div>

        {/* 142 ACTIVE Pill with Dropdown */}
        <div className="relative flex items-center gap-2">
          {/* Layer toggles */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-canary-text-3 mr-1">
            <button
              onClick={() => setShowHighways(!showHighways)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors ${
                showHighways ? 'bg-white/10 text-canary-amber border-canary-amber/30' : 'bg-transparent text-canary-text-3 border-white/5 hover:text-canary-text'
              }`}
              title="Toggle Highways (E11, E44, E311)"
            >
              Highways
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors ${
                showLabels ? 'bg-white/10 text-canary-amber border-canary-amber/30' : 'bg-transparent text-canary-text-3 border-white/5 hover:text-canary-text'
              }`}
              title="Toggle Town Labels"
            >
              Labels
            </button>
          </div>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-deep/90 border border-white/15 text-xs font-semibold text-canary-text hover:border-canary-amber transition-all shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A33A] shadow-[0_0_8px_#F2A33A] animate-pulse" />
            <span className="text-canary-amber font-mono font-bold">142 ACTIVE</span>
            <ChevronDown className="w-3.5 h-3.5 text-canary-text-3" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-10 mt-2 w-56 rounded-2xl bg-[#1B1B1D] border border-white/15 shadow-2xl z-40 p-1.5">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-canary-text-3 font-semibold">
                Dubai Surveillance Feeds
              </div>
              <button
                onClick={() => {
                  setActiveCategoryFilter('all');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between text-canary-amber bg-canary-amber/15 font-bold"
              >
                <span>All Dubai Feeds</span>
                <span className="font-mono text-xs opacity-75">142</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategoryFilter('industrial');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between text-canary-text-2 hover:bg-white/5"
              >
                <span>Industrial Zones</span>
                <span className="font-mono text-xs opacity-75">48</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategoryFilter('critical');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between text-canary-text-2 hover:bg-white/5"
              >
                <span>Critical Outbreak Feeds</span>
                <span className="font-mono text-xs opacity-75">26</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] bg-[#0A0D12] overflow-hidden select-none">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Geographic SVG of Dubai Emirate */}
        <svg
          viewBox="0 0 1000 540"
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arabian Gulf Water Gradient */}
            <linearGradient id="gulfGradient" x1="0%" y1="0%" x2="70%" y2="70%">
              <stop offset="0%" stopColor="#0B131E" />
              <stop offset="60%" stopColor="#0E1624" />
              <stop offset="100%" stopColor="#121D2C" />
            </linearGradient>

            {/* Dubai Territory Surface Gradient */}
            <linearGradient id="dubaiLandGradient" x1="20%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#1A1C22" />
              <stop offset="50%" stopColor="#181A20" />
              <stop offset="100%" stopColor="#141519" />
            </linearGradient>

            {/* Hotspot Amber Pulsing Radial Glow */}
            <radialGradient id="dxbAmberGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2C2" stopOpacity="1" />
              <stop offset="25%" stopColor="#F2A33A" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#F2A33A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F2A33A" stopOpacity="0" />
            </radialGradient>

            {/* Hotspot Red Pulsing Radial Glow */}
            <radialGradient id="dxbRedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD1CA" stopOpacity="1" />
              <stop offset="30%" stopColor="#E5483D" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#E5483D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E5483D" stopOpacity="0" />
            </radialGradient>

            {/* Hotspot Yellow Watch Radial Glow */}
            <radialGradient id="dxbYellowGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDE0" stopOpacity="1" />
              <stop offset="35%" stopColor="#EDCB63" stopOpacity="0.75" />
              <stop offset="80%" stopColor="#EDCB63" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EDCB63" stopOpacity="0" />
            </radialGradient>

            {/* Water Canal & Creek Gradient */}
            <linearGradient id="creekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A2D40" />
              <stop offset="100%" stopColor="#0E1926" />
            </linearGradient>
          </defs>

          {/* 1. Arabian Gulf Water Backdrop */}
          <rect width="1000" height="540" fill="url(#gulfGradient)" />

          {/* Faint sonar / bathymetric rings in Arabian Gulf */}
          <circle cx="340" cy="110" r="120" fill="none" stroke="#25384D" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.3" />
          <circle cx="340" cy="110" r="240" fill="none" stroke="#25384D" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.2" />
          <circle cx="340" cy="110" r="360" fill="none" stroke="#25384D" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.1" />

          {/* Gulf Water Typography & Compass */}
          <g opacity="0.35" className="pointer-events-none select-none">
            <text x="180" y="80" fill="#7FA9C9" fontSize="13" fontStyle="italic" letterSpacing="6" fontWeight="bold">
              ARABIAN GULF
            </text>
            <text x="180" y="98" fill="#4D6F8A" fontSize="9" letterSpacing="3" fontFamily="monospace">
              DUBAI COASTAL WATERS · OFFSHORE SECTOR
            </text>
          </g>

          {/* Compass Rose in upper Gulf */}
          <g transform="translate(85, 75)" opacity="0.4" className="pointer-events-none">
            <circle cx="0" cy="0" r="18" fill="none" stroke="#7FA9C9" strokeWidth="0.8" />
            <line x1="0" y1="-24" x2="0" y2="24" stroke="#7FA9C9" strokeWidth="1" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#7FA9C9" strokeWidth="1" />
            <polygon points="0,-22 3,-10 -3,-10" fill="#F2A33A" />
            <text x="0" y="-27" fill="#F2A33A" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              N
            </text>
          </g>

          {/* 2. Offshore Landmarks: The World Islands */}
          <g opacity="0.45" stroke="#3A4D60" strokeWidth="0.6" fill="#1C242E">
            <ellipse cx="475" cy="88" rx="42" ry="24" fill="none" stroke="#36495C" strokeDasharray="3 3" />
            {/* The World islands sandbar dots */}
            <circle cx="455" cy="80" r="2.2" />
            <circle cx="465" cy="78" r="2.8" />
            <circle cx="478" cy="80" r="3" />
            <circle cx="490" cy="82" r="2.5" />
            <circle cx="460" cy="92" r="2.6" />
            <circle cx="472" cy="94" r="3.2" />
            <circle cx="485" cy="92" r="2.9" />
            <circle cx="495" cy="95" r="2" />
            <text x="475" y="106" fill="#6A859E" fontSize="7" fontStyle="italic" textAnchor="middle">
              The World Islands
            </text>
          </g>

          {/* 3. Main Dubai Emirate Landmass Polygon */}
          <path
            d="M 100,420 
               L 135,395 
               L 145,380 L 155,405 L 175,400 L 180,375 L 195,370 
               L 205,345 Q 185,320 220,335 L 235,345 
               L 275,310 
               L 285,295 L 295,305 
               L 330,275 
               L 310,220 
               C 270,205 290,155 330,160 
               C 365,165 370,210 345,235 
               L 355,260 
               L 395,230 
               L 420,210 
               L 460,180 
               L 495,155 
               L 535,130 
               L 575,105 L 595,75 L 618,90 L 610,110 
               L 625,95 
               L 640,120 L 665,145 L 655,175 L 680,205 
               L 630,90 
               L 660,75 L 720,50 L 770,35 
               L 790,35 
               L 850,80 L 910,140 L 950,210 L 960,260 
               L 940,440 L 880,500 L 650,520 L 420,520 L 220,520 
               L 100,420 Z"
            fill="url(#dubaiLandGradient)"
            stroke="#3F4350"
            strokeWidth="1.2"
          />

          {/* 4. Iconic Waterways carved into land: Dubai Creek & Dubai Water Canal */}
          {/* Dubai Creek (Khor Dubai) S-curve separating Bur Dubai and Deira */}
          <path
            d="M 622,93 
               C 630,110 635,125 645,135 
               C 655,145 665,155 660,170 
               C 655,185 665,195 685,202 
               C 705,208 720,200 710,190 
               C 690,180 680,160 670,145 
               C 660,130 648,110 632,90 Z"
            fill="url(#creekGradient)"
            stroke="#2C4156"
            strokeWidth="0.8"
          />

          {/* Dubai Water Canal joining Creek & Arabian Gulf */}
          <path
            d="M 495,155 
               Q 515,170 525,185 
               Q 540,200 570,195 
               L 590,195 
               Q 630,195 660,190"
            fill="none"
            stroke="#263B50"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Burj Al Arab Island offshore */}
          <g>
            <path d="M 405,195 L 412,190 L 415,198 Z" fill="#EDE8DF" stroke="#F2A33A" strokeWidth="0.8" />
            <line x1="412" y1="198" x2="422" y2="208" stroke="#F2A33A" strokeWidth="1" strokeDasharray="1 1" />
            <text x="390" y="190" fill="#EDE8DF" fontSize="7.5" fontWeight="bold">
              Burj Al Arab
            </text>
          </g>

          {/* 5. Boundaries with neighboring Emirates */}
          {/* Abu Dhabi Border (SW) */}
          <g stroke="#E5483D" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.6">
            <line x1="100" y1="420" x2="220" y2="520" />
          </g>
          <g transform="translate(115, 495) rotate(-40)" opacity="0.6">
            <text x="0" y="0" fill="#E5483D" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ← ABU DHABI EMIRATE BORDER (GHANTOOT)
            </text>
          </g>

          {/* Sharjah Border (NE) */}
          <g stroke="#F2A33A" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.6">
            <line x1="790" y1="35" x2="960" y2="260" />
          </g>
          <g transform="translate(860, 110) rotate(52)" opacity="0.6">
            <text x="0" y="0" fill="#F2A33A" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              SHARJAH EMIRATE BORDER (AL NAHDA / KHAWANEEJ) →
            </text>
          </g>

          {/* 6. Major Dubai Highway Arterial Corridors (Highways Layer) */}
          {showHighways && (
            <g className="transition-opacity duration-300">
              {/* E11 - Sheikh Zayed Road (The Primary Glowing Spine) */}
              <path
                d="M 115,425 L 180,380 L 285,305 L 375,245 L 475,180 L 565,135 L 640,105 L 730,70 L 795,45"
                fill="none"
                stroke="#F2A33A"
                strokeWidth="2.2"
                strokeOpacity="0.75"
              />
              <path
                d="M 115,425 L 180,380 L 285,305 L 375,245 L 475,180 L 565,135 L 640,105 L 730,70 L 795,45"
                fill="none"
                stroke="#FFF2C2"
                strokeWidth="0.8"
                strokeDasharray="8 6"
                strokeOpacity="0.9"
              />
              {/* E11 Highway Badge */}
              <g transform="translate(260, 315)">
                <rect width="24" height="12" rx="3" fill="#141519" stroke="#F2A33A" strokeWidth="0.8" />
                <text x="12" y="9" fill="#F2A33A" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  E11
                </text>
              </g>

              {/* E44 - Al Khail Road / Ras Al Khor Rd */}
              <path
                d="M 230,410 L 335,330 L 445,255 L 555,195 L 670,215 L 765,245 L 850,270"
                fill="none"
                stroke="#A8B0BE"
                strokeWidth="1.4"
                strokeOpacity="0.45"
              />
              {/* E44 Badge */}
              <g transform="translate(425, 260)">
                <rect width="24" height="12" rx="3" fill="#141519" stroke="#A8B0BE" strokeWidth="0.8" />
                <text x="12" y="9" fill="#A8B0BE" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  E44
                </text>
              </g>

              {/* E311 - Sheikh Mohammed Bin Zayed Road */}
              <path
                d="M 160,460 L 275,395 L 425,315 L 585,250 L 725,205 L 835,155 L 900,120"
                fill="none"
                stroke="#8A92A0"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                strokeOpacity="0.35"
              />
              {/* E311 Badge */}
              <g transform="translate(565, 255)">
                <rect width="28" height="12" rx="3" fill="#141519" stroke="#8A92A0" strokeWidth="0.8" />
                <text x="14" y="9" fill="#8A92A0" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  E311
                </text>
              </g>

              {/* E611 - Emirates Road */}
              <path
                d="M 220,495 L 365,435 L 535,365 L 705,300 L 855,235 L 940,195"
                fill="none"
                stroke="#646B78"
                strokeWidth="1"
                strokeDasharray="6 4"
                strokeOpacity="0.25"
              />
            </g>
          )}

          {/* 7. Hatta Mountain Enclave Inset Outline (Southeast) */}
          <g transform="translate(825, 380)" className="cursor-pointer" onClick={() => handlePlaceClick(DUBAI_PLACES.find((p) => p.id === 'dxb-hatta')!)}>
            <rect width="145" height="95" rx="10" fill="#14161C" stroke="rgba(242,163,58,0.4)" strokeWidth="1" />
            <path d="M 10,75 L 35,45 L 60,65 L 85,35 L 115,70 L 135,55" fill="none" stroke="#EDCB63" strokeWidth="1.2" strokeOpacity="0.5" />
            <text x="12" y="20" fill="#EDE8DF" fontSize="9.5" fontWeight="bold">
              Hatta Enclave Inset
            </text>
            <text x="12" y="32" fill="#EDCB63" fontSize="8" fontFamily="monospace">
              Hajar Mtns · 110km SE
            </text>
            <circle cx="85" cy="55" r="4" fill="#EDCB63" />
            <text x="12" y="85" fill="#A8B0BE" fontSize="7.5">
              180 Active Cases · Stable
            </text>
          </g>

          {/* 8. Pulsing Glowing Hotspots & Location Markers */}
          {visiblePlaces.map((place) => {
            const isHovered = hoveredPlaceId === place.id;
            const isSelected = selectedPlaceId === place.id;
            const isAction = place.tier === 'ACTION';
            const isAlert = place.tier === 'ALERT';
            const isWatch = place.tier === 'WATCH';
            const radius = place.hotspotRadius || 14;

            return (
              <g
                key={place.id}
                className="cursor-pointer group"
                onClick={() => handlePlaceClick(place)}
                onMouseEnter={() => setHoveredPlaceId(place.id)}
                onMouseLeave={() => setHoveredPlaceId(null)}
              >
                {/* Outer Pulsing Glow */}
                {place.isHotspot && (
                  <circle
                    cx={place.x}
                    cy={place.y}
                    r={radius * (isHovered || isSelected ? 1.6 : 1.3)}
                    fill={
                      isAction
                        ? 'url(#dxbRedGlow)'
                        : isAlert
                        ? 'url(#dxbAmberGlow)'
                        : 'url(#dxbYellowGlow)'
                    }
                    className="animate-pulse"
                    opacity={isHovered || isSelected ? 1 : 0.85}
                  />
                )}

                {/* Target Reticle Crosshair on Hover/Selected */}
                {(isHovered || isSelected) && (
                  <g className="animate-spin" style={{ transformOrigin: `${place.x}px ${place.y}px`, animationDuration: '8s' }}>
                    <circle
                      cx={place.x}
                      cy={place.y}
                      r={radius + 8}
                      fill="none"
                      stroke={isAction ? '#E5483D' : '#F2A33A'}
                      strokeWidth="1.2"
                      strokeDasharray="6 4"
                    />
                  </g>
                )}

                {/* Center Core Dot */}
                <circle
                  cx={place.x}
                  cy={place.y}
                  r={isHovered || isSelected ? 6.5 : isAction ? 5.5 : 4.5}
                  fill={
                    isAction
                      ? '#FFD1CA'
                      : isAlert
                      ? '#FFEAA7'
                      : isWatch
                      ? '#FFFDE0'
                      : '#C8F7E4'
                  }
                  stroke={
                    isAction
                      ? '#E5483D'
                      : isAlert
                      ? '#F2A33A'
                      : isWatch
                      ? '#EDCB63'
                      : '#34D399'
                  }
                  strokeWidth={isHovered || isSelected ? 2.5 : 2}
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.9))"
                  className="transition-all duration-200"
                />

                {/* Town / Place Name Typography Labels */}
                {showLabels && (
                  <g transform={`translate(${place.x}, ${place.y})`} className="pointer-events-none">
                    {/* Shadow halo for text legibility */}
                    <text
                      x={place.x > 750 ? -12 : 12}
                      y={place.y > 420 ? -10 : 4}
                      fill="#0B0D11"
                      stroke="#0B0D11"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                      fontSize={isAction || isAlert ? "10" : "9"}
                      fontWeight="bold"
                      textAnchor={place.x > 750 ? "end" : "start"}
                      className="select-none"
                    >
                      {place.name}
                    </text>
                    {/* Actual Text Label */}
                    <text
                      x={place.x > 750 ? -12 : 12}
                      y={place.y > 420 ? -10 : 4}
                      fill={
                        isAction
                          ? '#FFA49A'
                          : isAlert
                          ? '#FCD58B'
                          : isWatch
                          ? '#EDE8DF'
                          : '#B6C4D4'
                      }
                      fontSize={isAction || isAlert ? "10" : "9"}
                      fontWeight={isAction || isAlert ? "bold" : "600"}
                      textAnchor={place.x > 750 ? "end" : "start"}
                      className="select-none tracking-tight"
                    >
                      {place.name}
                    </text>

                    {/* Arabic Subtitle for Key Districts */}
                    {place.arabicName && (isAction || isAlert || isHovered) && (
                      <text
                        x={place.x > 750 ? -12 : 12}
                        y={place.y > 420 ? -20 : 14}
                        fill="#A88349"
                        fontSize="7.5"
                        textAnchor={place.x > 750 ? "end" : "start"}
                        className="select-none opacity-80"
                      >
                        {place.arabicName}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 9. Floating Interactive HUD Telemetry Card for Selected/Hovered Place */}
        {activePlace && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-[calc(100%-1.5rem)] sm:w-[380px] rounded-2xl bg-[#121317]/95 border border-white/15 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl z-30 transition-all duration-300">
            <div className="flex items-start justify-between gap-2.5 mb-2.5 pb-2 border-b border-white/10">
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      activePlace.tier === 'ACTION'
                        ? 'bg-[#E5483D] animate-ping'
                        : activePlace.tier === 'ALERT'
                        ? 'bg-[#F2A33A] animate-pulse'
                        : activePlace.tier === 'WATCH'
                        ? 'bg-[#EDCB63]'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <h3 className="text-xs sm:text-sm font-black text-canary-text tracking-tight truncate flex items-center gap-1.5">
                    <span className="truncate">{activePlace.name}</span>
                    {activePlace.arabicName && (
                      <span className="text-[11px] font-normal text-canary-amber opacity-75 shrink-0">
                        ({activePlace.arabicName})
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-[10px] text-canary-text-3 font-medium truncate mt-0.5">
                  {activePlace.categoryLabel}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                  activePlace.tier === 'ACTION'
                    ? 'bg-[#E5483D]/20 text-[#FF9085] border border-[#E5483D]/40'
                    : activePlace.tier === 'ALERT'
                    ? 'bg-[#F2A33A]/20 text-canary-amber border border-canary-amber/40'
                    : activePlace.tier === 'WATCH'
                    ? 'bg-[#EDCB63]/20 text-[#EDCB63] border border-[#EDCB63]/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {activePlace.tier} TIER
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-1 mb-2 text-center bg-black/30 rounded-xl p-2 border border-white/5">
              <div>
                <div className="text-[10px] uppercase font-mono text-canary-text-3">Active Cases</div>
                <div className="text-xs sm:text-sm font-black text-canary-text font-mono">
                  {activePlace.cases.toLocaleString()}
                </div>
                <div
                  className={`text-[9px] font-mono font-semibold ${
                    activePlace.caseTrend.startsWith('+') ? 'text-[#E5483D]' : 'text-emerald-400'
                  }`}
                >
                  {activePlace.caseTrend}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-canary-text-3">Workforce</div>
                <div className="text-xs sm:text-sm font-bold text-canary-text-2">
                  {activePlace.workforceCount.replace(' workers', '')}
                </div>
                <div className="text-[9px] text-canary-text-3">Protected</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-canary-text-3">Early Lead</div>
                <div className="text-xs sm:text-sm font-black text-canary-amber font-mono">
                  {activePlace.leadTimeGain.replace(' Early Warning', '')}
                </div>
                <div className="text-[9px] text-canary-amber/80 font-mono">Ahead of Risk</div>
              </div>
            </div>

            {/* Primary Risk Stream & Recommended Playbook */}
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-1.5 text-canary-text-2">
                <Flame className="w-3.5 h-3.5 text-[#F2A33A] shrink-0 mt-0.5" />
                <span className="line-clamp-1 font-medium">
                  <strong className="text-canary-text">Signal:</strong> {activePlace.primaryRisk}
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-canary-text-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">
                  <strong className="text-canary-text-2">Playbook:</strong> {activePlace.playbook}
                </span>
              </div>
            </div>

            {/* Open Drawer CTA */}
            {onSelectUnit && (
              <button
                onClick={() => handlePlaceClick(activePlace)}
                className="mt-3 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#F2A33A] to-[#EDCB63] text-canvas-deep font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md"
              >
                <span>Inspect District Dossier & Telemetry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Integrated Bottom Data Sources Strip */}
      <div className="relative z-20 px-6 py-3.5 bg-canvas-deep/90 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-canary-text-3 font-mono text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-canary-amber" />
          <span>Data Sources:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-canary-text-2 text-xs">
          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Building2 className="w-3.5 h-3.5 text-[#6FA8C7]" />
            <span>Healthcare facilities (42)</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <FlaskConical className="w-3.5 h-3.5 text-[#C58BD9]" />
            <span>Laboratories (18)</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Activity className="w-3.5 h-3.5 text-[#EDCB63]" />
            <span>Workplace Agencies (12)</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Wind className="w-3.5 h-3.5 text-[#7FB45A]" />
            <span>Environmental Sensors (86)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
