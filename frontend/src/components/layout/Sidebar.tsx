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
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

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
      label: 'Overview & Map',
      icon: LayoutDashboard,
      exact: true,
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
        >
          {/* Canary Bird Glowing Emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2A33A] to-[#E8C14A] flex items-center justify-center flex-shrink-0 shadow-amber-glow">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-canvas-deep fill-current" strokeWidth="0">
              <path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2.5 1 5 3 6.5L7 19l4.5-2c.2 0 .3 0 .5.1 4.5 1.2 8-2 8-6.1C20 6.5 16.5 2 12 2zm1 4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm-4 7c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
            </svg>
          </div>

          <div
            className={`flex flex-col overflow-hidden transition-opacity duration-200 ${
              isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-base font-bold text-canary-text tracking-wide uppercase">
              Canary
            </span>
            <span className="text-[10px] text-canary-text-3 truncate font-medium">
              Health Early-Warning
            </span>
          </div>
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
