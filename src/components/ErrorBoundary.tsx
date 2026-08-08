import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SuryX Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="page flex-col items-center justify-center p-8 text-center">
          <div className="error-state" style={{ maxWidth: '480px' }}>
            <AlertTriangle size={48} className="mb-4" style={{ color: 'var(--accent-red)' }} />
            <h2 className="text-xl font-bold text-primary mb-2">Something went wrong</h2>
            <p className="text-secondary text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-sm text-muted cursor-pointer mb-2">Error details</summary>
                <pre className="text-xs text-red p-3 rounded-lg overflow-auto" style={{ background: 'var(--bg-elevated)', maxHeight: '120px' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button className="btn btn-primary" onClick={this.handleReset}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
