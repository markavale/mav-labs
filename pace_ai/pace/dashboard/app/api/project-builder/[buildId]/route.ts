import { NextRequest, NextResponse } from 'next/server';
import { getBuild } from '@/lib/services/project-builder';
import type { ApiResponse } from '@/lib/types';
import type { BuildState } from '@/lib/services/project-builder';

// ---------------------------------------------------------------------------
// GET /api/project-builder/[buildId] — get build status
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    const build = getBuild(params.buildId);

    if (!build) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Build not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<BuildState>>({
      success: true,
      data: build,
    });
  } catch (err) {
    console.error('[ProjectBuilder API] GET [buildId] error:', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch build' },
      { status: 500 }
    );
  }
}
