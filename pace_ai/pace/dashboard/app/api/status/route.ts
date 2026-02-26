import { NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { AgentStatus, ApiResponse } from '@/lib/types';

const DEFAULT_STATUS: AgentStatus = {
  state: 'idle',
  lastHeartbeat: new Date().toISOString(),
  uptime: 0,
  tasksCompletedToday: 0,
  modelUsage: { sonnetCalls: 0, opusCalls: 0 },
};

export async function GET(): Promise<NextResponse<ApiResponse<AgentStatus>>> {
  try {
    const status = await get<AgentStatus>('pace:status') || DEFAULT_STATUS;
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch agent status' }, { status: 500 });
  }
}
