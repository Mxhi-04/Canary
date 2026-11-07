import { NextRequest, NextResponse } from 'next/server';
import { REPLAY_DATA, SCENARIOS } from '@/lib/data/seededData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scenario: string }> }
) {
  const { scenario } = await params;
  const { searchParams } = new URL(request.url);
  const dayParam = searchParams.get('day');
  const allParam = searchParams.get('all');

  const scenarioMeta = SCENARIOS.find((s) => s.id === scenario) || SCENARIOS[0];
  const scenarioDays = REPLAY_DATA[scenarioMeta.id] || REPLAY_DATA['scen-respiratory'];

  if (allParam === 'true') {
    return NextResponse.json({
      scenario: scenarioMeta,
      days: scenarioDays,
      totalDays: scenarioDays.length,
    });
  }

  const dayNumber = dayParam ? parseInt(dayParam, 10) : 4;
  const dayState = scenarioDays.find((d) => d.dayNumber === dayNumber) || scenarioDays[0];

  return NextResponse.json({
    scenario: scenarioMeta,
    dayState,
    totalDays: scenarioDays.length,
  });
}

