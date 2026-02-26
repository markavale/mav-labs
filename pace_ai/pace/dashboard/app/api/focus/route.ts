import { NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { FocusPlan, ApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<FocusPlan>>> {
  try {
    const plan = await get<FocusPlan>('pace:focus') || { todayTasks: [], weeklyPriorities: [], generatedAt: new Date().toISOString() };
    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch focus plan' }, { status: 500 });
  }
}
