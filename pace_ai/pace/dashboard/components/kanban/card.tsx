'use client';

import { cn } from '@/lib/utils';
import { ParaBadge } from '@/components/shared/para-badge';
import { PriorityIndicator } from '@/components/shared/priority-indicator';
import { Clock, GripVertical } from 'lucide-react';
import type { KanbanCard as KanbanCardType } from '@/lib/types';

interface KanbanCardProps {
  card: KanbanCardType;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function KanbanCard({ card, isDragging, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group p-3 rounded-lg bg-dark-bg border border-dark-border',
        'hover:border-dark-border/80 cursor-grab active:cursor-grabbing',
        'transition-all duration-150',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg'
      )}
    >
      {/* Header: Priority + Drag Handle */}
      <div className="flex items-center justify-between mb-2">
        <PriorityIndicator priority={card.priority} size="sm" />
        <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-text-primary mb-2 line-clamp-2">
        {card.title}
      </h4>

      {/* Description (if exists) */}
      {card.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Footer: PARA Badge + Days in Column */}
      <div className="flex items-center justify-between">
        <ParaBadge category={card.paraCategory} size="sm" />
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{card.daysInColumn}d</span>
        </div>
      </div>
    </div>
  );
}
