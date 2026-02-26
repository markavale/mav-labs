'use client';

import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { Button } from '@/components/shared/button';
import { KanbanCard } from '@/components/kanban/card';
import {
  AlertCircle,
  Calendar,
  Clock,
  Code,
  FileText,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import type { Project } from '@/lib/types';

interface ProjectDetailProps {
  project: Project;
}

const statusConfig: Record<Project['status'], { label: string; color: string; bgColor: string }> = {
  active: {
    label: 'Active',
    color: 'text-status-success',
    bgColor: 'bg-status-success/10 border-status-success/30',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-status-blocked',
    bgColor: 'bg-status-blocked/10 border-status-blocked/30',
  },
  paused: {
    label: 'Paused',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10 border-status-warning/30',
  },
  archived: {
    label: 'Archived',
    color: 'text-text-muted',
    bgColor: 'bg-text-muted/10 border-text-muted/30',
  },
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const status = statusConfig[project.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border',
                status.color,
                status.bgColor
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="text-text-secondary">{project.description}</p>
        </div>

        <Button variant="primary">
          <MessageSquare className="w-4 h-4 mr-2" />
          Quick Update
        </Button>
      </div>

      {/* Blocker Alert */}
      {project.status === 'blocked' && project.topBlocker && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-status-blocked/10 border border-status-blocked/30">
          <AlertCircle className="w-5 h-5 text-status-blocked flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-status-blocked">Project Blocked</p>
            <p className="text-sm text-text-secondary mt-1">{project.topBlocker}</p>
          </div>
        </div>
      )}

      {/* Progress + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-cyan" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-muted">Completion</span>
                <span className="font-medium text-text-primary">{project.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-dark-bg overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock className="w-4 h-4" />
              <span>Last activity: {formatRelativeTime(project.lastActivity)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-purple" />
              Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {project.metrics &&
                Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    <p className="text-xs text-text-muted capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Notes */}
      {project.architectureNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-sky" />
              Architecture Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary font-mono">{project.architectureNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {project.timeline && project.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-status-warning" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                    {index < project.timeline!.length - 1 && (
                      <div className="w-px flex-1 bg-dark-border mt-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-text-muted">{formatDate(event.date)}</p>
                    <p className="font-medium text-text-primary">{event.title}</p>
                    <p className="text-sm text-text-secondary">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {project.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.tasks.map((task) => (
                <KanbanCard key={task.id} card={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
