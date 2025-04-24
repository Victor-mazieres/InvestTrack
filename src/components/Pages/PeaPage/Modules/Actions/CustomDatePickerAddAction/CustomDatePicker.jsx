import React, { useState } from "react";
import ThemedDatePicker from "./ThemedDatePicker";

export default function CustomDatePicker({ selected, onChange, placeholderText, className }) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (date) => {
    onChange(date);
    setShowCalendar(false);
  };

  // Vérifie si "selected" est une instance valide de Date pour éviter l'erreur
  const formattedDate =
    selected && selected instanceof Date && !isNaN(selected)
      ? selected.toLocaleDateString()
      : "";

  return (
    <div className="relative">
      <input
        type="text"
        className={`${className} cursor-pointer px-4 py-3 border border-gray-600 bg-gray-800 rounded-3xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 transition`}
        placeholder={placeholderText}
        value={formattedDate}
        readOnly
        onClick={() => setShowCalendar(true)}
      />
      {showCalendar && (
        <ThemedDatePicker
          selectedDate={selected}
          onChange={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
