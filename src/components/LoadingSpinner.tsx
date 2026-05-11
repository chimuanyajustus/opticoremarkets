import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'blue' | 'purple';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: { outer: 16, inner: 12 },
    md: { outer: 24, inner: 18 },
    lg: { outer: 32, inner: 24 },
  };

  const colors = {
    white: 'from-white to-gray-400',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
  };

  const { outer, inner } = sizes[size];

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: outer, height: outer }}
        className={`relative rounded-full bg-gradient-to-r ${colors[color]} p-0.5`}
      >
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center relative">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: inner, height: inner }}
            className={`rounded-full bg-gradient-to-r ${colors[color]}`}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
