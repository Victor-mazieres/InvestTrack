// src/components/Pages/Dashboard/Modules/DividendDetails.jsx
import React from "react";
import { Pencil, Trash, PlusCircle } from "lucide-react";
import { format, parse } from "date-fns";

// Fonction utilitaire pour formater une date en "dd/MM/yyyy"
function formatIsoDate(dateString) {
  if (!dateString) return "Non défini";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

export default function DividendDetails({
  action,
  deleteDividend,
  setIsEditingDividend,
  setIsAddDividendModalOpen,
}) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 mb-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Dividendes</h2>
      {action.dividendsHistory && action.dividendsHistory.length > 0 ? (
        <div className="space-y-4">
          {action.dividendsHistory.map((div, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-lg font-bold text-primary">
                  {div.date ? formatIsoDate(div.date) : "Non défini"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Dividende</span>
                <span className="text-lg font-bold text-greenLight">
                  {div.amount}€
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => deleteDividend(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
                <button
                  onClick={() => setIsEditingDividend(true)}
                  className="text-primary hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Aucun dividende enregistré.</p>
      )}
      <button
        onClick={() => setIsAddDividendModalOpen(true)}
        className="w-full bg-primary text-white p-2 rounded-2xl mt-4 flex items-center justify-center"
      >
        <PlusCircle className="w-5 h-5 mr-2" /> Ajouter un dividende
      </button>
    </div>
  );
}
