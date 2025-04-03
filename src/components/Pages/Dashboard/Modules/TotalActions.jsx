import React, { useContext, useEffect } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Reutilisable/ActionsContext";
import { motion } from "framer-motion";

export default function TotalActions() {
  const { actions, loading, fetchActions } = useContext(ActionsContext);

  // Relancer le fetch si le tableau d'actions est vide
  useEffect(() => {
    if (actions.length === 0) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  if (loading) return <p className="text-gray-100">Chargement...</p>;

  // Somme des quantités de chaque action
  const totalShares = actions.reduce(
    (total, action) => total + (action.quantity || 0),
    0
  );

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 p-4 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
      <h3 className="text-md font-semibold text-gray-100 mb-2">Total d'actions</h3>
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* SVG animé pour dessiner le cercle */}
        <motion.svg
          className="absolute"
          width="96"
          height="96"
          viewBox="0 0 100 100"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2e8e97"
            strokeWidth="10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </motion.svg>
        {/* Nombre d'actions affiché au centre avec une taille réduite */}
        <p className="text-lg font-bold text-greenLight z-10">{totalShares}</p>
      </div>
    </div>
  );
}
