import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MortgageSimulator from "./CalculatorCredit";
import SavedCalculations from "./SavedCalculations";

export default function MortgageTabs() {
  const [activeTab, setActiveTab] = useState("simulation");
  const [direction, setDirection] = useState(1);

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === "saved" ? 1 : -1);
    setActiveTab(tab);
  };

  // Variants pour l'animation
  const variants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="max-w-xl mx-auto overflow-hidden">
        {/* Barre d’onglets */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => handleTabClick("simulation")}
            className={`
              flex-1 py-3 text-center font-medium focus:outline-none transition-colors duration-300
              ${activeTab === "simulation"
                ? "border-b-4 border-greenLight bg-gray-800 text-gray-100"
                : "border-b-4 border-transparent bg-gray-700 text-gray-400 hover:bg-gray-600"}
            `}
          >
            Simulation
          </button>
          <button
            onClick={() => handleTabClick("saved")}
            className={`
              flex-1 py-3 text-center font-medium focus:outline-none transition-colors duration-300
              ${activeTab === "saved"
                ? "border-b-4 border-greenLight bg-gray-800 text-gray-100"
                : "border-b-4 border-transparent bg-gray-700 text-gray-400 hover:bg-gray-600"}
            `}
          >
            Calculs Sauvegardés
          </button>
        </div>

        {/* Contenu avec animation */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            {activeTab === "simulation" ? (
              <motion.div
                key="simulation"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <MortgageSimulator />
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <SavedCalculations />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
