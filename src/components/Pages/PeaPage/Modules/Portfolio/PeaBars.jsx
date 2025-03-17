import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Zap, Banknote, Car } from "lucide-react";

const dataSectors = [
  { label: "Services aux collectivités", percentage: 52.75, Icon: Building2 },
  { label: "Énergie", percentage: 23.88, Icon: Zap },
  { label: "Sociétés financières", percentage: 20.84, Icon: Banknote },
  { label: "Biens de consommation durables", percentage: 2.53, Icon: Car },
];

const dataValues = [
  { label: "ENGIE", percentage: 52.75, amount: 513.9 },
  { label: "TOTALENERGIES SE", percentage: 23.88, amount: 232.68 },
  { label: "CREDIT AGRICOLE S.A.", percentage: 13.24, amount: 129.04 },
  { label: "BNP PARIBAS ACTIONS A", percentage: 7.6, amount: 74.02 },
];

const COLORS_SECTORS = ["#1abc9c", "#f39c12", "#e74c3c", "#3498db"];
const COLORS_VALUES = ["#9b59b6", "#2ecc71", "#e67e22", "#34495e"];

export default function PeaBars({ onSectorClick, onValueClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Par défaut, si aucun onClick n'est passé, on navigue vers "/RepartitionBarre" avec le background
  const defaultSectorClick = () => {
    navigate("/RepartitionBarreSecteurs", { state: { background: location } });
  };
  const defaultValueClick = () => {
    navigate("/RepartitionBarreValeurs", { state: { background: location } });
  };

  const handleSectorClick = onSectorClick || defaultSectorClick;
  const handleValueClick = onValueClick || defaultValueClick;

  return (
    <div className="space-y-6">
      {/* Bloc Répartition par secteur */}
      <div
        onClick={handleSectorClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-gray-800 w-full text-left">Répartition par secteur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              handleSectorClick();
            }}
            className="text-sm text-gray-500 w-full text-right"
          >
            {dataSectors.length} / 5 affichées
          </p>
        </div>
        {dataSectors.map((item, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.03 }} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <item.Icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {item.percentage.toFixed(2)}%
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

      {/* Bloc Répartition par valeur */}
      <div
        onClick={handleValueClick}
        className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium  text-gray-800">Répartition par valeur</h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              handleValueClick();
            }}
            className="text-sm text-gray-500"
          >
            {dataValues.length} / 5 affichées
          </p>
        </div>
        {dataValues.map((item, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.03 }} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-700">
                {item.percentage.toFixed(2)}% soit {item.amount.toFixed(2)}€
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
      </div>
    </div>
  );
}
