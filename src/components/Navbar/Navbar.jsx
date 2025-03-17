import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Liste des pages où le swipe est autorisé
  const pages = ["/pea", "/immobilier"];
  const currentIndex = pages.indexOf(location.pathname);

  const handleSwipe = (direction) => {
    // Vérifie si la page actuelle permet le swipe
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= pages.length) newIndex = pages.length - 1;
    navigate(pages[newIndex]);
  };

  return (
    <nav className="bg-primary backdrop-blur-md p-4 fixed top-0 w-full z-20 flex justify-between items-center shadow-lg rounded-b-2xl">
      {/* Onglets Swippables - Alignés avec plus d'espacement */}
      <motion.div
        className="flex w-full justify-around text-white text-lg font-semibold relative px-6"
        drag={currentIndex !== -1 ? "x" : false} // Désactive le drag si on est pas sur PEA/Immo
        dragConstraints={{ left: -50, right: 50 }}
        onDragEnd={(event, info) => {
          if (currentIndex !== -1) {
            if (info.offset.x > 50) handleSwipe(-1);
            if (info.offset.x < -50) handleSwipe(1);
          }
        }}
      >
        <div className="relative">
          <button
            className={`relative transition-transform duration-300 ${
              location.pathname === "/pea" ? "scale-110 font-bold text-white" : "scale-100 text-white/60"
            }`}
            onClick={() => navigate("/pea")}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              padding: 0,
            }}
          >
            PEA
          </button>
          {location.pathname === "/pea" && (
            <motion.div
              layoutId="underline"
              className="absolute left-0 right-0 mx-auto bottom-[-4px] h-[4px] bg-greenLight rounded-full"
              animate={{ width: "120%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="h-6 w-[2px] bg-greenLight/50 mx-4"></div>

        <div className="relative">
          <button
            className={`relative transition-transform duration-300 ${
              location.pathname === "/immobilier" ? "scale-110 font-bold text-white" : "scale-100 text-white/60"
            }`}
            onClick={() => navigate("/immobilier")}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              padding: 0,
            }}
          >
            IMMOBILIER
          </button>
          {location.pathname === "/immobilier" && (
            <motion.div
              layoutId="underline"
              className="absolute left-0 right-0 mx-auto bottom-[-4px] h-[4px] bg-greenLight rounded-full"
              animate={{ width: "120%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>
    </nav>
  );
}
