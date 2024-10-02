import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue?: number; // Optional prop
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, maxValue = 100 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100); // Ensure it doesn't exceed 100%

  return (
    <div className="w-full bg-gray-300 rounded-full h-4">
      <div
        className="bg-gold h-full rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
