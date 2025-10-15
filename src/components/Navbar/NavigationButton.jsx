// src/components/BottomNav.jsx
import React, { useMemo } from "react";
import { Home, LineChart, Building2, Calculator, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

// Option: exporte TAB_CONFIG pour le réutiliser ailleurs/tests
const TAB_CONFIG = [
  { path: "/dashboard",  Icon: Home,       label: "Dashboard" },
  { path: "/pea",        Icon: LineChart,  label: "PEA" },
  { path: "/immobilier", Icon: Building2,  label: "Immobilier" },
  { path: "/calcul",     Icon: Calculator, label: "Calcul", isModal: true },
  { path: "/profile",    Icon: User,       label: "Profil" },
];

function getActiveIndex(tabs, pathname) {
  // stricte égalité ; si tu veux activer pour /immobilier/xxx => utilise startsWith
  const idx = tabs.findIndex(t => pathname === t.path);
  return idx >= 0 ? idx : 0;
}

export default React.memo(function BottomNav({ tabs = TAB_CONFIG }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const activeIndex = useMemo(
    () => getActiveIndex(tabs, location.pathname),
    [tabs, location.pathname]
  );

  // === Constantes UI (évite magic numbers) ===
  const RADIUS_PX = 30;      // rayon du notch et de la bulle
  const BUBBLE    = 64;      // diamètre visuel de la bulle
  const BAR_H     = 68;      // hauteur de barre
  const GAP_TOP   = 18;      // débordement vers le haut

  // centre de la cellule, générique (0.5 / n * 100, 1.5 / n * 100, etc.)
  const centerPct = useMemo(() => ((activeIndex + 0.5) / tabs.length) * 100, [activeIndex, tabs.length]);

  // Masque radial (compat WebKit + standard)
  const maskImage = useMemo(() => {
    const r = RADIUS_PX;
    return `radial-gradient(circle ${r}px at ${centerPct}% 0px, transparent ${r}px, #000 ${r + 0.5}px)`;
  }, [centerPct]);

  const spring = useMemo(
    () =>
      reduceMotion
        ? { type: "tween", duration: 0 } // désactive l’anim si l’utilisateur l’a demandé
        : { type: "spring", stiffness: 320, damping: 28, mass: 0.8 },
    [reduceMotion]
  );

  return (
    <nav
      role="tablist"
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 w-full z-50 bg-transparent"
      style={{
        // Safe area iOS
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          height: BAR_H,
        }}
      >
        {/* 1) Fond avec notch */}
        <div
          className="absolute inset-0 bg-white rounded-t-xl shadow-inner"
          style={{
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "top center",
            maskPosition: "top center",
          }}
        />

        {/* 2) Bulle animée */}
        {tabs.length > 0 && (
          <motion.div
            className="absolute rounded-full bg-white shadow-md"
            style={{
              width: BUBBLE,
              height: BUBBLE,
              top: -GAP_TOP,
              left: 0,
              zIndex: 10,
            }}
            initial={false}
            animate={{ left: `calc(${centerPct}% )`, x: "-50%" }}
            transition={spring}
          />
        )}

        {/* 3) Icônes */}
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIndex;
          const baseProps = tab.isModal
            ? { to: tab.path, state: { background: location } }
            : { to: tab.path };

          return (
            <NavLink
              {...baseProps}
              key={tab.path}
              role="tab"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center justify-center relative z-20 transition-colors ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
              style={{ height: BAR_H }}
            >
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                animate={{
                  scale: isActive ? 1.4 : 1,
                  y: isActive ? -GAP_TOP : 0,
                }}
                transition={spring}
              >
                <tab.Icon size={26} aria-hidden="true" focusable="false" />
                <span className="sr-only">{tab.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
