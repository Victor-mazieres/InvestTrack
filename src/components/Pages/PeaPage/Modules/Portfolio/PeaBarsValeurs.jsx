// PeaBarsValeursDetails.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const fullDataValues = [
  { label: "ENGIE", percentage: 52.75, amount: 513.9 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 232.68 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 129.04 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 74.02 },
  { label: "AUTRE SOCIÉTÉ", percentage: 3.53, amount: 50.00 },
  // Ajoutez d'autres valeurs si nécessaire
];

const COLORS_VALUES = [
  "#9b59b6",
  "#2ecc71",
  "#e67e22",
  "#34495e",
  "#3498db",
];

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

export default function PeaBarsValeursDetails() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light w-full p-6">
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
          Répartition par <span className="text-greenLight">Valeur</span>
        </h1>
      </div>

      {/* Bloc Répartition par valeur (liste complète) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800"><p className="text-sm text-gray-500">
            {fullDataValues.length} valeurs sur {fullDataValues.length} affichées
          </p></h3>
        </div>
        <div className="space-y-4">
          {fullDataValues.map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.03 }} className="cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {item.percentage.toFixed(2)}% soit {item.amount.toFixed(2)}€
                </span>
              </div>
              <Bar
                percentage={item.percentage}
                color={COLORS_VALUES[idx % COLORS_VALUES.length]}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
