'use client';

import React, { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

interface DiseaseItem {
  id: string;
  name: string;
  dotColor: string;
  barGradient: string;
  percentageChange: string;
  percentageWidth: number; // 0 to 100
  cases: string;
  trendDirection: 'up' | 'down';
}

export const DiseaseTrendsBreakdownCard: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const diseases: DiseaseItem[] = [
    {
      id: 'flu',
      name: 'Influenza',
      dotColor: '#F2A33A',
      barGradient: 'from-[#F2A33A] to-[#EDCB63]',
      percentageChange: '~ 8%',
      percentageWidth: 68,
      cases: '21,431',
      trendDirection: 'up',
    },
    {
      id: 'noro',
      name: 'Norovirus',
      dotColor: '#F08A2E',
      barGradient: 'from-[#F08A2E] to-[#F2A33A]',
      percentageChange: '~ 11%',
      percentageWidth: 52,
      cases: '15,866',
      trendDirection: 'up',
    },
    {
      id: 'covid',
      name: 'COVID-19',
      dotColor: '#E5483D',
      barGradient: 'from-[#E5483D] to-[#F08A2E]',
      percentageChange: '~ 5%',
      percentageWidth: 42,
      cases: '12,745',
      trendDirection: 'up',
    },
    {
      id: 'salm',
      name: 'Salmonella',
      dotColor: '#7FB45A',
      barGradient: 'from-[#7FB45A] to-[#A3C87C]',
      percentageChange: '- 3%',
      percentageWidth: 34,
      cases: '10,541',
      trendDirection: 'down',
    },
  ];

  return (
    <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base sm:text-lg font-bold text-canary-text tracking-tight">
          Disease Trends
        </h2>

        {/* Dropdown Report Filter */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-deep/80 border border-white/10 text-xs font-semibold text-canary-text-2 hover:text-canary-text hover:border-canary-amber transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-canary-amber" />
            <span className="capitalize">{reportPeriod} Report</span>
            <ChevronDown className="w-3 h-3 text-canary-text-3" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-[#1B1B1D] border border-white/15 shadow-2xl z-30 p-1.5">
              <button
                onClick={() => {
                  setReportPeriod('weekly');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                  reportPeriod === 'weekly' ? 'bg-canary-amber/15 text-canary-amber font-bold' : 'text-canary-text-2 hover:bg-white/5'
                }`}
              >
                Weekly Report
              </button>
              <button
                onClick={() => {
                  setReportPeriod('monthly');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                  reportPeriod === 'monthly' ? 'bg-canary-amber/15 text-canary-amber font-bold' : 'text-canary-text-2 hover:bg-white/5'
                }`}
              >
                Monthly Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ranked Horizontal List */}
      <div className="space-y-4 my-auto">
        {diseases.map((d) => (
          <div key={d.id} className="group flex items-center justify-between gap-3 text-xs">
            {/* Disease Name with Status Dot */}
            <div className="flex items-center gap-2 w-28 shrink-0">
              <span
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: d.dotColor, boxShadow: `0 0 6px ${d.dotColor}` }}
              />
              <span className="font-semibold text-canary-text group-hover:text-canary-amber transition-colors">
                {d.name}
              </span>
            </div>

            {/* Horizontal Bar with Delta Pill */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${d.barGradient} transition-all duration-700`}
                  style={{ width: `${d.percentageWidth}%` }}
                />
              </div>
              <span
                className="text-[11px] font-mono font-medium shrink-0 w-12 text-right"
                style={{ color: d.dotColor }}
              >
                {d.percentageChange}
              </span>
            </div>

            {/* Case Counts */}
            <div className="w-24 text-right shrink-0">
              <span className="font-mono font-extrabold text-canary-text text-xs tracking-tight">
                {d.cases}
              </span>
              <span className="text-[10px] text-canary-text-3 font-normal ml-1">cases</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

