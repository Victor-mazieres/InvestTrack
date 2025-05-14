// src/components/hooks/useSwipeNavigation.js
import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personnalisé pour la navigation par swipe entre les pages
 * Avec amélioration de l'accessibilité et performances
 * 
 * @param {Array} pages - Tableau des chemins de pages entre lesquels naviguer
 * @param {string} currentPath - Chemin actuel
 * @returns {Object} - Gestionnaires d'événements pour le swipe
 */
const useSwipeNavigation = (pages, currentPath) => {
  const navigate = useNavigate();
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // Distance minimale pour considérer un swipe
  const [isSwiping, setIsSwiping] = useState(false);
  const currentPageIndex = pages.indexOf(currentPath);

  // Gestionnaire de début de toucher
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  // Gestionnaire de fin de toucher
  const handleTouchEnd = useCallback((e) => {
    if (!touchStartX.current) return;
    
    touchEndX.current = e.changedTouches[0].clientX;
    setIsSwiping(false);
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const isSignificantSwipe = Math.abs(swipeDistance) > minSwipeDistance;
    
    if (!isSignificantSwipe) return;

    if (swipeDistance > 0) {
      // Swipe de droite à gauche (page précédente)
      if (currentPageIndex > 0) {
        navigate(pages[currentPageIndex - 1], { replace: false });
      }
    } else {
      // Swipe de gauche à droite (page suivante)
      if (currentPageIndex < pages.length - 1) {
        navigate(pages[currentPageIndex + 1], { replace: false });
      }
    }
    
    // Réinitialiser les refs
    touchStartX.current = null;
    touchEndX.current = null;
  }, [currentPageIndex, navigate, pages]);

  // Gestionnaire d'annulation de toucher
  const handleTouchCancel = useCallback(() => {
    touchStartX.current = null;
    touchEndX.current = null;
    setIsSwiping(false);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    'aria-roledescription': 'swipeable content', // Amélioration accessibilité
    'data-swipeable': true,
    style: isSwiping ? { touchAction: 'pan-y' } : {}, // Évite le défilement horizontal pendant le swipe
  };
};

export default useSwipeNavigation;