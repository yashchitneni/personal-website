'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyAggregation, BiofeedbackChartProps } from '../types/metrics';
import { differenceInDays } from 'date-fns';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const BiofeedbackChart: React.FC<BiofeedbackChartProps> = ({ data: initialData, selectedMetrics, metrics, onDataPointClick, dateRange }) => { // Add dateRange to props
  const [data, setData] = useState<DailyAggregation[]>(initialData);
  const [isBarChart, setIsBarChart] = useState(false);

  // Fetch data based on selected metrics and date range
  const fetchData = async (dateRange: { startDate: string; endDate: string }) => {
    const { data: result, error } = await supabase
      .from('daily_aggregations')
      .select('*')
      .gte('date', dateRange.startDate)
      .lte('date', dateRange.endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setData(result || []); // Update state with fetched data
    }
  };

  // Effect to fetch data when selectedMetrics or date range changes
  useEffect(() => {
    if (selectedMetrics.length > 0 && dateRange) { // Check for dateRange
      fetchData(dateRange); // Use the dynamic date range
      const daysDifference = differenceInDays(new Date(dateRange.endDate), new Date(dateRange.startDate));
      setIsBarChart(daysDifference <= 5);
    }
  }, [selectedMetrics, dateRange]); // Add dateRange as a dependency

  const renderChart = () => {
    const ChartComponent = isBarChart ? BarChart : LineChart;
    const DataComponent = isBarChart ? Bar : Line;

    return (
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {metrics.map((metric) => (
          selectedMetrics.includes(metric.name) && (
            React.createElement(DataComponent as React.ComponentType<any>, {
              key: metric.name,
              type: "monotone",
              dataKey: `metrics.${metric.name.toLowerCase().replace(' ', '_')}.score`,
              stroke: metric.color,
              fill: isBarChart ? metric.color : undefined,
              name: metric.name,
              onClick: (entry: DailyAggregation) => onDataPointClick && onDataPointClick(entry)
            })
          )
        ))}
      </ChartComponent>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
}