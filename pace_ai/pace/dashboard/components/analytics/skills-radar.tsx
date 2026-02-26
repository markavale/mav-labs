'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import type { SkillLevel } from '@/lib/types';

interface SkillsRadarProps {
  data: SkillLevel[];
}

export function SkillsRadar({ data }: SkillsRadarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skills Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#30363D" />
              <PolarAngleAxis dataKey="skill" stroke="#8B949E" fontSize={12} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#8B949E"
                fontSize={10}
              />
              <Radar
                name="Proficiency"
                dataKey="level"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F0F6FC' }}
                formatter={(value: number) => [`${value}%`, 'Proficiency']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
