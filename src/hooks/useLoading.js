import { useState, useCallback } from 'react';
import { errorHandler } from '@/utils/error';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async (asyncFn, options = {}) => {
    const {
      handleError = true,
      showErrorNotification = true,
    } = options;

    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      setError(error);
      if (handleError) {
        errorHandler.handle(error, { showNotification: showErrorNotification });
      } else {
        throw error;
      }
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    withLoading,
    resetError,
  };
};
