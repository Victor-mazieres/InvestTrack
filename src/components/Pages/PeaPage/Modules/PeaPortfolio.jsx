import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, TrendingUp, PieChartIcon } from "lucide-react";
import PeaBars from "./Portfolio/PeaBars";
import PeaPie from "./Portfolio/PeaPie";

export default function PeaPortfolio() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chartMode, setChartMode] = useState("bars");

  const toggleChartMode = () => {
    setChartMode((prevMode) => (prevMode === "bars" ? "pie" : "bars"));
  };

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Répartitions des actions
        </h2>
        <button
          onClick={toggleChartMode}
          className="text-gray-600 hover:text-primary transition"
        >
          <PieChartIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Affichage conditionnel selon le mode */}
      {chartMode === "bars" ? <PeaBars /> : <PeaPie />}
    </div>
  );
}
