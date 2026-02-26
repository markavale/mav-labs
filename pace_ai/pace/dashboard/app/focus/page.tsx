'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { ParaBadge } from '@/components/shared/para-badge';
import { Button } from '@/components/shared/button';
import { mockFocusPlan } from '@/lib/mock-data';
import {
  Calendar,
  CheckCircle,
  Clock,
  GripVertical,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import type { FocusTask } from '@/lib/types';

export default function FocusPage() {
  const [todayTasks, setTodayTasks] = useState(mockFocusPlan.todayTasks);
  const [weeklyPriorities, setWeeklyPriorities] = useState(mockFocusPlan.weeklyPriorities);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // In real implementation, this would trigger Pace to regenerate
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRegenerating(false);
  };

  const TaskCard = ({ task, index }: { task: FocusTask; index: number }) => (
    <div className="group flex items-start gap-3 p-4 rounded-lg bg-dark-bg border border-dark-border hover:border-brand-cyan/30 transition-colors">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan text-sm font-bold flex-shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-text-primary">{task.title}</h4>
          <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        </div>

        <p className="text-sm text-text-secondary mb-3">{task.reasoning}</p>

        <div className="flex items-center flex-wrap gap-2">
          <ParaBadge category={task.paraCategory} size="sm" />

          {task.estimatedDuration && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              {task.estimatedDuration}
            </div>
          )}

          {task.relatedProject && (
            <span className="text-xs text-text-muted">
              → {task.relatedProject}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Focus Planner</h1>
          <p className="text-text-secondary mt-1">
            AI-generated daily and weekly focus recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            Generated {formatRelativeTime(mockFocusPlan.generatedAt)}
          </span>
          <Button
            variant="secondary"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-status-warning" />
              Today&apos;s Top 3
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </CardContent>
        </Card>

        {/* Weekly Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-purple" />
              Weekly Priority Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyPriorities.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ask Pace */}
      <Card className="mt-6">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-brand-cyan/20">
              <Sparkles className="w-6 h-6 text-brand-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Need guidance?</h3>
              <p className="text-sm text-text-secondary">
                Ask Pace to analyze your priorities and suggest what to focus on
              </p>
            </div>
          </div>

          <Button variant="primary">
            What should I focus on?
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
