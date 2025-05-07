// src/hooks/useProperty.js
import { useState, useEffect } from 'react';

export function useProperty(id) {
  const [property, setProperty] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res  = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error(res.statusText);
        setProperty(await res.json());
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id]);

  return { property, error };
}
