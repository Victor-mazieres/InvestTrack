// src/components/ui/PrimaryButton.jsx
import React from "react";

export default function PrimaryButton({
  children,
  type = "button",
  className = "",
  fromColor = "from-greenLight",
  toColor = "to-checkgreen",
  hoverFrom = "hover:from-checkgreen",
  hoverTo = "hover:to-greenLight",
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        "relative px-6 py-3 rounded-3xl font-medium text-white",
        // dégradé dynamique
        `bg-gradient-to-b ${fromColor} ${toColor}`,
        // profondeur
        "shadow-md",
        // hover dynamique
        `${hoverFrom} ${hoverTo} hover:shadow-lg`,
        // focus
        "focus:ring-2 focus:ring-offset-2 focus:shadow-xl",
        "focus:ring-greenLight/60 focus:ring-offset-gray-900",
        // transition
        "transition duration-200 ease-out",
        "focus-visible:outline-none",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="relative z-10">{children}</span>

      {/* Ombre intérieure en bas */}
      <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-black/20 blur-[2px]" />
    </button>
  );
}
