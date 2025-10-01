import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, PieChartIcon } from "lucide-react";
import PeaBars from "./Portfolio/PeaBars";
import PeaPie from "./Portfolio/PeaPie";
import { motion } from "framer-motion";

/* ----------- Card locale (même relief que les autres) ----------- */
function Card({ children, className = "", interactive = false, elevation = "md", ...rest }) {
  const shadow =
    elevation === "lg"
      ? "shadow-[0_22px_50px_-12px_rgba(0,0,0,0.8)]"
      : elevation === "sm"
      ? "shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
      : "shadow-[0_14px_34px_-12px_rgba(0,0,0,0.7)]";

  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-[#111821] via-[#0f1620] to-[#0b1118]",
        "border border-white/10",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/15",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/40",
        shadow,
        "ring-1 ring-black/10",
        interactive &&
          "transition-transform duration-200 will-change-transform hover:-translate-y-[2px]",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_60%)]" />
      {children}
    </div>
  );
}

/* ----------- Composant principal ----------- */
export default function PeaPortfolio() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chartMode, setChartMode] = useState("bars");

  const toggleChartMode = () => {
    setChartMode((prevMode) => (prevMode === "bars" ? "pie" : "bars"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <Card elevation="lg" className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-100" /> Répartition des actions
          </h2>
          <button
            onClick={toggleChartMode}
            className="text-gray-400 hover:text-gray-100 transition"
          >
            <PieChartIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Graph */}
        <div className="relative z-10">
          {chartMode === "bars" ? <PeaBars /> : <PeaPie />}
        </div>
      </Card>
    </motion.div>
  );
}
