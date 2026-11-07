import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ROLES, SEEDED_ALERTS } from '@/lib/data/seededData';
import { DemoRole } from '@/lib/types/domain';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await params;
  const { searchParams } = new URL(request.url);
  const cookieRole = request.cookies.get('canary_role')?.value as DemoRole | undefined;
  const roleParam = searchParams.get('role') as DemoRole | null;
  const activeRole: DemoRole = roleParam || cookieRole || 'oh_lead';

  const roleInfo = DEMO_ROLES.find((r) => r.id === activeRole) || DEMO_ROLES[0];

  const alert = SEEDED_ALERTS.find(
    (a) => a.id.toLowerCase() === alertId.toLowerCase()
  );

  if (!alert) {
    return NextResponse.json(
      { error: `Alert with ID "${alertId}" was not found.` },
      { status: 404 }
    );
  }

  // Check authorization
  if (roleInfo.permittedUnitIds !== 'all' && !roleInfo.permittedUnitIds.includes(alert.unit.id)) {
    return NextResponse.json(
      {
        error: `Access denied. Role "${roleInfo.title}" is not authorized to access operational alert details for unit "${alert.unit.name}".`,
        code: 'ROLE_FORBIDDEN',
      },
      { status: 403 }
    );
  }

  // Mask health count detail if regulator
  let responseAlert = { ...alert };
  if (activeRole === 'regulator') {
    responseAlert = {
      ...responseAlert,
      observedVsExpected: responseAlert.observedVsExpected.map((stream) => {
        if (stream.provenance === 'simulated') {
          return {
            ...stream,
            history: stream.history.map((pt) => ({
              ...pt,
              observed: null, // suppressed
            })),
          };
        }
        return stream;
      }),
      contributions: responseAlert.contributions.map((c) => {
        if (c.provenance === 'simulated') {
          return {
            ...c,
            observed: '< 5 (Masked: Compliance View)',
            expected: 'Masked',
          };
        }
        return c;
      }),
    };
  }

  return NextResponse.json(responseAlert);
}
