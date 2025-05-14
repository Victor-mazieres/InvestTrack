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
  error: null,
  fetchActions: () => Promise.resolve([]),
  addAction: () => Promise.resolve(),
  updateAction: () => Promise.resolve(),
  deleteAction: () => Promise.resolve(),
});

export function ActionsProvider({ children }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionsError, setActionsError] = useState(null);
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Initialisation axios pour CSRF + cookies
  useEffect(() => {
    api.defaults.withCredentials = true;
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) {
      api.defaults.headers.common['X-CSRF-Token'] = meta.content;
    }
  }, []);

  const fetchActions = useCallback(
    async (forceRefresh = false, retryCount = 0) => {
      if (isFetchingRef.current) return actions;
      if (!forceRefresh && hasFetchedRef.current) return actions;

      isFetchingRef.current = true;
      setLoading(true);
      setActionsError(null);

      try {
        const res = await api.get('/actions');
        setActions(res.data);
        hasFetchedRef.current = true;
        return res.data;
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          navigate('/connexion', { replace: true });
          return [];
        }
        if (status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`429 Too Many Requests, retry #${retryCount + 1} in ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
          return fetchActions(forceRefresh, retryCount + 1);
        }
        console.error('Erreur lors de la récupération des actions :', err);
        setActionsError(err);
        hasFetchedRef.current = true;
        return [];
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [actions, navigate]
  );

  // Fetch initial + refetch on reconnect
  useEffect(() => {
    fetchActions();
    const onAuth = () => {
      hasFetchedRef.current = false;
      fetchActions(true);
    };
    window.addEventListener('userAuthenticated', onAuth);
    return () => window.removeEventListener('userAuthenticated', onAuth);
  }, [fetchActions]);

  const addAction = useCallback(
    async newActionData => {
      setLoading(true);
      setActionsError(null);
      try {
        const res = await api.post('/actions', newActionData);
        setActions(prev => [...prev, res.data]);
        return res.data;
      } catch (err) {
        console.error("Erreur lors de l'ajout d'une action :", err);
        setActionsError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAction = useCallback(
    async (id, updatedData) => {
      setLoading(true);
      setActionsError(null);
      try {
        const res = await api.put(`/actions/${id}`, updatedData);
        setActions(prev => prev.map(a => (a.id === id ? res.data : a)));
        return res.data;
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'action :", err);
        setActionsError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAction = useCallback(
    async id => {
      setLoading(true);
      setActionsError(null);
      try {
        await api.delete(`/actions/${id}`);
        setActions(prev => prev.filter(a => a.id !== id));
        return true;
      } catch (err) {
        console.error("Erreur lors de la suppression de l'action :", err);
        setActionsError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Si l'initial fetch a échoué, on affiche un message d'erreur global
  if (actionsError && !loading && !hasFetchedRef.current) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md text-center m-4">
        Impossible de charger les actions. Vérifiez votre connexion et réessayez.
      </div>
    );
  }

  return (
    <ActionsContext.Provider
      value={{
        actions,
        loading,
        error: actionsError,
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
