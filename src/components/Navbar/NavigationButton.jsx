import { useState, useEffect } from "react";
import { Home, LineChart, Building2, Calculator, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".floating-menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Positions des bulles pour un bon équilibre
  const bubbles = [
    { icon: <Home size={24} />, path: "/", x: -100, y: -40 },
    { icon: <LineChart size={24} />, path: "/pea", x: -75, y: -115 },
    { icon: <Building2 size={24} />, path: "/immobilier", x: 0, y: -150 },
    { icon: <Calculator size={24} />, path: "/calcul", x: 75, y: -115 },
    { icon: <User size={24} />, path: "/profile", x: 100, y: -40 },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 floating-menu-container">
      {/* Effet de flou dégradé plus subtil */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
        >
          <div className="absolute w-[450px] h-[450px] rounded-full"></div>
        </motion.div>
      )}

      {/* Bulles animées */}
      <div className="relative flex items-center justify-center z-50">
        {isOpen &&
          bubbles.map((bubble, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (bubble.path === "/calcul") {
                  // Navigation en modal en passant la location actuelle comme background
                  navigate(bubble.path, { state: { background: location } });
                } else {
                  navigate(bubble.path);
                }
                setIsOpen(false);
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0,
                x: isOpen ? bubble.x : 0,
                y: isOpen ? bubble.y : 0,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="absolute w-16 h-16 bg-primary shadow-lg rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              {bubble.icon}
            </motion.button>
          ))}

        {/* Bouton central */}
        <button
          onClick={toggleMenu}
          className="w-16 h-16 bg-primary text-white shadow-xl rounded-full flex items-center justify-center relative z-50"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
            <Plus size={38} />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
