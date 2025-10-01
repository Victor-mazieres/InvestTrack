// src/PeaPage/Modules/Reutilisable/CustomSelect.jsx
import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Catégorie",
  className = "",
  dropdownClassName = "", // Surcharge possible depuis l'extérieur
  dropdownSize = "max-h-60", // Hauteur max par défaut
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (selected) => {
    onChange(selected);
    setIsOpen(false);
  };

  // Récupère le label correspondant à la valeur sélectionnée
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Bouton affichant la sélection */}
      <button
        type="button"
        onClick={toggleOpen}
        className={[
          "w-full px-4 py-3 rounded-3xl flex justify-between items-center",
          "bg-gray-800/95 border border-gray-700 text-gray-100",
          // profondeur de base
          "shadow-md",
          // halo + lift au focus
          "focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-gray-900",
          "focus:shadow-lg focus:-translate-y-[1px]",
          // transitions
          "transition duration-200 ease-out",
          "focus-visible:outline-none",
          className,
        ].join(" ")}
      >
        <span>{selectedLabel || placeholder}</span>
        <svg
          className="w-4 h-4 ml-2 text-gray-400 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Petit reflet haut comme pour FloatingInput */}
      <span className="pointer-events-none absolute inset-x-2 top-1 h-px rounded-full bg-white/5" />

      {/* Dropdown */}
      {isOpen && (
        <div
          className={[
            "absolute mt-1 left-0 right-0 w-full rounded-2xl border border-gray-700 bg-gray-800 shadow-xl z-10 overflow-y-auto",
            "transition-all duration-200",
            dropdownClassName,
            dropdownSize,
          ].join(" ")}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="px-4 py-3 hover:bg-gray-700/80 cursor-pointer transition rounded-xl"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
