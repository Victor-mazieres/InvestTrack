// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, defaultValue, options = {}) {
  const { resetCondition = () => false } = options;
  const [state, setState] = useState(() => {
    if (resetCondition()) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    const json = localStorage.getItem(key);
    return json !== null ? JSON.parse(json) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
