// src/components/Pages/Dashboard/Modules/DividendCalendarModal.jsx
import React from "react";
import DividendCalendar from "./DividendCalendar";

export default function DividendCalendarModal({ dividends, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-60">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition z-10"
        >
          <span className="sr-only">Fermer</span>
          &#x2715;
        </button>
        <div className="bg-[#1f2b36] p-6">
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Calendrier des Dividendes
          </h2>
          <DividendCalendar dividends={dividends} />
        </div>
      </div>
    </div>
  );
}
