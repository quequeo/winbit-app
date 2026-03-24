import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-dark-card rounded-lg border border-border-dark p-8 text-center backdrop-blur-sm">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-muted mb-6">
              We&apos;re sorry, but something unexpected happened. Please refresh the page to try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
