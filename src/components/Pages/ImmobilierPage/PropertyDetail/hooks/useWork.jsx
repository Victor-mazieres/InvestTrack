// src/hooks/useWork.jsx
import React from 'react';
import { api } from '../../../../../api/api';

export function useWork(propertyId) {
  const [rooms, setRooms]   = React.useState([]);
  const [loading, setLoad]  = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    if (!propertyId) {
      setRooms([]);
      setLoad(false);
      return;
    }

    const ctrl = new AbortController();
    let finished = false;

    (async () => {
      try {
        setLoad(true);
        setError(null);
        const data = await api.get(`/api/properties/${propertyId}/works`, {
          signal: ctrl.signal,
          // keepalive est inutile ici, on le garde pour PUT si besoin
        });
        if (finished) return; // composant démonté entre-temps
        setRooms(Array.isArray(data?.rooms) ? data.rooms : []);
      } catch (e) {
        // 👉 On ignore les aborts : c'est attendu lors d'un remount/changement d'id
        if (e?.name === 'AbortError') return;
        console.error('GET works failed (non-abort):', e);
        if (!finished) setError(e?.message || 'Erreur de chargement');
      } finally {
        if (!finished) setLoad(false);
      }
    })();

    return () => { finished = true; ctrl.abort(); };
  }, [propertyId]);

  const saveWork = React.useCallback(async (newRooms) => {
    setSaving(true);
    try {
      await api.put(
        `/api/properties/${propertyId}/works`,
        { rooms: newRooms },
        { keepalive: true } // utile si l’onglet se ferme juste après un clic
      );
      return { ok: true };
    } catch (e) {
      if (e?.name === 'AbortError') return { ok: false }; // ignore
      console.error('PUT works failed:', e);
      setError(e?.message || 'Erreur d’enregistrement');
      return { ok: false, error: e?.message };
    } finally {
      setSaving(false);
    }
  }, [propertyId]);

  return { rooms, setRooms, loading: setLoad ? loading : false, loading: setLoad ? loading : false, loading, error, saving, saveWork };
}
