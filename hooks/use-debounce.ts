import { useEffect, useState } from "react";

/**
 * A production-ready hook that delays updating a value until a specified
 * amount of time has passed since the last change.
 * * @param value The value to debounce (can be any type)
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // Initialize state with the current value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 1. Set up the timeout to update the value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. CLEANUP: This is the most important part for production.
    // If the value changes again before the delay is over, this
    // clear function runs, cancelling the previous timer.
    // It also runs when the component unmounts to prevent memory leaks.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Re-run if value or delay changes

  return debouncedValue;
}