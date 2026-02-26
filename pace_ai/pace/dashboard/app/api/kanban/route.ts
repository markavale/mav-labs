import { NextRequest, NextResponse } from 'next/server';
import { get, set, publish, CHANNELS } from '@/lib/redis';
import { seedRedisIfEmpty } from '@/lib/seed-redis';
import type { KanbanCard, ApiResponse, KanbanBoard } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<KanbanBoard>>> {
  try {
    await seedRedisIfEmpty();
    const board = await get<KanbanBoard>('pace:kanban:board');
    return NextResponse.json({ success: true, data: board || { columns: { todo: [], in_progress: [], done: [], blocked: [] } } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch kanban board' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<KanbanCard>>> {
  try {
    const body = await request.json();
    const newCard: KanbanCard = {
      id: Math.random().toString(36).substring(2, 11),
      title: body.title,
      description: body.description,
      status: 'todo',
      paraCategory: body.paraCategory || 'projects',
      priority: body.priority || 'medium',
      projectSlug: body.projectSlug,
      areaSlug: body.areaSlug,
      daysInColumn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const board = await get<KanbanBoard>('pace:kanban:board') || { columns: { todo: [], in_progress: [], done: [], blocked: [] } };
    board.columns.todo.unshift(newCard);
    await set('pace:kanban:board', board);
    await publish(CHANNELS.KANBAN, { type: 'card_created', card: newCard });
    return NextResponse.json({ success: true, data: newCard });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create card' }, { status: 500 });
  }
}
