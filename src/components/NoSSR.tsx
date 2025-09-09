'use client';

import { useEffect, useState } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders on the client side to avoid hydration mismatches
 * caused by browser extensions that modify the DOM (like bis_skin_checked attributes)
 */
export default function NoSSR({ children, fallback }: NoSSRProps) {
  // Consolidated state using single useState with spread operator
  const [state, setState] = useState({
    isMounted: false,
    hydrationComplete: false
  });

  useEffect(() => {
    setState(prev => ({ ...prev, isMounted: true }));
    
    // Additional delay to ensure hydration is complete and extensions have loaded
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, hydrationComplete: true }));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Always render the fallback on server and until fully mounted
  if (!state.isMounted || !state.hydrationComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">
          Loading Escrow Vault...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}