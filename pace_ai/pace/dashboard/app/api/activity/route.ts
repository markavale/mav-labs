import { NextRequest, NextResponse } from 'next/server';
import { readStream } from '@/lib/redis';
import type { ActivityEntry, PaginatedResponse } from '@/lib/types';

function parseStreamEntry(id: string, fields: string[]): ActivityEntry {
  const data: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) data[fields[i]] = fields[i + 1];
  return {
    id,
    timestamp: data.timestamp || new Date().toISOString(),
    action: (data.action || 'heartbeat') as ActivityEntry['action'],
    description: data.description || '',
    paraCategory: data.paraCategory as ActivityEntry['paraCategory'],
    duration: data.duration ? parseInt(data.duration, 10) : undefined,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<ActivityEntry>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const action = searchParams.get('action');
    const paraCategory = searchParams.get('paraCategory');

    const raw = await readStream('pace:stream:activity', 200);
    let entries = raw.map(([id, fields]) => parseStreamEntry(id, fields)).reverse();

    if (action && action !== 'all') entries = entries.filter((e) => e.action === action);
    if (paraCategory && paraCategory !== 'all') entries = entries.filter((e) => e.paraCategory === paraCategory);

    const total = entries.length;
    const start = (page - 1) * pageSize;
    const paginatedEntries = entries.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      data: paginatedEntries,
      pagination: { page, pageSize, total, hasMore: start + pageSize < total },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity feed', pagination: { page: 1, pageSize: 20, total: 0, hasMore: false } },
      { status: 500 }
    );
  }
}
