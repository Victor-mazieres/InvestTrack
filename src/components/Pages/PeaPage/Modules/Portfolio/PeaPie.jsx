import React, { useContext, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ActionsContext } from "../Reutilisable/ActionsContext";
import { motion, AnimatePresence } from "framer-motion";

// Composant de légende personnalisée affichée sous le PieChart.
function CustomLegendList({ data, colors, onItemClick, selectedIndex }) {
  return (
    <ul className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
      {data.map((item, index) => (
        <li
          key={index}
          onClick={() => onItemClick(index)}
          className={`cursor-pointer flex items-center px-4 py-1 transition-colors duration-200 ${
            selectedIndex === index ? "font-bold text-greenLight" : "text-gray-400"
          }`}
        >
          <div className="flex items-center space-x-2 flex-grow">
            <div
              style={{ backgroundColor: colors[index % colors.length] }}
              className="w-3 h-3 rounded-full flex-shrink-0"
            />
            <span className="text-sm text-gray-100 break-words">
              {item.label}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-100 whitespace-nowrap ml-4">
            {item.percentage.toFixed(2)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PeaPie({ onValueClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSectorIndex, setSelectedSectorIndex] = useState(null);
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);

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

  // Calcul de la répartition par secteur
  const sectorsMap = useMemo(() => {
    return actionsData.reduce((acc, action) => {
      const sector = action.sector || "Non défini";
      const price = action.currentPrice || action.price || 1;
      const quantity = action.quantity || 0;
      const value = quantity * price;
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});
  }, [actionsData]);

  const dataSectors = useMemo(() => {
    return Object.entries(sectorsMap).map(([label, value]) => ({
      label,
      percentage: totalValue ? (value / totalValue) * 100 : 0,
    }));
  }, [sectorsMap, totalValue]);

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

  // Couleurs utilisées pour les graphiques
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

  // Fonctions de navigation par défaut
  const defaultSectorClick = () => {
    navigate("/RepartitionCamembertSecteurs", { state: { background: location.pathname } });
  };
  const defaultValueClick = () => {
    navigate("/RepartitionCamembertValeurs", { state: { background: location.pathname } });
  };

  const handleSectorClick = defaultSectorClick;
  const handleValueClick = onValueClick || defaultValueClick;

  return (
    <div className="relative w-full bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-300">
      {/* Card pour Répartition par secteur */}
      <div
        onClick={handleSectorClick}
        className="cursor-pointer mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-100">Répartition par secteur</h3>
          <p onClick={(e) => e.stopPropagation()} className="text-sm text-gray-400">
            {dataSectors.length} secteur{dataSectors.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-full h-[300px] mb-4" onClick={(e) => e.stopPropagation()}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={dataSectors}
                dataKey="percentage"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="40%"
                activeIndex={selectedSectorIndex}
                onClick={(_, index) =>
                  setSelectedSectorIndex(selectedSectorIndex === index ? null : index)
                }
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              >
                {dataSectors.map((entry, index) => (
                  <Cell
                    key={`cell-sector-${index}`}
                    fill={
                      selectedSectorIndex === null ||
                      selectedSectorIndex === index
                        ? COLORS_SECTORS[index % COLORS_SECTORS.length]
                        : "#4a4a4a"
                    }
                    cursor="pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegendList
          data={dataSectors}
          colors={COLORS_SECTORS}
          onItemClick={setSelectedSectorIndex}
          selectedIndex={selectedSectorIndex}
        />
      </div>

      {/* Séparateur sous forme de border */}
      <div className="border-t border-gray-600 my-6"></div>

      {/* Card pour Répartition par valeur */}
      <div
        onClick={handleValueClick}
        className="cursor-pointer mb-12"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-100">Répartition par valeur</h3>
          <p onClick={(e) => e.stopPropagation()} className="text-sm text-gray-400">
            {dataValues.length} valeur{dataValues.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-full h-[300px] mb-4" onClick={(e) => e.stopPropagation()}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={dataValues}
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
                {dataValues.map((entry, index) => (
                  <Cell
                    key={`cell-value-${index}`}
                    fill={
                      selectedValueIndex === null ||
                      selectedValueIndex === index
                        ? COLORS_VALUES[index % COLORS_VALUES.length]
                        : "#4a4a4a"
                    }
                    cursor="pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegendList
          data={dataValues}
          colors={COLORS_VALUES}
          onItemClick={setSelectedValueIndex}
          selectedIndex={selectedValueIndex}
        />
      </div>
    </div>
  );
}
