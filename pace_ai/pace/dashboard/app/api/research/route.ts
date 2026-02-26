import { NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { ResearchEntry, ApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<ResearchEntry[]>>> {
  try {
    const entries = await get<ResearchEntry[]>('pace:research:results') || [];
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch research entries' }, { status: 500 });
  }
}
