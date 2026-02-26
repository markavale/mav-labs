'use client';

import { cn } from '@/lib/utils';
import type { AgentState, TaskStatus } from '@/lib/types';

interface AgentStatusIndicatorProps {
  state: AgentState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const agentStateConfig: Record<AgentState, { label: string; color: string; pulseColor: string }> = {
  idle: {
    label: 'Idle',
    color: 'bg-text-muted',
    pulseColor: 'bg-text-muted/50',
  },
  thinking: {
    label: 'Thinking',
    color: 'bg-brand-cyan',
    pulseColor: 'bg-brand-cyan/50',
  },
  running_subagent: {
    label: 'Running Agent',
    color: 'bg-brand-purple',
    pulseColor: 'bg-brand-purple/50',
  },
  error: {
    label: 'Error',
    color: 'bg-status-error',
    pulseColor: 'bg-status-error/50',
  },
};

const sizeClasses = {
  sm: { dot: 'w-2 h-2', text: 'text-xs' },
  md: { dot: 'w-3 h-3', text: 'text-sm' },
  lg: { dot: 'w-4 h-4', text: 'text-base' },
};

export function AgentStatusIndicator({
  state,
  size = 'md',
  showLabel = false,
  className,
}: AgentStatusIndicatorProps) {
  const config = agentStateConfig[state];
  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            config.pulseColor,
            sizes.dot
          )}
        />
        <span className={cn('relative inline-flex rounded-full', config.color, sizes.dot)} />
      </span>
      {showLabel && <span className={cn('text-text-secondary', sizes.text)}>{config.label}</span>}
    </div>
  );
}

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: {
    label: 'To Do',
    color: 'text-status-todo',
    bgColor: 'bg-status-todo/10 border-status-todo/30',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-status-inProgress',
    bgColor: 'bg-status-inProgress/10 border-status-inProgress/30',
  },
  done: {
    label: 'Done',
    color: 'text-status-done',
    bgColor: 'bg-status-done/10 border-status-done/30',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-status-blocked',
    bgColor: 'bg-status-blocked/10 border-status-blocked/30',
  },
};

export function TaskStatusBadge({ status, size = 'md', className }: TaskStatusBadgeProps) {
  const config = taskStatusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded border',
        config.color,
        config.bgColor,
        sizeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
