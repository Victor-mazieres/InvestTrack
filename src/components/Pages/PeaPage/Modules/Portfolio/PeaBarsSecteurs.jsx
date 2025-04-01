// src/components/Pages/PeaPage/Modules/Portfolio/PeaBarsSecteurs.jsx
import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ArrowLeft, Building2, Zap, Banknote, Car } from "lucide-react";
import { motion } from "framer-motion";
import { ActionsContext } from "../Reutilisable/ActionsContext"; // Ajustez le chemin si nécessaire

// Jeu de données statique (fallback)
const fullDataSectorsStatic = [
  { label: "Services aux collectivités", percentage: 52.75, Icon: Building2 },
  { label: "Énergie", percentage: 23.88, Icon: Zap },
  { label: "Sociétés financières", percentage: 20.84, Icon: Banknote },
  { label: "Biens de consommation durables", percentage: 2.53, Icon: Car },
  { label: "Technologie", percentage: 15.50, Icon: Building2 },
];

const COLORS_SECTORS = [
  "#1abc9c",
  "#f39c12",
  "#e74c3c",
  "#3498db",
  "#2ecc71",
];

// Durée d'animation pour les barres
const BAR_ANIMATION_DURATION = 0.8;

// --- Hooks personnalisés ---

/**
 * useSectorsData
 * Calcule dynamiquement la répartition par secteur à partir des actions.
 */
function useSectorsData(actionsData) {
  return useMemo(() => {
    if (actionsData.length === 0) return [];
    const sectorsMap = actionsData.reduce((acc, action) => {
      const sector = action.sector || "Non défini";
      const price = action.currentPrice || action.price || 1;
      const value = action.quantity * price;
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});
    const totalValue = Object.values(sectorsMap).reduce((sum, v) => sum + v, 0);
    return Object.entries(sectorsMap).map(([label, value]) => ({
      label,
      percentage: totalValue ? (value / totalValue) * 100 : 0,
    }));
  }, [actionsData]);
}

/**
 * useIconMapping
 * Fournit un mapping entre les secteurs et leurs icônes.
 */
function useIconMapping() {
  return {
    "Services aux collectivités": Building2,
    "Énergie": Zap,
    "Sociétés financières": Banknote,
    "Biens de consommation durables": Car,
    "Technologie": Building2,
  };
}

// --- Composant Bar ---

/**
 * Bar
 * Composant d'affichage d'une barre animée représentant un pourcentage.
 */
function Bar({ percentage, color }) {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full">
      <motion.div
        className="absolute left-0 top-0 h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: BAR_ANIMATION_DURATION, ease: "easeOut" }}
      />
    </div>
  );
}

Bar.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

// --- Composant SectorItem ---

/**
 * SectorItem
 * Composant pour afficher un secteur avec son icône, libellé, pourcentage et barre animée.
 */
const SectorItem = React.memo(function SectorItem({ item, idx, isDynamic, iconMapping }) {
  const Icon = isDynamic ? (iconMapping[item.label] || Building2) : item.Icon;
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-700">{item.label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {item.percentage.toFixed(2)}%
        </span>
      </div>
      <Bar
        percentage={item.percentage}
        color={COLORS_SECTORS[idx % COLORS_SECTORS.length]}
      />
    </motion.div>
  );
});

SectorItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
  }).isRequired,
  idx: PropTypes.number.isRequired,
  isDynamic: PropTypes.bool.isRequired,
  iconMapping: PropTypes.object.isRequired,
};

// --- Composant principal PeaBarsSecteurs ---

export default function PeaBarsSecteurs() {
  const navigate = useNavigate();
  const { actions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];
  const dynamicDataSectors = useSectorsData(actionsData);
  const displayData =
    dynamicDataSectors.length > 0 ? dynamicDataSectors : fullDataSectorsStatic;
  const iconMapping = useIconMapping();

  return (
    <div className="min-h-screen bg-light w-full p-6">
      {/* En-tête avec bouton de retour */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>
      <div className="w-full mb-6">
        <h1 className="text-3xl font-bold text-primary mt-2">
          Répartition par <span className="text-greenLight">Secteur</span>
        </h1>
      </div>
      {/* Bloc de répartition */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
          <p className="text-sm text-gray-500">
            {displayData.length} secteur{displayData.length > 1 ? "s" : ""} affiché
          </p>
        </div>
        <div className="space-y-4">
          {displayData.map((item, idx) => (
            <SectorItem
              key={idx}
              item={item}
              idx={idx}
              isDynamic={dynamicDataSectors.length > 0}
              iconMapping={iconMapping}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
