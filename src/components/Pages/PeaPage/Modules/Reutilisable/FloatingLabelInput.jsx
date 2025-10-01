import React, { useState } from "react";

export default function FloatingInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  className = "",
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);
  const showFloating = isFocused || !!value;

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
        className={[
          // base
          "w-full px-4 pt-6 pb-2 rounded-3xl text-gray-100",
          "bg-gray-800/95 border border-gray-700",
          // profondeur par défaut
          "shadow-md",
          // halo + léger lift au focus
          "focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-gray-900",
          "focus:shadow-lg focus:-translate-y-[1px]",
          // transitions fluides
          "transition duration-200 ease-out",
          // accessibilité
          "focus-visible:outline-none",
          className,
        ].join(" ")}
        {...rest}
      />

      <label
        htmlFor={name}
        className={[
          "absolute left-4 transition-all duration-200 pointer-events-none",
          showFloating
            ? "top-1 text-xs font-medium text-gray-100"
            : "top-1/2 -translate-y-1/2 text-base text-gray-400",
        ].join(" ")}
      >
        {label}
      </label>

      {/* Petit reflet haut pour accentuer la profondeur */}
      <span className="pointer-events-none absolute inset-x-2 top-1 h-px rounded-full bg-white/5" />
    </div>
  );
}
