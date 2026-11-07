import { NextResponse } from 'next/server';
import { BACKTEST_SUMMARY } from '@/lib/data/seededData';

export async function GET() {
  return NextResponse.json(BACKTEST_SUMMARY);
}

