// src/PeaPage/Modules/Reutilisable/CustomSelect.jsx
import React, { useState, useEffect, useRef } from 'react';

const CustomSelect = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Catégorie",
  className = "",
  dropdownClassName = "",
  dropdownSize = "max-h-60" // Hauteur max par défaut
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
  const selectedLabel = options.find(option => option.value === value)?.label;

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton affichant la sélection */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full p-3 rounded-3xl flex justify-between items-center focus:outline-none ${className}`}
      >
        <span>{selectedLabel || placeholder}</span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute mt-1 rounded-3xl shadow-lg z-10 overflow-y-auto transition-all ${dropdownClassName} ${dropdownSize}`}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-3 hover:bg-gray-700 cursor-pointer rounded-3xl"
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
