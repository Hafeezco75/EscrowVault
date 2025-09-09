'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Handle specific browser extension hydration errors
    if (error.message.includes('hydration') || 
        error.message.includes('Hydration') ||
        error.message.includes('bis_skin_checked') ||
        error.message.includes('server rendered HTML didn\'t match')) {
      console.warn('Browser extension hydration error caught:', error.message);
      // Reset the error boundary immediately for extension-related errors
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 50);
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  // Event handlers
  handleRefreshPage = () => {
    window.location.reload();
  };

  render() {
    // Don't show error UI for browser extension hydration issues
    if (this.state.hasError && 
        this.state.error?.message && 
        (this.state.error.message.includes('hydration') ||
         this.state.error.message.includes('bis_skin_checked') ||
         this.state.error.message.includes('server rendered HTML didn\'t match'))) {
      // Return children normally for extension-related errors
      return this.props.children;
    }

    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
              <p className="text-gray-300 mb-4">Please refresh the page to try again.</p>
              <button 
                onClick={this.handleRefreshPage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;