import { NextRequest, NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { ResearchEntry, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ResearchEntry[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const entries = await get<ResearchEntry[]>('pace:research:results') || [];

    if (!query) return NextResponse.json({ success: true, data: entries });

    const results = entries.filter((entry) => {
      const searchableText = [entry.topic, entry.content, ...entry.keyFindings, ...entry.sources.map((s) => s.title)].join(' ').toLowerCase();
      return searchableText.includes(query);
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to search research' }, { status: 500 });
  }
}
