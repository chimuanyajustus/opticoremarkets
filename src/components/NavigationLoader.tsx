import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoadingOverlay from './PageLoadingOverlay';

const NavigationLoader: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading overlay when navigation starts
    setIsLoading(true);

    // Hide loading overlay when the location changes (after component renders)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Adjust timing to match animation speed

    return () => clearTimeout(timer);
  }, [location]);

  return <PageLoadingOverlay isVisible={isLoading} />;
};

export default NavigationLoader;
