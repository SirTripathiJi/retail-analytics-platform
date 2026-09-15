import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Component crashed:', error);
    console.error('[ErrorBoundary] Stack:', errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-12">
          <div className="border-4 border-[var(--border-color)] bg-[var(--card-bg)] p-10 shadow-[8px_8px_0_var(--shadow-color)] max-w-lg w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-[var(--border-color)] bg-[#FF4081] flex items-center justify-center shadow-[4px_4px_0_var(--shadow-color)]">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 text-[var(--text-primary)]">
              Something Went Wrong
            </h3>
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-6 leading-relaxed">
              A component failed to render. Reload or check your data.
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] p-3 mb-6 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 border-4 border-[var(--border-color)] bg-[var(--color-brand)] text-[#111111] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--shadow-color)] transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
