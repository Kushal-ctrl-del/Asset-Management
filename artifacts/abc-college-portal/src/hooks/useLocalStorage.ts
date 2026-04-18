import { useEffect, useState } from "react";
import { getItem, setItem } from "../lib/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => getItem<T>(key) ?? initialValue);

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
