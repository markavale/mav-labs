'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import type { LearningItem } from '@/lib/types';

interface LearningProgressProps {
  data: LearningItem[];
}

export function LearningProgress({ data }: LearningProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.topic}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-primary">{item.topic}</span>
                <span className="text-xs text-text-muted">{item.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-dark-bg overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.progress}%`,
                    background: `linear-gradient(90deg, #22d3ee ${item.progress < 50 ? '0%' : '50%'}, #a855f7 100%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
