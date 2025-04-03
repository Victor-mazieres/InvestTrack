import React, { useContext, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ActionsContext } from "../Reutilisable/ActionsContext"; // Vérifiez le chemin

// Jeu de données statique (fallback) pour les valeurs
const fullDataValuesStatic = [
  { label: "ENGIE", percentage: 52.75, amount: 513.9 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 232.68 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 129.04 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 74.02 },
];

const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e", "#3498db"];

// Composant de légende personnalisée affichée sous le PieChart.
function CustomLegendList({ data, colors, onItemClick, selectedIndex, tooltipData, setTooltipData }) {
  return (
    <ul className="mt-4 w-full relative" onClick={(e) => e.stopPropagation()}>
      {data.map((item, index) => (
        <li
          key={index}
          onClick={() => onItemClick(index)}
          onMouseEnter={() => setTooltipData({ index, amount: item.amount })}
          onMouseLeave={() => setTooltipData(null)}
          className={`cursor-pointer flex justify-between items-center px-4 py-1 transition-colors duration-200 ${
            selectedIndex === index ? "font-bold text-greenLight" : "text-gray-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              style={{ backgroundColor: colors[index % colors.length] }}
              className="w-3 h-3 rounded-full"
            />
            <span className="text-sm text-gray-100">{item.label}</span>
          </div>
          <span className="text-sm font-semibold text-gray-100">
            {item.percentage.toFixed(2)}%
          </span>
        </li>
      ))}
      <AnimatePresence>
        {tooltipData && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10"
          >
            Montant : {tooltipData.amount.toFixed(2)}€
          </motion.div>
        )}
      </AnimatePresence>
    </ul>
  );
}

export default function PeaPieValeurs({ onValueClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  // Récupération des actions depuis le contexte
  const { actions } = useContext(ActionsContext);
  const actionsData = useMemo(
    () => (Array.isArray(actions) ? actions : []),
    [actions]
  );

  // Calcul de la valeur totale du portefeuille
  const totalValue = useMemo(() => {
    return actionsData.reduce((sum, action) => {
      const price = action.currentPrice || action.price || 1;
      const quantity = action.quantity || 0;
      return sum + quantity * price;
    }, 0);
  }, [actionsData]);

  // Calcul de la répartition par valeur pour chaque action
  const dataValues = useMemo(() => {
    return actionsData.map((action) => {
      const price = action.currentPrice || action.price || 1;
      const quantity = action.quantity || 0;
      const value = quantity * price;
      return {
        label: action.name || "Action sans nom",
        percentage: totalValue ? (value / totalValue) * 100 : 0,
        amount: value,
      };
    });
  }, [actionsData, totalValue]);

  // Fallback statique si aucune donnée n'est disponible
  const fallbackData = [{ label: "Aucune donnée", percentage: 100, amount: 0 }];
  const displayData =
    dataValues.length > 0 && totalValue > 0 ? dataValues : fallbackData;

  // Fonction de navigation par défaut
  const defaultValueClick = () => {
    navigate("/RepartitionCamembertValeurs", { state: { background: location.pathname } });
  };
  const handleValueClick = onValueClick || defaultValueClick;

  return (
    <div className="min-h-screen bg-gray-900 w-full p-6 relative">
      {/* Header */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:shadow-lg transition"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-gray-100">Retour</h1>
      </header>
      <div className="w-full mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mt-2">
          Répartition par <span className="text-greenLight">Valeur</span>
        </h1>
      </div>

      {/* Carte Donut */}
      <div
        onClick={handleValueClick}
        className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl p-4 shadow-2xl hover:shadow-3xl cursor-pointer transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-100">Répartition par valeur</h3>
          <p onClick={(e) => e.stopPropagation()} className="text-sm text-gray-400">
            {displayData.length} valeur{displayData.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-full h-[300px] mb-4" onClick={(e) => e.stopPropagation()}>
          {totalValue > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={displayData}
                  dataKey="percentage"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="40%"
                  minAngle={5}
                  activeIndex={selectedValueIndex}
                  onClick={(_, index) =>
                    setSelectedValueIndex(selectedValueIndex === index ? null : index)
                  }
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                >
                  {displayData.map((entry, index) => (
                    <Cell
                      key={`cell-value-${index}`}
                      fill={
                        selectedValueIndex === null || selectedValueIndex === index
                          ? COLORS_VALUES[index % COLORS_VALUES.length]
                          : "#4a4a4a"
                      }
                      cursor="pointer"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
        <CustomLegendList
          data={displayData}
          colors={COLORS_VALUES}
          onItemClick={setSelectedValueIndex}
          selectedIndex={selectedValueIndex}
          tooltipData={tooltipData}
          setTooltipData={setTooltipData}
        />
      </div>
    </div>
  );
}
