// PeaBarsSecteurs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Zap, Banknote, Car } from "lucide-react";
import { motion } from "framer-motion";

// Jeu de données complet pour les secteurs (5 valeurs dans cet exemple)
const fullDataSectors = [
  { label: "Services aux collectivités", percentage: 52.75, Icon: Building2 },
  { label: "Énergie", percentage: 23.88, Icon: Zap },
  { label: "Sociétés financières", percentage: 20.84, Icon: Banknote },
  { label: "Biens de consommation durables", percentage: 2.53, Icon: Car },
  { label: "Technologie", percentage: 15.50, Icon: Building2 }, // Exemple supplémentaire
];

const COLORS_SECTORS = [
  "#1abc9c",
  "#f39c12",
  "#e74c3c",
  "#3498db",
  "#2ecc71",
];

// Composant barre pour afficher visuellement le pourcentage
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

export default function PeaBarsSecteurs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light w-full p-6">
      {/* Header avec flèche de retour et titre */}
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

      {/* Bloc affichant la liste complète des secteurs */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800"><p className="text-sm text-gray-500">
            {fullDataSectors.length} valeurs sur {fullDataSectors.length} affichées
          </p></h3>
        </div>
        <div className="space-y-4">
          {fullDataSectors.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <item.Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {item.percentage.toFixed(2)}%
                </span>
              </div>
              <Bar
                percentage={item.percentage}
                color={COLORS_SECTORS[idx % COLORS_SECTORS.length]}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
