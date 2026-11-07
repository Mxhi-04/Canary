import React from 'react';
import { ProvenanceBadge } from '../shared/ProvenanceBadge';
import { Database, Radio, Stethoscope, Briefcase } from 'lucide-react';

export const DataSourcesFooter: React.FC = () => {
  const sources = [
    {
      name: 'Open-Meteo European CAMS',
      type: 'Environmental PM2.5 / PM10',
      provenance: 'real' as const,
      status: 'Live · Refreshed hourly',
      icon: Radio,
    },
    {
      name: 'ECMWF High-Res Atmosphere',
      type: 'Ambient Temp & Relative Humidity',
      provenance: 'real' as const,
      status: 'Live · Refreshed hourly',
      icon: Radio,
    },
    {
      name: 'Occupational Clinics Syndicate',
      type: 'Syndromic Consultations (Aggregated)',
      provenance: 'simulated' as const,
      status: 'Synthetic Batch · Daily',
      icon: Stethoscope,
    },
    {
      name: 'Enterprise Attendance & HR',
      type: 'Sickness Absence & Incident Logs',
      provenance: 'simulated' as const,
      status: 'Synthetic Batch · Daily',
      icon: Briefcase,
    },
  ];

  return (
    <div className="canary-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-canary-text-2">
        <Database className="w-4 h-4 text-canary-amber" />
        <span>Connected Data Feeds ({sources.length}):</span>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 flex-1 justify-start md:justify-end">
        {sources.map((src, i) => {
          const Icon = src.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-control canary-panel-inset border border-border text-xs"
            >
              <Icon className="w-3.5 h-3.5 text-canary-text-3" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-canary-text text-[11px]">{src.name}</span>
                  <ProvenanceBadge kind={src.provenance} size="sm" />
                </div>
                <span className="text-[10px] text-canary-text-3">{src.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

