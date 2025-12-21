import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Here you could log to an error reporting service like Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <>
          <HeaderTwo />
          <div className="page-content-wrapper py-3">
            <div className="custom-container">
              <div className="card">
                <div className="card-body px-4 text-center">
                  <div className="mb-4">
                    <i 
                      className="bi bi-exclamation-triangle-fill" 
                      style={{ 
                        fontSize: '80px', 
                        color: '#dc3545' 
                      }}
                    ></i>
                  </div>
                  
                  <h4 className="mb-3">Something went wrong</h4>
                  
                  <p className="text-muted mb-4">
                    We're sorry, but something unexpected happened. 
                    Please try refreshing the page or contact support if the problem persists.
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="alert alert-danger text-start mb-4" style={{ fontSize: '12px' }}>
                      <strong>Error:</strong> {this.state.error.toString()}
                      {this.state.errorInfo && (
                        <details className="mt-2">
                          <summary>Stack trace</summary>
                          <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button 
                      className="btn btn-primary" 
                      onClick={this.handleReset}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Try Again
                    </button>
                    
                    <Link 
                      to="/dashboard" 
                      className="btn btn-outline-primary"
                      onClick={this.handleReset}
                    >
                      <i className="bi bi-house-door me-2"></i>
                      Go to Dashboard
                    </Link>
                    
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => window.location.reload()}
                    >
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Reload Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;















