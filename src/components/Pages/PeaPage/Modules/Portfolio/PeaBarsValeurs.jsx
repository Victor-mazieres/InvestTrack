// PeaBarsValeursDetails.jsx
import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ActionsContext } from "../Reutilisable/ActionsContext"; // Ajustez le chemin si nécessaire

// Jeu de données statique (fallback)
const fullDataValuesStatic = [
  { label: "ENGIE", percentage: 52.75, amount: 513.9 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 232.68 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 129.04 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 74.02 },
  { label: "AUTRE SOCIÉTÉ", percentage: 3.53, amount: 50.0 },
];

const COLORS_VALUES = [
  "#9b59b6",
  "#2ecc71",
  "#e67e22",
  "#34495e",
  "#3498db",
];

/**
 * Composant Bar
 * Affiche une barre représentant visuellement le pourcentage d'une valeur.
 */
function Bar({ percentage, color }) {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full">
      <div
        className="absolute left-0 top-0 h-2 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

/**
 * PeaBarsValeursDetails
 * Affiche la répartition par valeur.
 * Si des données dynamiques (actions) sont disponibles dans le contexte, on calcule pour chaque action sa valeur,
 * sinon on utilise le jeu de données statique.
 */
export default function PeaBarsValeursDetails() {
  const navigate = useNavigate();
  const { actions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];

  // Calcul dynamique des valeurs si des actions sont présentes
  const dynamicDataValues = useMemo(() => {
    if (actionsData.length === 0) return [];
    // Calcul de la valeur totale du portefeuille
    const totalValue = actionsData.reduce((sum, action) => {
      const price = action.currentPrice || action.price || 1; // Valeur par défaut = 1 si non défini
      return sum + action.quantity * price;
    }, 0);
    // Création du tableau des valeurs pour chaque action
    return actionsData.map((action) => {
      const price = action.currentPrice || action.price || 1;
      const value = action.quantity * price;
      return {
        label: action.name,
        percentage: totalValue ? (value / totalValue) * 100 : 0,
        amount: value,
      };
    });
  }, [actionsData]);

  // Utiliser les données dynamiques si disponibles, sinon le fallback statique
  const displayData =
    dynamicDataValues.length > 0 ? dynamicDataValues : fullDataValuesStatic;

  return (
    <div className="min-h-screen bg-light w-full p-6">
      {/* Header */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>
      <div className="w-full mb-6">
        <h1 className="text-3xl font-bold text-primary mt-2">
          Répartition par <span className="text-greenLight">Valeur</span>
        </h1>
      </div>

      {/* Bloc Répartition par valeur */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            Répartition par valeur
          </h3>
          <p className="text-sm text-gray-500">
            {displayData.length} valeur{displayData.length > 1 ? "s" : ""} affichée
            {displayData.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="space-y-4">
          {displayData.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {item.percentage.toFixed(2)}% soit {item.amount.toFixed(2)}€
                </span>
              </div>
              <Bar
                percentage={item.percentage}
                color={COLORS_VALUES[idx % COLORS_VALUES.length]}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
