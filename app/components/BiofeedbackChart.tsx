'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { DailyAggregation, BiofeedbackChartProps } from '../types/metrics';
import { differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const BiofeedbackChart: React.FC<BiofeedbackChartProps> = ({ data: initialData, selectedMetrics, metrics, onDataPointClick, dateRange }) => {
  const [data, setData] = useState<DailyAggregation[]>(initialData);
  const [isBarChart, setIsBarChart] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const fetchData = async (dateRange: { startDate: string; endDate: string }) => {
    const { data: result, error } = await supabase
      .from('daily_aggregations')
      .select('*')
      .gte('date', dateRange.startDate)
      .lte('date', dateRange.endDate)
      .order('date', { ascending: true });

    if (error) {
    } else {
      setData(result || []);
    }
  };

  useEffect(() => {
    if (selectedMetrics.length > 0 && dateRange) {
      fetchData(dateRange);
      const daysDifference = differenceInDays(new Date(dateRange.endDate), new Date(dateRange.startDate));
      setIsBarChart(daysDifference <= 5);
    }
  }, [selectedMetrics, dateRange]);

  const renderChart = () => {
    const ChartComponent = isBarChart ? BarChart : AreaChart;

    // Function to render custom dots only for non-zero values
    const renderDot = (props: any) => {
      const { cx, cy, payload, dataKey } = props;
      const value = payload[dataKey];
      if (value && value !== 0) {
        return <Dot cx={cx} cy={cy} r={4} fill={props.stroke} />;
      }
      return undefined;  // Return undefined instead of null
    };

    return (
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
        <Tooltip cursor={{ fill: 'transparent' }} />
        {metrics.map((metric) => (
          selectedMetrics.includes(metric.name) && (
            isBarChart ? (
              <Bar
                key={metric.name}
                dataKey={`metrics.${metric.name.toLowerCase().replace(' ', '_')}.score`}
                fill={metric.color}
                name={metric.name}
                onMouseEnter={() => setHoveredMetric(metric.name)}
                onMouseLeave={() => setHoveredMetric(null)}
                onClick={(entry: any) => {
                  if (entry && entry.payload && entry.payload.date) {
                    onDataPointClick && onDataPointClick(entry.payload);
                  }
                }}
                animationBegin={0}
                animationDuration={1500}
              />
            ) : (
              <Area
                key={metric.name}
                type="monotone"
                dataKey={`metrics.${metric.name.toLowerCase().replace(' ', '_')}.score`}
                stroke={metric.color}
                fill={metric.color}
                fillOpacity={0.3}
                name={metric.name}
                onMouseEnter={() => setHoveredMetric(metric.name)}
                onMouseLeave={() => setHoveredMetric(null)}
                onClick={(entry: any) => {
                  if (entry && entry.payload && entry.payload.date) {
                    onDataPointClick && onDataPointClick(entry.payload);
                  }
                }}
                strokeWidth={hoveredMetric === metric.name ? 3 : 1}
                animationBegin={0}
                animationDuration={1500}
                connectNulls={true}  // This will skip over null or undefined values
                dot={(props: any) => renderDot(props) as React.ReactElement<SVGElement>}  // Custom dot renderer
              />
            )
          )
        ))}
      </ChartComponent>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={isBarChart ? 'bar' : 'area'}
        className="w-full h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {data.length > 0 ? renderChart() : <div>No data available for the selected range.</div>}
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
}