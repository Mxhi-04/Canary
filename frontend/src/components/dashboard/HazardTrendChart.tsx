'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ProvenanceBadge } from '../shared/ProvenanceBadge';

interface HazardTrendChartProps {
  className?: string;
}

export const HazardTrendChart: React.FC<HazardTrendChartProps> = ({ className = '' }) => {
  const [activeMetric, setActiveMetric] = useState<'pm25_clinic' | 'heat_firstaid'>('pm25_clinic');

  const pm25Data = [
    { date: '1 Nov', pm25: 28, clinicVisits: 3, baselineClinic: 3.8 },
    { date: '2 Nov', pm25: 34, clinicVisits: 4, baselineClinic: 3.7 },
    { date: '3 Nov', pm25: 48, clinicVisits: 4, baselineClinic: 3.9 },
    { date: '4 Nov', pm25: 82, clinicVisits: 5, baselineClinic: 3.8 },
    { date: '5 Nov', pm25: 114, clinicVisits: 9, baselineClinic: 4.0 },
    { date: '6 Nov', pm25: 122, clinicVisits: 13, baselineClinic: 4.1 },
    { date: '7 Nov', pm25: 118, clinicVisits: 14, baselineClinic: 3.9 },
  ];

  const heatData = [
    { date: '1 Nov', wbgt: 29.2, heatVisits: 1, baselineVisits: 1.4 },
    { date: '2 Nov', wbgt: 30.1, heatVisits: 1, baselineVisits: 1.5 },
    { date: '3 Nov', wbgt: 31.4, heatVisits: 2, baselineVisits: 1.6 },
    { date: '4 Nov', wbgt: 33.1, heatVisits: 3, baselineVisits: 1.5 },
    { date: '5 Nov', wbgt: 34.5, heatVisits: 6, baselineVisits: 1.6 },
    { date: '6 Nov', wbgt: 34.8, heatVisits: 9, baselineVisits: 1.7 },
    { date: '7 Nov', wbgt: 34.2, heatVisits: 8, baselineVisits: 1.5 },
  ];

  const data = activeMetric === 'pm25_clinic' ? pm25Data : heatData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-panel-raised border border-border p-3 rounded-control shadow-xl text-xs space-y-1.5 z-50">
          <span className="font-semibold text-canary-text block mb-1">{label}</span>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-canary-text-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-medium text-canary-text tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Metric Selector Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-panel-inset p-1 rounded-control border border-border">
          <button
            onClick={() => setActiveMetric('pm25_clinic')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeMetric === 'pm25_clinic'
                ? 'bg-panel-raised text-canary-amber shadow-sm'
                : 'text-canary-text-3 hover:text-canary-text'
            }`}
          >
            PM2.5 vs Respiratory Consults
          </button>
          <button
            onClick={() => setActiveMetric('heat_firstaid')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeMetric === 'heat_firstaid'
                ? 'bg-panel-raised text-canary-amber shadow-sm'
                : 'text-canary-text-3 hover:text-canary-text'
            }`}
          >
            WBGT Heat vs First-Aid
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#6FA8C7]" />
            <span className="text-canary-text-3 text-[11px]">Exposure (Real)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#F2A33A]" />
            <span className="text-canary-text-3 text-[11px]">Observed Outcome (Sim)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 border-b border-dashed border-canary-text-3" />
            <span className="text-canary-text-3 text-[11px]">Baseline Expected</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#2C2C2E" strokeDasharray="3 3" opacity={0.6} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8A857C"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2C2C2E' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#8A857C"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2C2C2E' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#8A857C"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Exposure Line (Real / Approx) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={activeMetric === 'pm25_clinic' ? 'pm25' : 'wbgt'}
              name={activeMetric === 'pm25_clinic' ? 'PM2.5 (µg/m³)' : 'WBGT (°C)'}
              stroke="#6FA8C7"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6FA8C7' }}
              activeDot={{ r: 5 }}
            />

            {/* Observed Clinic / First-Aid Visits (Simulated) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={activeMetric === 'pm25_clinic' ? 'clinicVisits' : 'heatVisits'}
              name={activeMetric === 'pm25_clinic' ? 'Clinic Encounters' : 'Heat First-Aid'}
              stroke="#F2A33A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F2A33A' }}
              activeDot={{ r: 6 }}
            />

            {/* Expected GLM Baseline (Dashed) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={activeMetric === 'pm25_clinic' ? 'baselineClinic' : 'baselineVisits'}
              name="Expected Baseline"
              stroke="#8A857C"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
