'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import { useHydrationFix } from '../hooks/useHydrationFix';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);
  
  // Apply hydration fix for browser extensions
  useHydrationFix();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Since this component is wrapped in NoSSR, we don't need additional mounting checks
  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && children}
    </>
  );
}