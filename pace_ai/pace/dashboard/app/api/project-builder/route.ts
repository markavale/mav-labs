import { NextRequest, NextResponse } from 'next/server';
import { startBuild, getAllBuilds } from '@/lib/services/project-builder';
import type { ApiResponse } from '@/lib/types';
import type { BuildState } from '@/lib/services/project-builder';

// ---------------------------------------------------------------------------
// GET /api/project-builder — list all builds
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const builds = getAllBuilds();
    return NextResponse.json<ApiResponse<BuildState[]>>({
      success: true,
      data: builds,
    });
  } catch (err) {
    console.error('[ProjectBuilder API] GET error:', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to list builds' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/project-builder — start a new build
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, description, techStack, features } = body as {
      projectName?: string;
      description?: string;
      techStack?: string[];
      features?: string[];
    };

    if (!projectName || !description) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'projectName and description are required' },
        { status: 400 }
      );
    }

    const build = await startBuild({
      projectName,
      description,
      techStack,
      features,
    });

    return NextResponse.json<ApiResponse<BuildState>>(
      {
        success: true,
        data: build,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[ProjectBuilder API] POST error:', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to start build' },
      { status: 500 }
    );
  }
}
