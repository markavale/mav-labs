'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import type { FitnessMetric } from '@/lib/types';

interface FitnessTrendsProps {
  data: FitnessMetric[];
}

export function FitnessTrends({ data }: FitnessTrendsProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fitness Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="date" stroke="#8B949E" fontSize={12} />
              <YAxis yAxisId="left" stroke="#8B949E" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#8B949E" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F0F6FC' }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#8B949E', fontSize: '12px' }}>{value}</span>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="workouts"
                name="Workouts"
                stroke="#3FB950"
                strokeWidth={2}
                dot={{ fill: '#3FB950', strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="runningDistance"
                name="Distance (km)"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: '#22d3ee', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
