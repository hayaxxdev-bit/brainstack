// src/components/error/ErrorBoundaryWrapper.tsx

import { useCallback } from 'react';
import type { FC } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps } from './ErrorBoundary';

interface ErrorBoundaryWrapperProps extends Omit<ErrorBoundaryProps, 'children'> {
  componentName?: string;
  children: React.ReactNode;
}

export const ErrorBoundaryWrapper: FC<ErrorBoundaryWrapperProps> = ({
  children,
  componentName = 'Unknown',
  onError,
  ...props
}) => {
  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo) => {
      console.error(`Error in ${componentName}:`, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      onError?.(error, errorInfo);
    },
    [componentName, onError]
  );

  return (
    <ErrorBoundary onError={handleError} {...props}>
      {children}
    </ErrorBoundary>
  );
};

ErrorBoundaryWrapper.displayName = 'ErrorBoundaryWrapper';