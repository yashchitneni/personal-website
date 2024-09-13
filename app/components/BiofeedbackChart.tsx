'use client'

import { useState, useEffect } from 'react';
import { fetchDailyAggregations } from '../quantifying/health/upload/metrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@clerk/nextjs';
import { BiofeedbackEntry, BiofeedbackChartProps } from '../types/metrics';

export const BiofeedbackChart: React.FC<BiofeedbackChartProps> = ({ data: initialData, selectedMetrics, metrics, onDataPointClick }) => {
  const [data, setData] = useState<BiofeedbackEntry[]>(initialData);
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1); // Set to yesterday
      const formattedStartDate = startDate.toISOString().split('T')[0];

      fetchDailyAggregations(userId, formattedStartDate, endDate)
        .then((result) => setData(result || [])); // Ensure result is an array
    }
  }, [userId]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {metrics.map((metric) => (
          <Line
            key={metric.name}
            type="monotone"
            dataKey={`metrics.${metric.name.toLowerCase().replace(' ', '_')}.score`}
            stroke={metric.color}
            name={metric.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}