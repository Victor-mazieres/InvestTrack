// src/components/Pages/PeaPage/Modules/Portfolio/PeaPie.jsx
import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { ActionsContext } from "../Actions/ActionsContext"; // Assurez-vous que le chemin est correct

/**
 * Fonction de rendu pour le secteur actif dans le PieChart.
 */
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="none"
        stroke="#333"
        strokeWidth={2}
        style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))" }}
      />
    </g>
  );
}

/**
 * Composant de légende personnalisée affichée sous le PieChart.
 */
function CustomLegendList({ data, colors, onItemClick, selectedIndex }) {
  return (
    <ul className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
      {data.map((item, index) => (
        <li
          key={index}
          onClick={() => onItemClick(index)}
          className={`cursor-pointer flex items-center px-4 py-1 ${
            selectedIndex === index ? "font-bold" : ""
          }`}
        >
          <div className="flex items-center space-x-2 flex-grow">
            <div
              style={{ backgroundColor: colors[index % colors.length] }}
              className="w-3 h-3 rounded-full flex-shrink-0"
            />
            <span className="text-sm text-gray-700 break-words">
              {item.label}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap ml-4">
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
  const actionsData = Array.isArray(actions) ? actions : [];

  // Calcul de la valeur totale du portefeuille
  const totalValue = actionsData.reduce((sum, action) => {
    const price = action.currentPrice || action.price || 0;
    return sum + action.quantity * price;
  }, 0);

  // Calcul de la répartition par secteur
  const sectorsMap = actionsData.reduce((acc, action) => {
    const sector = action.sector || "Non défini";
    const price = action.currentPrice || action.price || 0;
    const value = action.quantity * price;
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {});
  const dataSectors = Object.entries(sectorsMap).map(([label, value]) => ({
    label,
    percentage: totalValue ? (value / totalValue) * 100 : 0,
  }));

  // Calcul de la répartition par valeur pour chaque action
  const dataValues = actionsData.map((action) => {
    const price = action.currentPrice || action.price || 0;
    const value = action.quantity * price;
    return {
      label: action.name,
      percentage: totalValue ? (value / totalValue) * 100 : 0,
      amount: value,
    };
  });

  // Couleurs utilisées pour les graphiques
  const COLORS_SECTORS = ["#1abc9c", "#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6"];
  const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e", "#3498db"];

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
    <div className="relative min-h-screen bg-light w-full">
      {/* Card pour Répartition par secteur */}
      <div
        onClick={handleSectorClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm mb-8 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
          <p
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-500"
          >
            {dataSectors.length} secteurs
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
                activeShape={renderActiveShape}
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
                      selectedSectorIndex === null || selectedSectorIndex === index
                        ? COLORS_SECTORS[index % COLORS_SECTORS.length]
                        : "#e0e0e0"
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

      {/* Card pour Répartition par valeur */}
      <div
        onClick={handleValueClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm mb-12 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par valeur</h3>
          <p
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-500"
          >
            {dataValues.length} valeurs
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
                activeIndex={selectedValueIndex}
                activeShape={renderActiveShape}
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
                      selectedValueIndex === null || selectedValueIndex === index
                        ? COLORS_VALUES[index % COLORS_VALUES.length]
                        : "#e0e0e0"
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
