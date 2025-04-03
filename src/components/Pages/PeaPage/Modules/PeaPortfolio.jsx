import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, PieChartIcon } from "lucide-react";
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
      className="space-y-6 p-4 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between p-3">
        <h2 className="text-lg font-bold text-gray-100 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-gray-100" /> Répartitions des actions
        </h2>
        <button
          onClick={toggleChartMode}
          className="text-gray-400 hover:text-gray-100 transition"
        >
          <PieChartIcon className="w-5 h-5 mr-2" />
        </button>
      </div>
      {chartMode === "bars" ? <PeaBars /> : <PeaPie />}
    </motion.div>
  );
}
