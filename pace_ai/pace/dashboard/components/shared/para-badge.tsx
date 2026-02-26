'use client';

import { cn } from '@/lib/utils';
import type { ParaCategory } from '@/lib/types';

interface ParaBadgeProps {
  category: ParaCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryConfig: Record<ParaCategory, { label: string; color: string; bgColor: string }> = {
  projects: {
    label: 'Project',
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-cyan/10 border-brand-cyan/30',
  },
  areas: {
    label: 'Area',
    color: 'text-brand-purple',
    bgColor: 'bg-brand-purple/10 border-brand-purple/30',
  },
  resources: {
    label: 'Resource',
    color: 'text-brand-sky',
    bgColor: 'bg-brand-sky/10 border-brand-sky/30',
  },
  archives: {
    label: 'Archive',
    color: 'text-text-muted',
    bgColor: 'bg-text-muted/10 border-text-muted/30',
  },
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function ParaBadge({ category, size = 'md', className }: ParaBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.color,
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
