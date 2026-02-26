'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TaskThroughput } from '@/components/analytics/task-throughput';
import { ParaDistribution } from '@/components/analytics/para-distribution';
import { SkillsRadar } from '@/components/analytics/skills-radar';
import { FitnessTrends } from '@/components/analytics/fitness-trends';
import { LearningProgress } from '@/components/analytics/learning-progress';
import { mockAnalyticsData } from '@/lib/mock-data';

type DateRange = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">
            Charts and visualizations of your progress
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-dark-card border border-dark-border">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                dateRange === option.value
                  ? 'bg-brand-cyan text-dark-bg'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Throughput */}
        <TaskThroughput data={mockAnalyticsData.taskThroughput} />

        {/* PARA Distribution */}
        <ParaDistribution data={mockAnalyticsData.paraDistribution} />

        {/* Skills Radar */}
        <SkillsRadar data={mockAnalyticsData.skillsRadar} />

        {/* Fitness Trends */}
        <FitnessTrends data={mockAnalyticsData.fitnessTrends} />

        {/* Learning Progress - Full Width */}
        <div className="lg:col-span-2">
          <LearningProgress data={mockAnalyticsData.learningProgress} />
        </div>
      </div>
    </div>
  );
}
