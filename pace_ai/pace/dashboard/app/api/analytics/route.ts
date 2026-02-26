import { NextRequest, NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { AnalyticsData, ApiResponse } from '@/lib/types';

const DEFAULT_ANALYTICS: AnalyticsData = {
  taskThroughput: [],
  paraDistribution: { projects: 0, areas: 0, resources: 0 },
  projectVelocity: [],
  skillsRadar: [],
  fitnessTrends: [],
  learningProgress: [],
  researchOutput: [],
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AnalyticsData>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d';
    let data = await get<AnalyticsData>('pace:analytics') || DEFAULT_ANALYTICS;

    if (range === '7d') {
      data = {
        ...data,
        taskThroughput: data.taskThroughput.slice(-7),
        fitnessTrends: data.fitnessTrends.slice(-7),
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
