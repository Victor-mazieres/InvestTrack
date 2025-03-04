import React, { useState } from "react";
import { TrendingUp, Settings } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";
import { Building2, Zap, Banknote, Car } from "lucide-react";

// Données pour la répartition par secteur, avec icônes
const dataSectors = [
  { label: "Services aux collectivités", percentage: 52.75, Icon: Building2 },
  { label: "Énergie", percentage: 23.88, Icon: Zap },
  { label: "Sociétés financières", percentage: 20.84, Icon: Banknote },
  { label: "Biens de consommation durables", percentage: 2.53, Icon: Car },
];

// Données pour la répartition par valeur
const dataValues = [
  { label: "ENGIE", percentage: 52.75, amount: 513.9 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 232.68 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 129.04 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 74.02 },
];

// Palette modernisée pour les barres et camemberts
const COLORS_SECTORS = ["#1abc9c", "#f39c12", "#e74c3c", "#3498db"];
const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e"];

/**
 * Fonction renderActiveShape : dessine un secteur avec un contour lorsque celui-ci est sélectionné
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
      />
    </g>
  );
}

/**
 * Légende personnalisée affichée en liste : chaque item affiche la pastille, le label et le pourcentage à droite.
 */
const renderCustomLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-col items-start space-y-1">
      {payload.map((entry, index) => {
        const { label, percentage } = entry.payload;
        return (
          <li key={`item-${index}`} className="flex items-center justify-between w-64">
            <div className="flex items-center space-x-2">
              <div style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full"></div>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {percentage.toFixed(2)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default function PeaPortfolio() {
  // Mode d'affichage : "bars" ou "pie"
  const [chartMode, setChartMode] = useState("bars");
  const [selectedSectorIndex, setSelectedSectorIndex] = useState(null);
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);

  const toggleChartMode = () => {
    setChartMode(chartMode === "bars" ? "pie" : "bars");
  };

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Répartitions des actions
        </h2>
        <button onClick={toggleChartMode} className="text-gray-600 hover:text-primary transition">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {chartMode === "bars" ? (
        <>
          {/* Mode Barres : Répartition par secteur */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
              <p className="text-sm text-gray-500">{dataSectors.length} valeurs sur 5 affichées</p>
            </div>
            {dataSectors.map((item, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.03 }} className="mb-3 cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <item.Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.percentage.toFixed(2)} %
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS_SECTORS[idx % COLORS_SECTORS.length],
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mode Barres : Répartition par valeur */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Répartition par valeur</h3>
              <p className="text-sm text-gray-500">{dataValues.length} valeurs sur 5 affichées</p>
            </div>
            {dataValues.map((item, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.03 }} className="mb-3 cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.percentage.toFixed(2)} % soit {item.amount.toFixed(2)} €
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS_VALUES[idx % COLORS_VALUES.length],
                    }}
                  />
                </div>
              </motion.div>
            ))}
            <div className="mt-2 text-sm">
              <a href="#all-values" className="text-green-600 hover:text-green-800 font-medium">
                Voir toutes les valeurs
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mode Pie : Donut pour Répartition par secteur */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Répartition par secteur</h3>
            <div className="w-full h-80 mb-8">
              <ResponsiveContainer>
                <PieChart margin={{ top: 40, bottom: 20 }}>
                  <Pie
                    data={dataSectors}
                    dataKey="percentage"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40} // Donut effect
                    activeIndex={selectedSectorIndex}
                    activeShape={renderActiveShape}
                    onClick={(_, index) => setSelectedSectorIndex(index)}
                  >
                    {dataSectors.map((entry, index) => (
                      <Cell
                        key={`cell-sector-${index}`}
                        fill={COLORS_SECTORS[index % COLORS_SECTORS.length]}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>
                  <Legend
                    content={renderCustomLegend}
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ marginTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mode Pie : Donut pour Répartition par valeur */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Répartition par valeur</h3>
            <div className="w-full h-64 mb-8">
              <ResponsiveContainer>
                <PieChart margin={{ top: 40, bottom: 20 }}>
                  <Pie
                    data={dataValues}
                    dataKey="percentage"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40} // Donut effect
                    activeIndex={selectedValueIndex}
                    activeShape={renderActiveShape}
                    onClick={(_, index) => setSelectedValueIndex(index)}
                  >
                    {dataValues.map((entry, index) => (
                      <Cell
                        key={`cell-value-${index}`}
                        fill={COLORS_VALUES[index % COLORS_VALUES.length]}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>
                  <Legend
                    content={renderCustomLegend}
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ marginTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm">
              <a href="#all-values" className="text-green-600 hover:text-green-800 font-medium">
                Voir toutes les valeurs
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
