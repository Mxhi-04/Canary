'use client';

import React from 'react';
import { FEED_HEALTH_LIST } from '@/lib/data/seededData';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export const FeedHealthPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-2.5">
      {FEED_HEALTH_LIST.map((feed) => {
        const isStale = feed.status === 'stale';
        const isMissing = feed.status === 'missing';

        return (
          <div
            key={feed.id}
            className={`p-3 rounded-control border canary-panel-inset flex flex-col gap-1.5 transition-colors ${
              isStale
                ? 'border-[#B89A5B]/40 bg-[#B89A5B]/5'
                : isMissing
                ? 'border-[#E5483D]/40 bg-[#E5483D]/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-canary-text truncate max-w-[200px]">
                {feed.streamName}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isStale ? (
                  <span className="flex items-center gap-1 text-[#B89A5B] font-medium text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Delayed (Stale)</span>
                  </span>
                ) : isMissing ? (
                  <span className="flex items-center gap-1 text-[#E5483D] font-medium text-[11px]">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Offline</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#7FB45A] font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Healthy</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-canary-text-3">
              <span className="truncate max-w-[180px]">{feed.source}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{feed.lastSuccess}</span>
              </span>
            </div>

            {feed.issueDescription && (
              <p className="text-[11px] text-[#B89A5B] bg-panel-inset/80 p-1.5 rounded border border-[#B89A5B]/20 mt-0.5">
                {feed.issueDescription}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
