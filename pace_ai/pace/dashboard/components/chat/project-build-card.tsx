'use client';

import { cn } from '@/lib/utils';
import {
  Search,
  FileText,
  Code,
  TestTube,
  Rocket,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import type { ProjectBuild, BuildPhase, BuildPhaseStatus } from '@/lib/types';

interface ProjectBuildCardProps {
  build: ProjectBuild;
  className?: string;
}

const phaseConfig: Record<
  BuildPhase,
  {
    icon: typeof Search;
    label: string;
    activeRing: string;
    activeBg: string;
    activeText: string;
    glowColor: string;
  }
> = {
  researching: {
    icon: Search,
    label: 'Research',
    activeRing: 'border-brand-sky',
    activeBg: 'bg-brand-sky/15',
    activeText: 'text-brand-sky',
    glowColor: 'rgba(14, 165, 233, 0.3)',
  },
  planning: {
    icon: FileText,
    label: 'Plan',
    activeRing: 'border-brand-purple',
    activeBg: 'bg-brand-purple/15',
    activeText: 'text-brand-purple',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  coding: {
    icon: Code,
    label: 'Code',
    activeRing: 'border-brand-cyan',
    activeBg: 'bg-brand-cyan/15',
    activeText: 'text-brand-cyan',
    glowColor: 'rgba(34, 211, 238, 0.3)',
  },
  testing: {
    icon: TestTube,
    label: 'Test',
    activeRing: 'border-status-warning',
    activeBg: 'bg-status-warning/15',
    activeText: 'text-status-warning',
    glowColor: 'rgba(210, 153, 34, 0.3)',
  },
  deploying: {
    icon: Rocket,
    label: 'Deploy',
    activeRing: 'border-status-success',
    activeBg: 'bg-status-success/15',
    activeText: 'text-status-success',
    glowColor: 'rgba(63, 185, 80, 0.3)',
  },
  complete: {
    icon: CheckCircle,
    label: 'Done',
    activeRing: 'border-status-success',
    activeBg: 'bg-status-success/15',
    activeText: 'text-status-success',
    glowColor: 'rgba(63, 185, 80, 0.3)',
  },
};

function PhaseNode({
  phase,
  status,
  isLast,
}: {
  phase: BuildPhase;
  status: BuildPhaseStatus;
  isLast: boolean;
}) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  const isActive = status === 'active';
  const isComplete = status === 'complete';
  const isError = status === 'error';

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
            isActive && [config.activeRing, config.activeBg, 'animate-pace-glow'],
            isComplete && 'border-status-success bg-status-success/15',
            isError && 'border-status-error bg-status-error/15',
            status === 'pending' && 'border-dark-border bg-dark-bg'
          )}
          style={
            isActive ? { boxShadow: `0 0 12px 2px ${config.glowColor}` } : undefined
          }
        >
          {isError ? (
            <AlertCircle className="w-4 h-4 text-status-error" />
          ) : (
            <Icon
              className={cn(
                'w-4 h-4',
                isActive && config.activeText,
                isComplete && 'text-status-success',
                status === 'pending' && 'text-text-muted'
              )}
            />
          )}
        </div>
        <span
          className={cn(
            'text-[10px] font-medium',
            isActive && config.activeText,
            isComplete && 'text-status-success',
            isError && 'text-status-error',
            status === 'pending' && 'text-text-muted'
          )}
        >
          {config.label}
        </span>
      </div>

      {!isLast && (
        <div
          className={cn(
            'w-6 h-[2px] mx-1 mt-[-16px]',
            isComplete ? 'bg-status-success' : 'bg-dark-border'
          )}
        />
      )}
    </div>
  );
}

export function ProjectBuildCard({ build, className }: ProjectBuildCardProps) {
  const activePhase = build.phases.find((p) => p.status === 'active');
  const completedCount = build.phases.filter((p) => p.status === 'complete').length;
  const totalPhases = build.phases.length;
  const progress = Math.round((completedCount / totalPhases) * 100);
  const isComplete = build.phases.every((p) => p.status === 'complete');

  return (
    <div
      className={cn(
        'rounded-xl bg-dark-card border border-dark-border overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isComplete ? 'bg-status-success' : 'bg-brand-cyan animate-pulse'
              )}
            />
            <h4 className="text-sm font-semibold text-text-primary">{build.projectName}</h4>
          </div>
          <span className="text-[11px] text-text-muted font-mono">{progress}%</span>
        </div>
        {build.description && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-1">{build.description}</p>
        )}
      </div>

      {/* Phase pipeline */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          {build.phases.map((phaseData, i) => (
            <PhaseNode
              key={phaseData.phase}
              phase={phaseData.phase}
              status={phaseData.status}
              isLast={i === build.phases.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="w-full h-1.5 rounded-full bg-dark-bg overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              isComplete
                ? 'bg-status-success'
                : 'bg-gradient-to-r from-brand-cyan to-brand-purple'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {activePhase && (
          <p className="text-[11px] text-text-muted mt-2">
            Currently {activePhase.phase}...
          </p>
        )}
      </div>

      {/* GitHub link when complete */}
      {isComplete && build.repoUrl && (
        <div className="px-4 py-3 border-t border-dark-border">
          <a
            href={build.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hover:bg-brand-cyan/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on GitHub
          </a>
        </div>
      )}
    </div>
  );
}
