import { NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { Project, ApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    const projects = await get<Project[]>('pace:projects') || [];
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}
