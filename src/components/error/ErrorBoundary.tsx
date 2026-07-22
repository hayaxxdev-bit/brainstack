// src/components/error/ErrorBoundary.tsx

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Type definitions
 */
interface ErrorHistoryItem {
  error: Error;
  timestamp: Date;
  errorInfo?: ErrorInfo;
  id: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
  maxErrorCount?: number;
  resetTimeout?: number;
  onReportError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  errorHistory: ErrorHistoryItem[];
  showTechnicalDetails: boolean;
  isResetting: boolean;
}

/**
 * Constants
 */
const DEFAULT_MAX_ERROR_COUNT = 5;
const DEFAULT_RESET_TIMEOUT = 10000;
const ERROR_HISTORY_LIMIT = 10;

/**
 * Utility functions
 */
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getEnvironment = (): 'development' | 'production' => {
  try {
    return import.meta.env.DEV ? 'development' : 'production';
  } catch {
    return 'production';
  }
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorResetTimer: ReturnType<typeof setTimeout> | null = null;
  
  static defaultProps: Partial<ErrorBoundaryProps> = {
    maxErrorCount: DEFAULT_MAX_ERROR_COUNT,
    resetTimeout: DEFAULT_RESET_TIMEOUT,
    showDetails: getEnvironment() === 'development',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorHistory: [],
      showTechnicalDetails: false,
      isResetting: false,
    };
  }

  static getDerivedStateFromError(error: Error): Pick<ErrorBoundaryState, 'hasError' | 'error'> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, onReportError, maxErrorCount = DEFAULT_MAX_ERROR_COUNT } = this.props;
    
    const errorHistoryItem: ErrorHistoryItem = {
      error,
      timestamp: new Date(),
      errorInfo,
      id: generateErrorId(),
    };

    this.setState((prevState) => {
      const newErrorCount = prevState.errorCount + 1;
      const newErrorHistory = [
        errorHistoryItem,
        ...prevState.errorHistory,
      ].slice(0, ERROR_HISTORY_LIMIT);

      return {
        errorInfo,
        errorCount: newErrorCount,
        errorHistory: newErrorHistory,
      };
    });

    this.logError(error, errorInfo);

    onError?.(error, errorInfo);
    onReportError?.(error, errorInfo);

    if (this.state.errorCount >= maxErrorCount) {
      console.warn(
        `Maximum error threshold (${maxErrorCount}) reached. Consider refreshing the application.`
      );
    }

    this.scheduleErrorReset();
  }

  componentWillUnmount(): void {
    this.clearTimers();
  }

  private logError = (error: Error, errorInfo: ErrorInfo): void => {
    const errorLog = {
      id: generateErrorId(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      appVersion: '1.0.0',
      environment: getEnvironment(),
    };

    console.group('🚨 Application Error Caught by ErrorBoundary');
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Full Context:', errorLog);
    console.groupEnd();

    if (getEnvironment() === 'production') {
      this.reportToService(errorLog);
    }
  };

  private reportToService = (_errorLog: Record<string, unknown>): void => {
    try {
      // Integrate with your error reporting service here
      console.info('Error reported to monitoring service');
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private scheduleErrorReset = (): void => {
    this.clearTimers();
    
    const { resetTimeout = DEFAULT_RESET_TIMEOUT } = this.props;
    
    this.errorResetTimer = setTimeout(() => {
      this.setState((prevState) => ({
        errorCount: Math.max(0, prevState.errorCount - 1),
      }));
    }, resetTimeout);
  };

  private clearTimers = (): void => {
    if (this.errorResetTimer) {
      clearTimeout(this.errorResetTimer);
      this.errorResetTimer = null;
    }
  };

  private handleReset = (): void => {
    const { onReset } = this.props;

    this.setState({
      isResetting: true,
    });

    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isResetting: false,
      });

      onReset?.();
    }, 300);
  };

  private handleReload = (): void => {
    this.handleReset();
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  private handleGoHome = (): void => {
    this.handleReset();
    setTimeout(() => {
      window.location.href = '/';
    }, 300);
  };

  private handleReportBug = (): void => {
    const { error, errorInfo } = this.state;
    
    const subject = 'Bug Report: Application Error';
    const body = `
Error Details:
--------------
Message: ${error?.message || 'Unknown error'}
Name: ${error?.name || 'N/A'}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
    `.trim();

    const mailtoLink = `mailto:support@brainstack.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  private toggleTechnicalDetails = (): void => {
    this.setState((prevState) => ({
      showTechnicalDetails: !prevState.showTechnicalDetails,
    }));
  };

  private clearErrorHistory = (): void => {
    this.setState({
      errorHistory: [],
      errorCount: 0,
    });
  };

  private renderErrorDetails = (): ReactNode => {
    const { error, errorInfo } = this.state;

    return (
      <div className="space-y-3">
        {error?.stack && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Error Stack</h4>
            <pre className="text-xs text-slate-500 font-mono overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
              {error.stack}
            </pre>
          </div>
        )}

        {errorInfo?.componentStack && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Component Stack</h4>
            <pre className="text-xs text-slate-500 font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
      </div>
    );
  };

  private renderErrorHistory = (): ReactNode => {
    const { errorHistory } = this.state;

    if (errorHistory.length === 0) return null;

    return (
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-400">
            Error History ({errorHistory.length})
          </h4>
          <button
            onClick={this.clearErrorHistory}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            type="button"
          >
            Clear History
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {errorHistory.map((historyItem) => (
            <div
              key={historyItem.id}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-400 font-mono truncate">
                    {historyItem.error.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {historyItem.timestamp.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-slate-600 font-mono">
                  {historyItem.error.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  private renderActions = (): ReactNode => {
    const { isResetting } = this.state;

    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={this.handleReset}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-sm text-white font-medium transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting...' : 'Try Again'}
        </button>

        <button
          onClick={this.handleReload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm text-white font-medium transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </button>

        <button
          onClick={this.handleGoHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-white font-medium transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          type="button"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>

        <button
          onClick={this.handleReportBug}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-white font-medium transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          type="button"
        >
          <Bug className="w-4 h-4" />
          Report Bug
        </button>
      </div>
    );
  };

  private renderFallback = (): ReactNode => {
    const { fallback } = this.props;
    const { error, errorCount, showTechnicalDetails } = this.state;

    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error!, this.handleReset);
      }
      return fallback;
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/20 p-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white">
                  Something went wrong
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  An unexpected error has occurred. Don't worry, your data is safe.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-red-400 font-mono text-sm font-medium break-words">
                {error?.message || 'Unknown error occurred'}
              </p>
            </div>

            {errorCount > 1 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Multiple errors detected ({errorCount} occurrences). 
                    If problems persist, try refreshing the page.
                  </span>
                </p>
              </div>
            )}

            <div>
              <button
                onClick={this.toggleTechnicalDetails}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mb-2"
                type="button"
              >
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
              </button>
              {showTechnicalDetails && this.renderErrorDetails()}
            </div>

            {showTechnicalDetails && this.renderErrorHistory()}

            {this.renderActions()}

            <p className="text-xs text-slate-600 text-center mt-4">
              If the problem persists, please contact support or try clearing your browser cache.
            </p>
          </div>
        </div>
      </div>
    );
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export type { ErrorBoundaryProps, ErrorBoundaryState, ErrorHistoryItem };