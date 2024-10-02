import React from 'react';

interface MetricIconProps {
  name: string;
}

const MetricIcon: React.FC<MetricIconProps> = ({ name }) => {
  const getIcon = (metricName: string) => {
    switch (metricName) {
      case 'Sleep Quality':
        return <span className="text-blue-500">🛌</span>; // Example icon
      case 'Hunger Levels':
        return <span className="text-yellow-500">🍽️</span>; // Example icon
      case 'Digestion':
        return <span className="text-green-500">🌱</span>; // Example icon
      case 'Energy':
        return <span className="text-teal-500">⚡</span>; // New icon for Energy
      case 'Gym Performance':
        return <span className="text-indigo-500">🏋️‍♂️</span>; // New icon for Gym Performance
      case 'Mood':
        return <span className="text-purple-500">😊</span>; // New icon for Mood
      case 'Cravings':
        return <span className="text-orange-500">🍩</span>; // New icon for Cravings
      case 'Sex Drive':
        return <span className="text-pink-500">❤️</span>; // New icon for Sex Drive
      case 'Soreness':
        return <span className="text-red-500">🦵</span>; // New icon for Soreness
      // Add more cases for other metrics if needed
      default:
        return <span className="text-gray-500">❓</span>; // Default icon for unknown metrics
    }
  };

  return (
    <div className="mr-2">
      {getIcon(name)}
    </div>
  );
};

export default MetricIcon;
