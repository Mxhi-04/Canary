import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ROLES, DISTRICTS, MONITORING_UNITS } from '@/lib/data/seededData';
import { DemoRole } from '@/lib/types/domain';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieRole = request.cookies.get('canary_role')?.value as DemoRole | undefined;
  const roleParam = searchParams.get('role') as DemoRole | null;
  const activeRole: DemoRole = roleParam || cookieRole || 'oh_lead';

  const roleInfo = DEMO_ROLES.find((r) => r.id === activeRole) || DEMO_ROLES[0];

  // Server-side role scoping
  let filteredUnits = MONITORING_UNITS;
  if (roleInfo.permittedUnitIds !== 'all') {
    filteredUnits = MONITORING_UNITS.filter((u) => roleInfo.permittedUnitIds.includes(u.id));
  }

  // Calculate summary metrics
  const totalSites = filteredUnits.length;
  const sitesAtAlertOrAbove = filteredUnits.filter((u) => u.currentTier === 'ALERT' || u.currentTier === 'ACTION').length;
  const openActionAlerts = filteredUnits.filter((u) => u.currentTier === 'ACTION').length;
  const avgCompleteness = Math.round(
    filteredUnits.reduce((acc, u) => acc + u.completeness, 0) / (totalSites || 1)
  );

  return NextResponse.json({
    activeRole: roleInfo.id,
    roleTitle: roleInfo.title,
    roleScope: roleInfo.scope,
    districts: DISTRICTS,
    units: filteredUnits,
    overallCompleteness: avgCompleteness,
    totalSites,
    sitesAtAlertOrAbove,
    openActionAlerts,
    deltas: {
      completenessDelta: 2, // +2% vs previous 7 days
      sitesAtAlertDelta: 1, // +1 site vs previous 7 days
      openActionsDelta: 1, // +1 action vs previous 7 days
      comparisonPeriod: 'vs previous 7 days',
    },
  });
}

