import React from "react";

export default function MonthPicker({
  value,                 // "YYYY-MM" (ex: "2025-09")
  onChange,              // (newValue: "YYYY-MM") => void
  min,                   // optionnel "YYYY-MM"
  max,                   // optionnel "YYYY-MM"
  className = "",
  label = "Mois",
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const now = new Date();
  const [year, setYear] = React.useState(
    value?.slice(0, 4) ? Number(value.slice(0, 4)) : now.getFullYear()
  );
  const selectedYear = value?.slice(0, 4) ? Number(value.slice(0, 4)) : null;
  const selectedMonth = value?.slice(5, 7) ? Number(value.slice(5, 7)) : null;

  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  // Helpers min/max
  const toNum = (ym) => (ym ? Number(ym.slice(0, 4)) * 100 + Number(ym.slice(5, 7)) : null);
  const minN = toNum(min);
  const maxN = toNum(max);

  const isDisabled = (y, m1to12) => {
    const n = y * 100 + m1to12;
    if (minN && n < minN) return true;
    if (maxN && n > maxN) return true;
    return false;
  };

  // Fermer au clic extérieur / Échap
  React.useEffect(() => {
    const onClick = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const apply = (y, m1to12) => {
    if (isDisabled(y, m1to12)) return;
    const mm = String(m1to12).padStart(2, "0");
    onChange?.(`${y}-${mm}`);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="truncate">
          {value ? `${months[Number(value.slice(5, 7)) - 1]} ${value.slice(0, 4)}` : "Choisir…"}
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" className="opacity-70">
          <path fill="currentColor" d="M5.5 7.5L10 12l4.5-4.5z" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sélecteur mois"
          className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-700 bg-gray-900/95 backdrop-blur p-3 shadow-xl"
        >
          {/* Header année */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="px-2 py-1 rounded-lg hover:bg-gray-800 text-gray-200"
              aria-label="Année précédente"
            >
              ‹
            </button>
            <div className="text-sm font-medium">{year}</div>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="px-2 py-1 rounded-lg hover:bg-gray-800 text-gray-200"
              aria-label="Année suivante"
            >
              ›
            </button>
          </div>

          {/* Grille mois */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {months.map((m, idx) => {
              const m1 = idx + 1;
              const disabled = isDisabled(year, m1);
              const isSelected = selectedYear === year && selectedMonth === m1;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => apply(year, m1)}
                  className={`h-10 rounded-xl text-sm
                    ${disabled ? "opacity-40 cursor-not-allowed border border-gray-800" : "hover:bg-gray-800 border border-gray-700"}
                    ${isSelected ? "bg-gray-700 text-white border-gray-600" : "text-gray-100 bg-gray-900"}
                  `}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Bouton fermer */}
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-sm hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
