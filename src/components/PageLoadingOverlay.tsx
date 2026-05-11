import React from 'react';
import { motion } from 'framer-motion';

interface PageLoadingOverlayProps {
  isVisible: boolean;
}

const PageLoadingOverlay: React.FC<PageLoadingOverlayProps> = ({ isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none ${
        isVisible ? 'pointer-events-auto' : ''
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 p-1"
        >
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-600"
            />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
          transition={{ delay: 0.2 }}
          className="text-white font-semibold text-lg"
        >
          Loading...
        </motion.p>

        {/* Animated dots */}
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PageLoadingOverlay;
