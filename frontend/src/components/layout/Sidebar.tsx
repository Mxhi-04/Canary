'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  AlertTriangle,
  PlaySquare,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { CanaryLogo } from '@/components/shared/CanaryLogo';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    {
      href: '/',
      label: 'Landing Story',
      icon: Home,
      exact: true,
    },
    {
      href: '/dashboard',
      label: 'Surveillance Room',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/map',
      label: 'Geospatial Map',
      icon: MapPin,
    },
    {
      href: '/alerts',
      label: 'Alert Inbox',
      icon: AlertTriangle,
      badge: '3',
      badgeColor: 'bg-[#E5483D] text-white',
    },
    {
      href: '/replay',
      label: 'Scenario Replay',
      icon: PlaySquare,
    },
    {
      href: '/validation',
      label: 'Validation & Evaluation',
      icon: BarChart3,
    },
    {
      href: '/privacy',
      label: 'Privacy & Governance',
      icon: ShieldCheck,
    },
    {
      href: '/impact',
      label: 'Impact Estimator',
      icon: TrendingUp,
    },
    {
      href: '/settings',
      label: 'Settings & Telemetry',
      icon: Settings,
    },
  ];

  const isCurrent = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`hidden md:flex flex-col bg-canvas-deep border-r border-border transition-all duration-300 z-30 select-none ${
          isExpanded ? 'w-56' : 'w-[72px]'
        }`}
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          className="h-16 flex items-center px-4 gap-3 border-b border-border/80 overflow-hidden hover:bg-panel transition-colors"
          title="Canary Early-Warning Platform"
        >
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <CanaryLogo variant="full" size="md" />
            </div>
          ) : (
            <CanaryLogo variant="mark" size="md" />
          )}
        </Link>

        {/* Navigation List */}
        <nav className="flex-1 py-4 flex flex-col gap-1.5 px-2">
          {navItems.map((item) => {
            const active = isCurrent(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center h-12 rounded-control px-3 transition-colors ${
                  active
                    ? 'bg-panel-raised text-canary-amber font-medium'
                    : 'text-canary-text-2 hover:bg-panel hover:text-canary-text'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-canary-amber rounded-r shadow-amber-glow" />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-canary-amber' : ''}`} />

                <span
                  className={`ml-3.5 text-xs tracking-normal truncate transition-opacity duration-200 ${
                    isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-panel-inset text-canary-text-2'
                    } ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Expand Toggle Helper */}
        <div className="p-3 border-t border-border flex items-center justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-control text-canary-text-3 hover:text-canary-text hover:bg-panel transition-colors"
            title={isExpanded ? 'Collapse Navigation Rail' : 'Expand Navigation Rail'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-canvas-deep border-t border-border z-40 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isCurrent(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 rounded-control ${
                active ? 'text-canary-amber' : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[54px]">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
};
