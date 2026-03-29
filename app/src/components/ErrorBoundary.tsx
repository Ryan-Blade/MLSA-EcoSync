import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#0f172a', color: '#ef4444', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            EcoSync Frontend Error
          </h2>
          <p style={{ marginBottom: '1rem' }}>The application crashed during rendering.</p>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <pre style={{ marginTop: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
