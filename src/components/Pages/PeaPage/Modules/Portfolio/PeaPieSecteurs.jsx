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

// Jeu de données complet pour les secteurs
const fullDataSectors = [
  { label: "Services aux collectivités", percentage: 52.75 },
  { label: "Énergie", percentage: 23.88 },
  { label: "Sociétés financières", percentage: 20.84 },
  { label: "Biens de consommation durables", percentage: 2.53 },
  { label: "Technologie", percentage: 15.5 },
  { label: "Santé", percentage: 10.0 },
  { label: "Immobilier", percentage: 5.3 },
];

// Palette de couleurs pour les secteurs
const COLORS_SECTORS = [
  "#1abc9c",
  "#f39c12",
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#e67e22",
];

/**
 * Dessine le secteur actif avec un contour et un drop-shadow pour accentuer le focus
 * (même logique que dans le code n°2).
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
 * Légende personnalisée (liste) sous le donut, reprenant la même présentation que dans le code n°2.
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
            {/* Pastille de couleur */}
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

export default function PeaPieSecteurs() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

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
          Répartition par <span className="text-greenLight">Secteur</span>
        </h1>
      </div>

      {/* Bloc "Répartition par secteur" */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-8">
        {/* Titre + nombre de valeurs affichées */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
          <p className="text-sm text-gray-500">
            {fullDataSectors.length} valeurs sur 5 affichées
          </p>
        </div>

        {/* Donut (PieChart) */}
        <div className="w-full h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={fullDataSectors}
                dataKey="percentage"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="40%"
                activeIndex={selectedIndex}
                activeShape={renderActiveShape}
                onClick={(_, index) => setSelectedIndex(index)}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              >
                {fullDataSectors.map((entry, index) => (
                  <Cell
                    key={`cell-sector-${index}`}
                    fill={
                      selectedIndex === null || selectedIndex === index
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

        {/* Légende (CustomLegendList) */}
        <CustomLegendList
          data={fullDataSectors}
          colors={COLORS_SECTORS}
          onItemClick={setSelectedIndex}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
}
