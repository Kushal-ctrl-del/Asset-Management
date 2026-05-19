import { useState, useCallback } from 'react';
import { getItem, setItem } from '../lib/storage';

export function useStore<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const item = getItem<T>(key);
    return item !== null ? item : fallback;
  });

  const update = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === 'function' ? (next as (current: T) => T)(current) : next;
      setItem(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, update] as const;
}
