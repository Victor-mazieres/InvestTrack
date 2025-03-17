import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Settings,
  X,
  ChevronRight,
  Trash,
  Minus,
  Filter,
  LineChart,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  { label: "ENGIE", percentage: 52.75, amount: 1000 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 500 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 300 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 150 },
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
            className="text-sm text-gray-500 text-right w-full"
          >
            {dataSectors.length} / 5 affichées
          </p>
        </div>
        {/* Donut (camembert) qui empêche la propagation du clic */}
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
        {/* Légende qui empêche également la propagation */}
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
            className="text-sm text-gray-500 text-right w-full"
          >
            {dataValues.length} / 5 affichées
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
