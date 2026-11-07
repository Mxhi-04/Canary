import { NextRequest, NextResponse } from 'next/server';
import { SUPPRESSION_DEMO_DATA } from '@/lib/data/seededData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kParam = searchParams.get('k');
  const k = kParam ? Math.max(3, Math.min(10, parseInt(kParam, 10))) : 5;

  // Dynamically calculate small-cell suppression based on k
  const rows = SUPPRESSION_DEMO_DATA.map((item) => {
    const isBelowK = item.rawCount < k;
    let maskedValue: string | number = item.rawCount;
    let isSuppressed = false;
    let isSecondary = false;
    let reason = '';

    if (isBelowK) {
      isSuppressed = true;
      maskedValue = `< ${k}`;
      reason = `Primary suppression: count (${item.rawCount}) is below privacy threshold k=${k}.`;
    } else if (item.isSecondarySuppressed) {
      isSecondary = true;
      maskedValue = `< ${k} (secondary masked)`;
      reason = 'Secondary suppression: masked so this cell cannot be deduced from column totals.';
    }

    return {
      ...item,
      maskedValue,
      isSuppressed,
      isSecondarySuppressed: isSecondary,
      suppressionReason: reason || undefined,
    };
  });

  return NextResponse.json({
    kThreshold: k,
    totalRecords: rows.length,
    suppressedCount: rows.filter((r) => r.isSuppressed || r.isSecondarySuppressed).length,
    rows,
    boundaryNotice: 'Canary strictly enforces aggregate-only ingestion. No individual-level records or employment profiles are ever collected or stored.',
  });
}

