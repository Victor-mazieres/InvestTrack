// src/contexts/ActionsContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../api/index';

export const ActionsContext = createContext({
  actions: [],
  loading: true,
  fetchActions: () => {},
  addAction: () => {},
  updateAction: () => {},
  deleteAction: () => {},
});

export function ActionsProvider({ children }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();
  const hasFetchedRef           = useRef(false);

  const fetchActions = useCallback(async () => {
    try {
      const res = await api.get('/actions');
      setActions(res.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des actions :', err);
      // si c'est un 401, l'intercepteur redirige automatiquement
    } finally {
      setLoading(false);
    }
  }, []);

  // On fetch seulement une fois au montage
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchActions();
      hasFetchedRef.current = true;
    }
  }, [fetchActions]);

  const addAction = useCallback(async newActionData => {
    try {
      const res = await api.post('/actions', newActionData);
      setActions(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de l'ajout d'une action :", err);
    }
  }, []);

  const updateAction = useCallback(async (id, updatedData) => {
    try {
      const res = await api.put(`/actions/${id}`, updatedData);
      setActions(prev => prev.map(a => (a.id === id ? res.data : a)));
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'action :", err);
    }
  }, []);

  const deleteAction = useCallback(async id => {
    try {
      await api.delete(`/actions/${id}`);
      setActions(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression de l'action :", err);
    }
  }, []);

  return (
    <ActionsContext.Provider
      value={{
        actions,
        loading,
        fetchActions,
        addAction,
        updateAction,
        deleteAction
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}
