// src/hooks/useWork.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // utile si tu as des cookies de session
});

export function useWork(propertyId, userId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchWork = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/properties/${propertyId}/works`, {
        params: userId ? { userId } : {},
      });
      const data = res.data;
      setRooms(Array.isArray(data?.rooms) ? data.rooms : []);
    } catch (e) {
      console.error("GET works error:", e);
      setError(e?.response?.data?.message || e.message || "Erreur chargement");
      setRooms([]); // garder l’UI utilisable
    } finally {
      setLoading(false);
    }
  }, [propertyId, userId]);

  const saveWork = useCallback(
    async (nextRooms) => {
      if (!propertyId) return false;
      setSaving(true);
      setError(null);
      try {
        const res = await api.put(
          `/api/properties/${propertyId}/works`,
          { rooms: nextRooms },
          { params: userId ? { userId } : {} }
        );
        setRooms(Array.isArray(res.data?.rooms) ? res.data.rooms : []);
        return true;
      } catch (e) {
        console.error("PUT works error:", e);
        setError(e?.response?.data?.message || e.message || "Erreur enregistrement");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [propertyId, userId]
  );

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  return { rooms, setRooms, loading, error, saving, saveWork, reload: fetchWork };
}
