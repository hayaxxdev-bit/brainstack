// src/hooks/useErrorBoundary.ts

import { useCallback, useState } from 'react';

interface UseErrorBoundaryReturn {
  error: Error | null;
  throwError: (error: Error) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorBoundary = (): UseErrorBoundaryReturn => {
  const [error, setError] = useState<Error | null>(null);

  const throwError = useCallback((err: Error) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return {
    error,
    throwError,
    clearError,
    hasError: error !== null,
  };
};