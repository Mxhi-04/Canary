import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ROLES, SEEDED_ALERTS } from '@/lib/data/seededData';
import { DemoRole } from '@/lib/types/domain';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieRole = request.cookies.get('canary_role')?.value as DemoRole | undefined;
  const roleParam = searchParams.get('role') as DemoRole | null;
  const activeRole: DemoRole = roleParam || cookieRole || 'oh_lead';

  const roleInfo = DEMO_ROLES.find((r) => r.id === activeRole) || DEMO_ROLES[0];

  const tierFilter = searchParams.get('tier');
  const hazardFilter = searchParams.get('hazard');
  const statusFilter = searchParams.get('status');

  let results = [...SEEDED_ALERTS];

  // Role scoping
  if (roleInfo.permittedUnitIds !== 'all') {
    results = results.filter((a) => roleInfo.permittedUnitIds.includes(a.unit.id));
  }

  // Tier filter
  if (tierFilter && tierFilter !== 'all') {
    results = results.filter((a) => a.tier.toLowerCase() === tierFilter.toLowerCase());
  }

  // Hazard filter
  if (hazardFilter && hazardFilter !== 'all') {
    results = results.filter((a) => a.hazard.toLowerCase() === hazardFilter.toLowerCase());
  }

  // Status filter
  if (statusFilter && statusFilter !== 'all') {
    results = results.filter((a) => a.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // Regulator role masking: if regulator, remove granular health count details
  if (activeRole === 'regulator') {
    results = results.map((alert) => ({
      ...alert,
      observedVsExpected: alert.observedVsExpected.map((stream) => {
        if (stream.provenance === 'simulated') {
          return {
            ...stream,
            history: stream.history.map((pt) => ({
              ...pt,
              observed: null, // Masked for regulator
            })),
          };
        }
        return stream;
      }),
      contributions: alert.contributions.map((c) => {
        if (c.provenance === 'simulated') {
          return {
            ...c,
            observed: '< 5 (Masked: Compliance View)',
            expected: 'Masked',
          };
        }
        return c;
      }),
    }));
  }

  const unacknowledgedActionCount = results.filter((a) => a.tier === 'ACTION' && a.status === 'active').length;

  return NextResponse.json({
    alerts: results,
    total: results.length,
    unacknowledgedActionCount,
    activeRole: roleInfo.id,
  });
}

