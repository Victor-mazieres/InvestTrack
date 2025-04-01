// src/components/Pages/PeaPage/Modules/PeaPortfolio.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, TrendingUp, PieChartIcon } from "lucide-react";
import PeaBars from "./Portfolio/PeaBars";
import PeaPie from "./Portfolio/PeaPie";
import { motion } from "framer-motion";

export default function PeaPortfolio() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chartMode, setChartMode] = useState("bars");

  const toggleChartMode = () => {
    setChartMode((prevMode) => (prevMode === "bars" ? "pie" : "bars"));
  };

  return (
    <motion.div
      className="space-y-6 p-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between p-3 bg-white rounded-3xl shadow-lg">
        <h2 className="text-lg font-bold text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Répartitions des actions
        </h2>
        <button
          onClick={toggleChartMode}
          className="text-gray-600 hover:text-primary transition"
        >
          <PieChartIcon className="w-5 h-5 mr-2" />
        </button>
      </div>
      {chartMode === "bars" ? <PeaBars /> : <PeaPie />}
    </motion.div>
  );
}
