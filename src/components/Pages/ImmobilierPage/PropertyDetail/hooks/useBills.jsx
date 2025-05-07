// src/hooks/useBills.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage bills for a given property.
 * @param {string|number} propertyId
 * @returns {{ bills: array, loading: boolean, deleteBill: func, addBill: func }}
 */
export function useBills(propertyId) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) return;

    const fetchBills = async () => {
      setLoading(true);
      try {
        // URL relative pour éviter les variables d'environnement côté client
        const res = await fetch(`/api/properties/${propertyId}/bills`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [propertyId]);

  const deleteBill = useCallback(
    async (billId) => {
      try {
        const res = await fetch(
          `/api/properties/${propertyId}/bills/${billId}`,
          { method: 'DELETE' }
        );
        if (res.ok) {
          setBills((curr) => curr.filter((b) => b.id !== billId));
        } else {
          console.error('Failed to delete bill', res.statusText);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [propertyId]
  );

  const addBill = useCallback(
    async (formData) => {
      try {
        const res = await fetch(
          `/api/properties/${propertyId}/bills`,
          { method: 'POST', body: formData }
        );
        if (!res.ok) throw new Error(res.statusText);
        const newBill = await res.json();
        setBills((curr) => [newBill, ...curr]);
      } catch (err) {
        console.error(err);
      }
    },
    [propertyId]
  );

  return { bills, loading, deleteBill, addBill };
}