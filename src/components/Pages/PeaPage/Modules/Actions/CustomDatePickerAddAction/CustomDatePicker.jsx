import React, { useState } from "react";
import ThemedDatePicker from "./ThemedDatePicker";

export default function CustomDatePicker({ selected, onChange, placeholderText, className }) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (date) => {
    onChange(date);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className={`${className} cursor-pointer`} // Ajout de cursor-pointer
        placeholder={placeholderText}
        value={selected ? selected.toLocaleDateString() : ""}
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