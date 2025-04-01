import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ActionsContext } from "../Reutilisable/ActionsContext"; // Adaptez le chemin selon votre structure

export default function PeaBars({ onSectorClick, onValueClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Récupération des actions depuis le contexte
  const { actions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];

  // Calculer la valeur totale du portefeuille.
  // Pour éviter un total de 0 si aucune action n'a de prix renseigné, on utilise 1 comme valeur par défaut.
  const totalValue = actionsData.reduce((sum, action) => {
    const price = action.currentPrice || action.price || 1;
    return sum + action.quantity * price;
  }, 0);

  // Calculer la répartition par secteur
  const sectorsMap = actionsData.reduce((acc, action) => {
    const sector = action.sector || "Non défini";
    const price = action.currentPrice || action.price || 1;
    const value = action.quantity * price;
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {});

  const sectorsData = Object.entries(sectorsMap).map(([label, value]) => ({
    label,
    percentage: (value / totalValue) * 100,
  }));

  // Calculer la répartition par valeur (chaque action devient une entrée)
  const valuesData = actionsData.map((action) => {
    const price = action.currentPrice || action.price || 1;
    const value = action.quantity * price;
    return {
      label: action.name,
      percentage: (value / totalValue) * 100,
      amount: value,
    };
  });

  // Couleurs statiques pour l'affichage
  const COLORS_SECTORS = [
    "#1abc9c",
    "#f39c12",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
  ];
  const COLORS_VALUES = [
    "#9b59b6",
    "#2ecc71",
    "#e67e22",
    "#34495e",
    "#3498db",
  ];

  // Gestion des clics par défaut
  const defaultSectorClick = () => {
    navigate("/RepartitionBarreSecteurs", { state: { background: location } });
  };
  const defaultValueClick = () => {
    navigate("/RepartitionBarreValeurs", { state: { background: location } });
  };

  const handleSectorClick = onSectorClick || defaultSectorClick;
  const handleValueClick = onValueClick || defaultValueClick;

  return (
    <div className="space-y-6">
      {/* Bloc Répartition par secteur */}
      <div
        onClick={handleSectorClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-gray-800">
            Répartition par secteur
          </h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              handleSectorClick();
            }}
            className="text-sm text-gray-500"
          >
            {sectorsData.length} secteurs
          </p>
        </div>
        {sectorsData.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {item.percentage.toFixed(2)}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <motion.div
                className="absolute left-0 top-0 h-2 rounded-full"
                style={{
                  backgroundColor:
                    COLORS_SECTORS[idx % COLORS_SECTORS.length],
                }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bloc Répartition par valeur */}
      <div
        onClick={handleValueClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-gray-800">Répartition par valeur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              handleValueClick();
            }}
            className="text-sm text-gray-500"
          >
            {valuesData.length} valeurs
          </p>
        </div>
        {valuesData.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-700">
                {item.percentage.toFixed(2)}% soit {item.amount.toFixed(2)}€
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <motion.div
                className="absolute left-0 top-0 h-2 rounded-full"
                style={{
                  backgroundColor:
                    COLORS_VALUES[idx % COLORS_VALUES.length],
                }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
