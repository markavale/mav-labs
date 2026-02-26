import { NextRequest, NextResponse } from 'next/server';
import { get } from '@/lib/redis';
import type { Project, ApiResponse } from '@/lib/types';

interface RouteParams { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { slug } = await params;
    const projects = await get<Project[]>('pace:projects') || [];
    const project = projects.find((p) => p.slug === slug);
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 });
  }
}
