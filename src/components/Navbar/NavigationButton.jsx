// src/components/BottomNav.jsx
import React, { useMemo } from "react";
import { Home, Building2, Calculator, User, Wrench } from "lucide-react"; // <- maj icônes
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

/** Onglets par défaut (réordonnés) */
const TAB_CONFIG = [
  { path: "/outils",     Icon: Wrench,     label: "Outils" },
  { path: "/calcul",     Icon: Calculator, label: "Calculette", isModal: true },
  { path: "/dashboard",  Icon: Home,       label: "Dashboard" },
  { path: "/immobilier", Icon: Building2,  label: "Biens " },
  { path: "/profile",    Icon: User,       label: "Profil" },
];

function getActiveIndex(tabs, pathname) {
  const exactIdx = tabs.findIndex(t => pathname === t.path);
  if (exactIdx >= 0) return exactIdx;
  const startsIdx = tabs.findIndex(t => pathname.startsWith(t.path));
  return startsIdx >= 0 ? startsIdx : 0;
}

export default React.memo(function BottomNav({ tabs = TAB_CONFIG }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const activeIndex = useMemo(
    () => getActiveIndex(tabs, location.pathname),
    [tabs, location.pathname]
  );

  const cellWidthPct = 100 / Math.max(1, tabs.length);
  const indicatorLeftPct = activeIndex * cellWidthPct;

  const transition = reduceMotion
    ? { type: "tween", duration: 0 }
    : { type: "spring", stiffness: 320, damping: 28, mass: 0.8 };

  return (
    <nav
      role="tablist"
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      <div
        className="relative bg-white border-t border-slate-200"
        style={{ height: 64 }}
      >
        {/* Indicateur fin et discret (barre) */}
        {tabs.length > 0 && (
          <motion.span
            aria-hidden="true"
            className="absolute top-0 h-0.5 bg-slate-900"
            style={{ width: `${cellWidthPct}%`, left: 0 }}
            initial={false}
            animate={{ left: `${indicatorLeftPct}%` }}
            transition={transition}
          />
        )}

        {/* Grille des onglets */}
        <ul
          className="grid h-full"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        >
          {tabs.map((tab) => {
            const baseProps = tab.isModal
              ? { to: tab.path, state: { background: location } }
              : { to: tab.path };

            return (
              <li key={tab.path} className="h-full">
                <NavLink
                  {...baseProps}
                  role="tab"
                  aria-label={tab.label}
                  className={({ isActive }) =>
                    [
                      "flex h-full flex-col items-center justify-center gap-1 transition-colors",
                      isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700",
                    ].join(" ")
                  }
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {({ isActive }) => (
                    <>
                      <tab.Icon
                        size={24}
                        aria-hidden="true"
                        focusable="false"
                        className={isActive ? "scale-105" : "scale-100"}
                      />
                      <span className="text-[11px] leading-none font-medium">
                        {tab.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
});
