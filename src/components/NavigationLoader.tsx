import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PageLoadingOverlay from './PageLoadingOverlay';

const NavigationLoader: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && <PageLoadingOverlay key="navigation-loader" isVisible={isLoading} />}
    </AnimatePresence>
  );
};

export default NavigationLoader;
