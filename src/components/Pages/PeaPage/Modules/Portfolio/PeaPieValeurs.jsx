import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

// Jeu de données pour les valeurs
const fullDataValues = [
  { label: "ENGIE", percentage: 52.75 },
  { label: "TOTALENERGIES SE", percentage: 23.88 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6 },
  // Vous pouvez en ajouter d'autres si nécessaire
];

// Palette de couleurs pour les valeurs
const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e"];

/**
 * Dessine le secteur actif avec un contour et un drop-shadow pour accentuer le focus.
 * (même logique que dans le code "Répartition par secteur")
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
 * Identique au code de la répartition par secteur, 
 * sauf qu'on utilise ici les données de "fullDataValues".
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

export default function PeaPieValeurs() {
  const navigate = useNavigate();
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);

  return (
    <div className="min-h-screen bg-light w-full p-6">
      {/* Header avec bouton Retour et titre */}
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

      {/* Donut pour Répartition par valeur */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm mb-12">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par valeur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              // Vous pouvez ajouter une fonction au clic si nécessaire
            }}
            className="text-sm text-gray-500"
          >
            {fullDataValues.length} valeurs sur 5 affichées
          </p>
        </div>
        <div className="w-full h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={fullDataValues}
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
                {fullDataValues.map((entry, index) => (
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
          data={fullDataValues}
          colors={COLORS_VALUES}
          onItemClick={setSelectedValueIndex}
          selectedIndex={selectedValueIndex}
        />
      </div>
    </div>
  );
}
