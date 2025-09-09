'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  // Consolidated state using single useState with spread operator
  const [state, setState] = useState({
    isVisible: true,
    fadeOut: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, fadeOut: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: false }));
        onComplete();
      }, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!state.isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 transition-opacity duration-500 ${
        state.fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center text-white">
        {/* Animated Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2ZM11 14H13V16H11V14ZM11 8H13V12H11V8Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-pulse">
          Esca
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-light mb-8 opacity-90">
          Secure Asset Transfer on Sui Blockchain
        </p>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-semibold mb-1">Secure Escrow</h3>
            <p className="text-sm opacity-75">Lock assets safely until conditions are met</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-semibold mb-1">Asset Swapping</h3>
            <p className="text-sm opacity-75">Exchange assets securely between parties</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant Unlock</h3>
            <p className="text-sm opacity-75">Release funds with proper verification</p>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8">
          <p className="text-lg opacity-75">Loading your secure vault...</p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>

        {/* Powered by Sui */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-sm opacity-60 flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-bold text-lg">SUI</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z"/>
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
}