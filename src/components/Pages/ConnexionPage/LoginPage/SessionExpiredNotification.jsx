// src/components/Notifications/SessionExpiredNotification.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionExpiredNotification = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Vérifie si l'URL contient le paramètre sessionExpired
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsVisible(urlParams.get('sessionExpired') === 'true');
  }, []);

  // Ferme la notification
  const closeNotification = () => {
    setIsVisible(false);
    // Nettoye l'URL pour éviter de remontrer la notification si la page est rafraîchie
    const url = new URL(window.location.href);
    url.searchParams.delete('sessionExpired');
    window.history.replaceState({}, '', url);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4"
        >
          <div className="bg-orange-100 border border-orange-500 text-orange-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md w-full">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span><strong>Session expirée</strong> - Veuillez vous reconnecter pour continuer.</span>
            </div>
            <button 
              onClick={closeNotification}
              className="text-orange-700 hover:text-orange-900 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredNotification;