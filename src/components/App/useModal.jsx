// src/components/hooks/useModal.js
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook personnalisé pour la gestion des modales avec react-router
 * @returns {Object} Méthodes pour ouvrir et fermer les modales
 */
const useModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Ouvre une modale en conservant l'historique de navigation
   * @param {string} path - Chemin de la modale à ouvrir
   */
  const openModal = useCallback((path) => {
    navigate(path, { 
      state: { 
        background: location 
      } 
    });
  }, [navigate, location]);

  /**
   * Ferme la modale en revenant à l'écran précédent
   */
  const closeModal = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return { openModal, closeModal };
};

export default useModal;