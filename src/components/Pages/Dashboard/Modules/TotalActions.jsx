// TotalActions.jsx
import React, { useContext } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Reutilisable/ActionsContext";
import { motion } from "framer-motion";

export default function TotalActions() {
  const { actions, loading } = useContext(ActionsContext);

  if (loading) return <p className="text-gray-100">Chargement...</p>;

  // Calcul du total d'actions
  const totalShares = actions.reduce(
    (total, action) => total + (action.quantity || 0),
    0
  );

  return (
    <div className="flex flex-col items-center p-4 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
      <h3 className="text-md font-semibold text-gray-100 mb-2">Total d'actions</h3>
      <div className="relative flex items-center justify-center w-24 h-24">
        <motion.svg className="absolute" width="96" height="96" viewBox="0 0 100 100">
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
        <p className="text-lg font-bold text-greenLight z-10">{totalShares}</p>
      </div>
    </div>
  );
}
