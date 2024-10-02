import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const AnimatedLineChart = motion(LineChart); // Updated to use motion directly

const EnhancedChart = ({ data, metrics }: { data: any[]; metrics: { key: string; color: string }[] }) => (
  <ResponsiveContainer width="100%" height={400}>
    <AnimatedLineChart
      data={data}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {metrics.map(metric => (
        <Line 
          key={metric.key}
          type="monotone" 
          dataKey={metric.key} 
          stroke={metric.color}
          strokeWidth={2}
          dot={false}
        />
      ))}
    </AnimatedLineChart>
  </ResponsiveContainer>
);