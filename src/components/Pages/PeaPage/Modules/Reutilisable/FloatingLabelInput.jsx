import React, { useState } from "react";

export default function FloatingInput({ label, name, type = "text", value, onChange, ...rest }) {
  const [isFocused, setIsFocused] = useState(false);
  const showFloating = isFocused || value;

  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        className="w-full px-4 pt-6 pb-2 border border-gray-600 bg-gray-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gray-600 transition text-gray-100"
        {...rest}  // Transmission de toutes les props additionnels
      />
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          showFloating
            ? "top-1 text-xs font-medium text-gray-100"
            : "top-1/2 -translate-y-1/2 text-base text-gray-400"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
