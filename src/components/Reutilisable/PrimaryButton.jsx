import React from "react";

export default function PrimaryButton({
  children,
  type = "button",
  icon: Icon,
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  fromColor = "from-greenLight",
  toColor = "to-checkgreen",
  hoverFrom = "hover:from-checkgreen",
  hoverTo = "hover:to-greenLight",
  ...rest
}) {
  const sizeCls = {
    sm: "px-4 py-2 rounded-2xl text-sm gap-1",
    md: "px-6 py-3 rounded-3xl text-[15px] gap-2",
    lg: "px-7 py-3.5 rounded-3xl text-base gap-2.5",
  }[size];

  const base =
    "relative inline-flex items-center justify-center font-medium text-white " +
    `bg-gradient-to-b ${fromColor} ${toColor} ` +
    "shadow-md " +
    `${hoverFrom} ${hoverTo} hover:shadow-lg ` +
    "focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-gray-900 focus:shadow-xl " +
    "transition duration-200 ease-out focus-visible:outline-none";

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        base,
        sizeCls,
        isDisabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {/* Icône (optionnelle) */}
      {Icon && !loading && <Icon className="w-5 h-5" />}

      {/* Label */}
      <span className="relative z-10">{loading ? `${children}…` : children}</span>

      {/* Ombre intérieure en bas (relief) */}
      <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-black/20 blur-[2px]" />
    </button>
  );
}
