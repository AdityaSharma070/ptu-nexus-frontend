import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for smooth background auto-refresh without visible page reloads
 * 
 * @param {Function} fetchFunction - Function to call for fetching data
 * @param {number} interval - Refresh interval in milliseconds (default: 30000 = 30s)
 * @param {boolean} enabled - Whether auto-refresh is enabled (default: true)
 */
export const useSmoothRefresh = (fetchFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  const startRefresh = useCallback(() => {
    if (!enabled) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current && !document.hidden) {
        // Fetch silently in background
        fetchFunction(true); // Pass 'true' to indicate silent refresh
      }
    }, interval);
  }, [fetchFunction, interval, enabled]);

  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        isActiveRef.current = true;
        // Refresh immediately when tab becomes visible
        if (enabled) {
          fetchFunction(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFunction, enabled]);

  // Start/stop refresh based on enabled state
  useEffect(() => {
    if (enabled) {
      startRefresh();
    } else {
      stopRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopRefresh();
      isActiveRef.current = false;
    };
  }, [enabled, startRefresh, stopRefresh]);

  return { startRefresh, stopRefresh };
};

/**
 * Hook for debouncing function calls
 * Useful for search inputs or preventing too many API calls
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const useDebounce = (func, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedFunc = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunc;
};

export default useSmoothRefresh;
