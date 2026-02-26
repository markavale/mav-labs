'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { KanbanCard } from './card';
import { Plus } from 'lucide-react';
import type { KanbanCard as KanbanCardType, TaskStatus } from '@/lib/types';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  cards: KanbanCardType[];
  onAddCard?: () => void;
  onMoveCard?: (cardId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'border-status-todo',
  in_progress: 'border-status-inProgress',
  done: 'border-status-done',
  blocked: 'border-status-blocked',
};

const statusBgColors: Record<TaskStatus, string> = {
  todo: 'bg-status-todo/10',
  in_progress: 'bg-status-inProgress/10',
  done: 'bg-status-done/10',
  blocked: 'bg-status-blocked/10',
};

export function KanbanColumn({ title, status, cards, onAddCard, onMoveCard }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingCard, setDraggingCard] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    const fromStatus = e.dataTransfer.getData('fromStatus') as TaskStatus;
    if (cardId && fromStatus && fromStatus !== status) {
      onMoveCard?.(cardId, fromStatus, status);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col min-h-[500px] w-72 flex-shrink-0',
        'rounded-lg bg-dark-card border-t-2',
        statusColors[status],
        isDragOver && statusBgColors[status]
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-text-primary">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-dark-bg text-xs text-text-muted">
            {cards.length}
          </span>
        </div>
        {status === 'todo' && (
          <button
            onClick={onAddCard}
            className="p-1 rounded hover:bg-dark-bg text-text-muted hover:text-text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('cardId', card.id);
              e.dataTransfer.setData('fromStatus', card.status);
              setDraggingCard(card.id);
            }}
            onDragEnd={() => setDraggingCard(null)}
          >
            <KanbanCard
              card={card}
              isDragging={draggingCard === card.id}
            />
          </div>
        ))}

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-24 text-text-muted text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
