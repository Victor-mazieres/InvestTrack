import React from "react";

/**
 * Yes/No pill selector
 * value: boolean | null  (null = rien choisi)
 * onChange: (boolean) => void
 */
export default function FurnishedTogglePro({ value = null, onChange, className = "" }) {
  const isYes = value === true;
  const isNo  = value === false;

  return (
    <div className={`inline-flex flex-col items-start gap-2 ${className}`}>
        
       {/* Libellé d'état sous le sélecteur */}
      <div className="mt-1 text-sm">
        {value === null && (
          <span className="text-gray-400">Type de location : <b className="text-gray-300">Non renseigné</b></span>
        )}
        {value === true && (
          <span className="text-green-400">Type de location : <b className="text-green-300">Meublé</b></span>
        )}
        {value === false && (
          <span className="text-gray-200">Type de location : <b className="text-gray-100">Non meublé</b></span>
        )}
      </div>

      <div className="inline-flex rounded-full p-1 bg-gray-800/70 border border-white/10 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            "px-6 h-10 text-[16px] rounded-full transition",
            isNo
              ? "bg-gray-700 text-white shadow"
              : "text-gray-300 hover:text-gray-100"
          ].join(" ")}
          aria-pressed={isNo}
        >
          Non
        </button>

        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            "px-6 h-10 text-[16px] rounded-full transition",
            isYes
              ? "bg-green-500 text-white shadow"
              : "text-gray-300 hover:text-gray-100"
          ].join(" ")}
          aria-pressed={isYes}
        >
          Oui
        </button>
      </div>

     
    </div>
  );
}
