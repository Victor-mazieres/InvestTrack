// src/components/BottomNav.jsx
import { Home, LineChart, Building2, Calculator, User } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();
  const tabs = [
    { path: "/dashboard", Icon: Home },
    { path: "/pea", Icon: LineChart },
    { path: "/immobilier", Icon: Building2 },
    { path: "/calcul", Icon: Calculator, isModal: true },
    { path: "/profile", Icon: User },
  ];
  const activeIndex = tabs.findIndex(tab => location.pathname === tab.path);

  // --- paramètres du notch ---
  const radius = 32; // rayon de la bulle en px
  const centerPct = activeIndex * 20 + 10; // centre en % (chaque onglet = 20%)

  // gradient radial : transparent au centre, opaque autour
  const maskImage = `radial-gradient(
    circle ${radius}px at ${centerPct}% 0px,
    transparent ${radius}px,
    #000 ${radius + 1}px
  )`;

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 bg-white rounded-t-xl shadow-inner py-5 grid grid-cols-5 overflow-visible"
    >
      {/* 1) Fond de la barre avec notch */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "top center",
          maskPosition: "top center",
        }}
      />

      {/* 2) Bulle animée (au-dessus du fond) */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute h-16 w-16 bg-white rounded-full shadow-md"
          initial={false}
          animate={{ left: `calc(${centerPct}% )`, x: "-50%" }}
          style={{ top: -24, zIndex: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* 3) Icônes */}
      {tabs.map((tab, idx) => {
        const linkProps = tab.isModal
          ? { to: tab.path, state: { background: location }, as: Link }
          : { to: tab.path, as: NavLink };

        return (
          <NavLink
            {...linkProps}
            key={tab.path}
            className={({ isActive }) =>
              `flex justify-center items-center relative z-20 transition-colors ${
                isActive ? "text-primary" : "text-gray-400"
              }`
            }
          >
            <motion.div
              whileHover={{ scale: 1.3 }}
              animate={{
                scale: activeIndex === idx ? 1.5 : 1,
                y: activeIndex === idx ? -26 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <tab.Icon size={28} />
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
}
