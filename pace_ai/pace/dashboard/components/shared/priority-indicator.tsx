'use client';

import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/types';
import { AlertCircle, ArrowUp, ArrowUpRight, Minus } from 'lucide-react';

interface PriorityIndicatorProps {
  priority: Priority;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType }> = {
  urgent: {
    label: 'Urgent',
    color: 'text-status-error',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'text-status-warning',
    icon: ArrowUp,
  },
  medium: {
    label: 'Medium',
    color: 'text-brand-sky',
    icon: ArrowUpRight,
  },
  low: {
    label: 'Low',
    color: 'text-text-muted',
    icon: Minus,
  },
};

export function PriorityIndicator({
  priority,
  showLabel = false,
  size = 'md',
  className,
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1', config.color, className)}>
      <Icon className={iconSize} />
      {showLabel && <span className={textSize}>{config.label}</span>}
    </div>
  );
}
