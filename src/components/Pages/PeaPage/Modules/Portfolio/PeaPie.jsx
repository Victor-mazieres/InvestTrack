import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";

const dataSectors = [
  { label: "Services aux collectivités", percentage: 52.75 },
  { label: "Énergie", percentage: 23.88 },
  { label: "Sociétés financières", percentage: 20.84 },
  { label: "Biens de consommation durables", percentage: 2.53 },
];

const dataValues = [
  { label: "ENGIE", percentage: 52.75 },
  { label: "TOTALENERGIES SE", percentage: 23.88 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6 },
];

const COLORS_SECTORS = ["#1abc9c", "#f39c12", "#e74c3c", "#3498db"];
const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e"];

/**
 * Dessine le secteur actif avec un contour et un drop-shadow pour accentuer le focus.
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
 * Légende personnalisée affichée en liste sous le donut.
 */
function CustomLegendList({ data, colors, onItemClick, selectedIndex }) {
  return (
    <ul className="mt-4 w-full">
      {data.map((item, index) => (
        <li
          key={index}
          onClick={() => onItemClick(index)}
          className={`cursor-pointer flex justify-between items-center px-4 py-1 ${
            selectedIndex === index ? "font-bold" : ""
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              style={{ backgroundColor: colors[index % colors.length] }}
              className="w-3 h-3 rounded-full"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {item.percentage.toFixed(2)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PeaPie({ onSectorClick, onValueClick }) {
  const navigate = useNavigate();
  const [selectedSectorIndex, setSelectedSectorIndex] = useState(null);
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);

  // Par défaut, si aucun onClick n'est passé, on navigue vers "/RepartitionBarre" avec le background
  const defaultSectorClick = () => {
    navigate("/RepartitionCamembertSecteurs", { state: { background: location.pathname } });

  };
  const defaultValueClick = () => {
    navigate("/RepartitionCamembertValeurs", { state: { background: location.pathname } });
  };

  const handleSectorClick = onSectorClick || defaultSectorClick;
  const handleValueClick = onValueClick || defaultValueClick;

  return (
    <div className="relative min-h-screen bg-light w-full">

      {/* Donut pour Répartition par secteur */}
      <div onClick={handleSectorClick} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              // Ici vous pouvez ajouter une fonction au clic si nécessaire
            }}
            className="text-sm text-gray-500"
          >
            {dataSectors.length} valeurs sur 5 affichées
          </p>
        </div>
        <div className="w-full h-[300px] mb-4">
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
                onClick={(_, index) => setSelectedSectorIndex(index)}
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

      {/* Donut pour Répartition par valeur */}
      <div onClick={handleValueClick} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-12">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par valeur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              // Ajoutez ici une fonction au clic si nécessaire
            }}
            className="text-sm text-gray-500"
          >
            {dataValues.length} valeurs sur 5 affichées
          </p>
        </div>
        <div className="w-full h-[300px] mb-4">
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
                onClick={(_, index) => setSelectedValueIndex(index)}
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
