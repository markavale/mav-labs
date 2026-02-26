import { NextRequest, NextResponse } from 'next/server';
import { get, set, publish, CHANNELS } from '@/lib/redis';
import type { KanbanCard, ApiResponse, KanbanBoard } from '@/lib/types';

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<KanbanCard>>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const board = await get<KanbanBoard>('pace:kanban:board');
    if (!board) return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });

    let card: KanbanCard | undefined;
    const columns = board.columns as Record<string, KanbanCard[]>;
    for (const col of Object.keys(columns)) {
      const idx = columns[col].findIndex((c: KanbanCard) => c.id === id);
      if (idx !== -1) {
        card = columns[col].splice(idx, 1)[0];
        break;
      }
    }
    if (!card) return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });

    const updated: KanbanCard = { ...card, ...body, updatedAt: new Date().toISOString() };
    if (body.status && body.status !== card.status) updated.daysInColumn = 0;
    const targetCol = updated.status || card.status;
    (board.columns as Record<string, KanbanCard[]>)[targetCol].push(updated);

    await set('pace:kanban:board', board);
    await publish(CHANNELS.KANBAN, { type: 'card_updated', card: updated });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await params;
    const board = await get<KanbanBoard>('pace:kanban:board');
    if (!board) return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });

    const columns = board.columns as Record<string, KanbanCard[]>;
    for (const col of Object.keys(columns)) {
      const idx = columns[col].findIndex((c: KanbanCard) => c.id === id);
      if (idx !== -1) { columns[col].splice(idx, 1); break; }
    }

    await set('pace:kanban:board', board);
    await publish(CHANNELS.KANBAN, { type: 'card_deleted', cardId: id });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete card' }, { status: 500 });
  }
}
