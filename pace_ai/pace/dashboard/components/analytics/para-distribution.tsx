'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { paraColors } from '@/lib/tokens';
import type { ParaDistribution as ParaDistributionType } from '@/lib/types';

interface ParaDistributionProps {
  data: ParaDistributionType;
}

export function ParaDistribution({ data }: ParaDistributionProps) {
  const chartData = [
    { name: 'Projects', value: data.projects, color: paraColors.projects },
    { name: 'Areas', value: data.areas, color: paraColors.areas },
    { name: 'Resources', value: data.resources, color: paraColors.resources },
  ];

  const total = data.projects + data.areas + data.resources;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PARA Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F0F6FC' }}
                formatter={(value: number) => [`${((value / total) * 100).toFixed(0)}%`, 'Share']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: '#8B949E', fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
