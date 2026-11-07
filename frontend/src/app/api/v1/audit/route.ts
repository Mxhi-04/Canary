import { NextRequest, NextResponse } from 'next/server';
import { AUDIT_LOG_SAMPLE, DEMO_ROLES } from '@/lib/data/seededData';
import { AuditEvent, DemoRole } from '@/lib/types/domain';

// In-memory demo store for newly triggered audit events during session
const dynamicAuditLogs: AuditEvent[] = [...AUDIT_LOG_SAMPLE];

export async function GET() {
  return NextResponse.json({
    events: dynamicAuditLogs,
    total: dynamicAuditLogs.length,
    retentionPolicyDays: 90,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieRole = request.cookies.get('canary_role')?.value as DemoRole | undefined;
    const actorRole = body.actorRole || cookieRole || 'oh_lead';
    const roleInfo = DEMO_ROLES.find((r) => r.id === actorRole) || DEMO_ROLES[0];

    const newEvent: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorRole: roleInfo.id,
      actorLabel: roleInfo.title,
      eventType: body.eventType || 'VIEW_ALERT',
      resourceType: body.resourceType || 'general_view',
      resourceId: body.resourceId || 'canary_ui',
      timestamp: new Date().toISOString(),
      details: body.details || 'User performed protected action.',
      ipMasked: '192.168.***.***',
    };

    dynamicAuditLogs.unshift(newEvent);

    return NextResponse.json({ success: true, event: newEvent });
  } catch {
    return NextResponse.json({ error: 'Failed to record audit event' }, { status: 400 });
  }
}

