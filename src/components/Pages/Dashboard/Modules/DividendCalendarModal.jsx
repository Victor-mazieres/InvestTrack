import React from "react";
import DividendCalendar from "./DividendCalendar";

export default function DividendCalendarModal({ dividends, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end backdrop-blur-sm bg-black bg-opacity-60">
      <style>
        {`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="w-full h-3/4 bg-gray-800 rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-100 transition z-10"
        >
          <span className="sr-only">Fermer</span>
          &#x2715;
        </button>
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="mt-6 text-2xl font-bold text-gray-100 text-center mb-4">
            Calendrier des Dividendes
          </h2>
          <DividendCalendar dividends={dividends} />
        </div>
      </div>
    </div>
  );
}
