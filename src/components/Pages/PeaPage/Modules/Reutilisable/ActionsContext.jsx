import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000";

  const fetchActions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/connexion");
        return;
      }
      const res = await axios.get(`${API_URL}/api/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActions(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des actions :", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchActions();
      hasFetchedRef.current = true;
    }
  }, [fetchActions]);

  const addAction = async (newActionData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/connexion");
        return;
      }
      const res = await axios.post(`${API_URL}/api/actions`, newActionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActions((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une action :", error);
    }
  };

  const updateAction = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/connexion");
        return;
      }
      const res = await axios.put(`${API_URL}/api/actions/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActions((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'action :", error);
    }
  };

  const deleteAction = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/connexion");
        return;
      }
      await axios.delete(`${API_URL}/api/actions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActions((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'action :", error);
    }
  };

  return (
    <ActionsContext.Provider
      value={{ actions, loading, fetchActions, addAction, updateAction, deleteAction }}
    >
      {children}
    </ActionsContext.Provider>
  );
}
