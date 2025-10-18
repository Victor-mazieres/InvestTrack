// src/Pages/Tools/OutilsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

/* -- Card réutilisable (style aligné avec ton Dashboard) -- */
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
        "relative rounded-3xl overflow-hidden p-4",
        "bg-gradient-to-br from-[#111821] via-[#0f1620] to-[#0b1118]",
        "border border-white/10",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/15",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/40",
        shadow,
        "ring-1 ring-black/10",
        interactive && "transition-transform duration-200 will-change-transform hover:-translate-y-[2px]",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_60%)]" />
      {children}
    </div>
  );
}

export default function OutilsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050a0f] bg-[radial-gradient(1200px_600px_at_-10%_-10%,rgba(57,217,138,0.06),transparent_60%),radial-gradient(900px_500px_at_110%_110%,rgba(57,217,138,0.04),transparent_60%)]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-4 pt-6 pb-2"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Boîte à outils</h1>
        <p className="text-sm text-gray-400 mt-1">Accès rapide à vos calculateurs et assistants</p>
      </motion.header>

      {/* Grille d’outils */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
        {/* Optimiseur d’épargne */}
        <motion.button
          type="button"
          onClick={() => navigate("/budget-optimizer")}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="group aspect-square w-full text-left"
          aria-label="Ouvrir l’optimiseur d’épargne"
        >
          <Card interactive elevation="md" className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0a1016]/70 border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <BanknotesIcon className="h-7 w-7 text-[#39d98a]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Optimiseur d’épargne</p>
                <p className="text-xs text-gray-400 mt-0.5">Salaire • Fixes • Dépenses</p>
              </div>
            </div>
          </Card>
        </motion.button>

        {/* Salaire + TMI */}
        <motion.button
          type="button"
          onClick={() => navigate("/TMI")}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="group aspect-square w-full text-left"
          aria-label="Ouvrir Salaire + TMI"
        >
          <Card interactive elevation="md" className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0a1016]/70 border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <CalculatorIcon className="h-7 w-7 text-[#39d98a]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Salaire + TMI</p>
                <p className="text-xs text-gray-400 mt-0.5">Stockage • Calcul TMI</p>
              </div>
            </div>
          </Card>
        </motion.button>

        {/* 👉 Tu peux ajouter d'autres tuiles ici au fur et à mesure */}
        {/* <motion.button ...> ... </motion.button> */}
      </div>
    </div>
  );
}
