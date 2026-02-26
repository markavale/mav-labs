'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/shared/card';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
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

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="group hover:border-brand-cyan/30 transition-colors cursor-pointer">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
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

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-muted">Progress</span>
              <span className="text-text-secondary">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-dark-bg overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Blocker (if blocked) */}
          {project.status === 'blocked' && project.topBlocker && (
            <div className="flex items-start gap-2 p-2 rounded bg-status-blocked/10 mb-3">
              <AlertCircle className="w-4 h-4 text-status-blocked flex-shrink-0 mt-0.5" />
              <p className="text-xs text-status-blocked">{project.topBlocker}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-text-muted">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(project.lastActivity)}</span>
            </div>
            <div className="flex items-center gap-1 text-text-muted group-hover:text-brand-cyan transition-colors">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
