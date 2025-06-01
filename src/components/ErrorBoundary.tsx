import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full border border-slate-700">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              ⚠️ Something went wrong
            </h2>
            
            <p className="text-gray-300 mb-4">
              An unexpected error occurred. This has been logged and we'll look into it.
            </p>
            
            {this.state.error && (
              <details className="mb-4 bg-slate-900 rounded p-3">
                <summary className="text-sm text-gray-400 cursor-pointer">
                  Error details
                </summary>
                {/* eslint-disable react/no-unescaped-entities */}
                <pre className="text-xs text-red-300 mt-2 overflow-auto">
                  {`${this.state.error.message}\n${this.state.error.stack}`
                    .replace(/'/g, "&apos;")
                    .replace(/"/g, "&quot;")
                    .replace(/>/g, "&gt;")}
                </pre>
                {/* eslint-enable react/no-unescaped-entities */}
              </details>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);
  
  const captureError = (error: Error) => setError(error);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}; 