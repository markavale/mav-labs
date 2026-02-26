import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { get, set, publish, CHANNELS, addToStream } from '@/lib/redis';
import type { Note, ApiResponse, ParaCategory } from '@/lib/types';

const MAX_CONTENT_LENGTH = 10000;
const VALID_PARA_CATEGORIES: ParaCategory[] = ['projects', 'areas', 'resources', 'archives'];

function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, MAX_CONTENT_LENGTH)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');
}

function isValidParaCategory(category: unknown): category is ParaCategory {
  return typeof category === 'string' && VALID_PARA_CATEGORIES.includes(category as ParaCategory);
}

export async function GET(): Promise<NextResponse<ApiResponse<Note[]>>> {
  try {
    const notes = await get<Note[]>('pace:notes:list') || [];
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const body = await request.json();
    const content = sanitizeString(body.content);
    if (!content || content.length < 1) {
      return NextResponse.json({ success: false, error: 'Content is required and must be non-empty' }, { status: 400 });
    }
    const paraCategory = isValidParaCategory(body.paraCategory) ? body.paraCategory : undefined;
    const newNote: Note = { id: randomUUID(), content, paraCategory, sentAt: new Date().toISOString() };

    const notes = await get<Note[]>('pace:notes:list') || [];
    notes.unshift(newNote);
    await set('pace:notes:list', notes);
    await publish(CHANNELS.NOTES, { type: 'note_received', note: newNote });
    await addToStream('pace:stream:activity', {
      action: 'note_received',
      description: `Received note: "${content.substring(0, 50)}"`,
      timestamp: newNote.sentAt,
      ...(paraCategory ? { paraCategory } : {}),
    });

    return NextResponse.json({ success: true, data: newNote });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send note' }, { status: 500 });
  }
}
