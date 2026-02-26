'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDuration } from '@/lib/utils';
import { ParaBadge } from '@/components/shared/para-badge';
import { SearchBar } from '@/components/shared/search-bar';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Search as SearchIcon,
  FileText,
  MessageSquare,
  Heart,
  Zap,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ActivityEntry, ActivityAction } from '@/lib/types';

interface ActivityFeedProps {
  entries: ActivityEntry[];
}

const actionConfig: Record<
  ActivityAction,
  { icon: React.ElementType; color: string; label: string }
> = {
  task_created: { icon: Circle, color: 'text-brand-cyan', label: 'Task Created' },
  task_completed: { icon: CheckCircle, color: 'text-status-success', label: 'Task Completed' },
  task_moved: { icon: ArrowRight, color: 'text-brand-purple', label: 'Task Moved' },
  research_started: { icon: SearchIcon, color: 'text-brand-sky', label: 'Research Started' },
  research_completed: { icon: FileText, color: 'text-brand-sky', label: 'Research Completed' },
  note_received: { icon: MessageSquare, color: 'text-status-warning', label: 'Note Received' },
  heartbeat: { icon: Heart, color: 'text-text-muted', label: 'Heartbeat' },
  skill_executed: { icon: Zap, color: 'text-brand-purple', label: 'Skill Executed' },
  error: { icon: AlertCircle, color: 'text-status-error', label: 'Error' },
  briefing_sent: { icon: Send, color: 'text-brand-cyan', label: 'Briefing Sent' },
};

export function ActivityFeed({ entries }: ActivityFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ActivityAction | 'all'>('all');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || entry.action === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search activity..."
          className="w-64"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ActivityAction | 'all')}
          className={cn(
            'px-3 py-2 rounded-lg bg-dark-card border border-dark-border',
            'text-sm text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-brand-cyan/50'
          )}
        >
          <option value="all">All Actions</option>
          {Object.entries(actionConfig).map(([action, config]) => (
            <option key={action} value={action}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredEntries.map((entry) => {
          const config = actionConfig[entry.action];
          const Icon = config.icon;
          const isExpanded = expandedIds.has(entry.id);
          const hasDetails = entry.details && Object.keys(entry.details).length > 0;

          return (
            <div
              key={entry.id}
              className="p-4 rounded-lg bg-dark-card border border-dark-border"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn('p-2 rounded-lg bg-dark-bg', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-text-primary">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">
                          {formatDateTime(entry.timestamp)}
                        </span>
                        {entry.duration && (
                          <span className="text-xs text-text-muted">
                            · {formatDuration(entry.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    {entry.paraCategory && (
                      <ParaBadge category={entry.paraCategory} size="sm" />
                    )}
                  </div>

                  {/* Expandable Details */}
                  {hasDetails && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" /> Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" /> Show details
                          </>
                        )}
                      </button>

                      {isExpanded && entry.details && (
                        <div className="mt-2 p-3 rounded bg-dark-bg text-xs space-y-2">
                          {entry.details.outputSummary && (
                            <div>
                              <span className="text-text-muted">Summary: </span>
                              <span className="text-text-secondary">
                                {entry.details.outputSummary}
                              </span>
                            </div>
                          )}
                          {entry.details.filesModified &&
                            entry.details.filesModified.length > 0 && (
                              <div>
                                <span className="text-text-muted">Files: </span>
                                <span className="text-text-secondary font-mono">
                                  {entry.details.filesModified.join(', ')}
                                </span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex items-center justify-center h-32 text-text-muted">
            No activity found
          </div>
        )}
      </div>
    </div>
  );
}
