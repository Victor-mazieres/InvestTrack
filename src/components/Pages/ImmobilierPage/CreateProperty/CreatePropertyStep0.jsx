// src/pages/CreatePropertyStep0.jsx
import React from "react";
import { ArrowLeft, Plus } from "lucide-react";


export default function CreatePropertyStep0({ onBack, onChoose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Bouton retour en haut-gauche */}
      <button
        onClick={onBack}
        className="absolute top-10 left-4 p-2 bg-gray-800/80 border border-gray-700 rounded-full shadow-md hover:bg-checkgreen transition"
        aria-label="Retour"
      >
        <ArrowLeft className="w-6 h-6 text-greenLight" />
      </button>

      {/* Contenu centré */}
      <div className="h-full w-full flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 text-center mb-8">
            Choisissez le type de projet
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Achat / Revente (AV) */}
            <button
              onClick={() => onChoose('AV')}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg hover:scale-[1.03] hover:shadow-xl transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-greenLight/10 mb-3">
                <Plus className="w-6 h-6 text-greenLight" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Achat / Revente</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Acquisition et revente</p>
            </button>

            {/* Location longue durée (LLD) */}
            <button
              onClick={() => onChoose('LLD')}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg hover:scale-[1.03] hover:shadow-xl transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 mb-3">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Location longue durée</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Mise en location à l'année</p>
            </button>

            {/* Location courte durée (LCD) */}
            <button
              onClick={() => onChoose('LCD')}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg hover:scale-[1.03] hover:shadow-xl transition col-span-2 sm:col-span-1"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500/10 mb-3">
                <Plus className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Location courte durée</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Type Airbnb / Booking</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
