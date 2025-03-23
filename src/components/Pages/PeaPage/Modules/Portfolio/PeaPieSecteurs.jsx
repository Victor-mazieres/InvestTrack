// src/components/Pages/PeaPage/Modules/Portfolio/PeaPieSecteurs.jsx
import React, { useContext, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { ActionsContext } from "../Actions/ActionsContext"; // Vérifiez le chemin

// Composant de légende personnalisée affichée sous le PieChart.
function CustomLegendList({ data, colors, onItemClick, selectedIndex }) {
  return (
    <ul className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
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

export default function PeaPieSecteurs({ onValueClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Récupération des actions depuis le contexte
  const { actions } = useContext(ActionsContext);
  const actionsData = useMemo(() => (Array.isArray(actions) ? actions : []), [actions]);

  // Calcul de la valeur totale du portefeuille
  const totalValue = useMemo(() => {
    return actionsData.reduce((sum, action) => {
      const price = action.currentPrice || action.price || 1; // valeur par défaut = 1
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

  // Fallback statique si aucune donnée n'est disponible
  const fallbackData = [{ label: "Aucune donnée", percentage: 100 }];

  const displayData = dataSectors.length > 0 && totalValue > 0 ? dataSectors : fallbackData;

  // Palette de couleurs
  const COLORS_SECTORS = [
    "#1abc9c",
    "#f39c12",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#e67e22",
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
    <div className="relative min-h-screen bg-light w-full p-6">
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
          Répartition par <span className="text-greenLight">Secteur</span>
        </h1>
      </div>

      {/* Carte Donut */}
      <div
        onClick={handleSectorClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm mb-8 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Répartition par secteur</h3>
          <p className="text-sm text-gray-500">{displayData.length} secteur(s)</p>
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
                  activeIndex={selectedIndex}
                  onClick={(_, index) => setSelectedIndex(selectedIndex === index ? null : index)}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                >
                  {displayData.map((entry, index) => (
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
        <CustomLegendList
          data={displayData}
          colors={COLORS_SECTORS}
          onItemClick={setSelectedIndex}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
}
