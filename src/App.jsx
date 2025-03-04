import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Navbar from "./components/Navbar/Navbar";
import NavigationButton from "./components/Navbar/NavigationButton";
import Dashboard from "./components/Pages/Dashboard/Dashboard";
import PeaPage from "./components/Pages/PeaPage/PeaPage";
import ImmobilierPage from "./components/Pages/ImmobilierPage/ImmobilierPage";
import MoreActions from "./components/Pages/PeaPage/MoreActions";
import DetailPage from "./components/Pages/PeaPage/DetailPage";
import DividendeDetailPage from "./components/Pages/PeaPage/Modules/DividendeDetailPage";
import HistoriqueOrderPage from "./components/Pages/PeaPage/HistoriqueOrderPage";
import CalculatorCredit from "./components/Pages/CalculatorCredit/CalculatorCredit";
import LoginPage from "./components/Pages/ConnexionPage/LoginPage/LoginPage";
import RegisterPage from "./components/Pages/ConnexionPage/RegisterPage/RegisterPage";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  // Vérifie si l'URL est "/connexion" ou "/inscription"
  const hideNav =
    location.pathname === "/connexion" || location.pathname === "/inscription";
  
  // Pour la gestion des modales, on récupère le background s'il existe
  const background = location.state?.detailBackground || location.state?.background;

  return (
    <>
      {/* Contenu principal */}
      <MainContent location={background || location} />
      
      {/* Routes modales affichées uniquement si un background est défini */}
      {background && (
        <AnimatePresence>
          <Routes location={location}>
            <Route
              path="/DetailPage/:id"
              element={
                <ModalWrapper onClose={() => navigate(-1)}>
                  <DetailPage />
                </ModalWrapper>
              }
            />
            <Route
              path="/HistoriqueOrderPage/:id"
              element={
                <ModalWrapper onClose={() => navigate(-1)}>
                  <HistoriqueOrderPage />
                </ModalWrapper>
              }
            />
            <Route
              path="/DividendeDetailPage/:id"
              element={
                <ModalWrapper onClose={() => navigate(-1)}>
                  <DividendeDetailPage />
                </ModalWrapper>
              }
            />
            <Route
              path="/calcul"
              element={
                <ModalWrapper onClose={() => navigate(-1)}>
                  <CalculatorCredit />
                </ModalWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      )}

      {/* Affiche Navbar et NavigationButton seulement si on n'est pas sur /connexion ou /inscription */}
      {!hideNav && (
        <>
          <NavigationButton />
          <Navbar />
        </>
      )}
    </>
  );
}

function MainContent({ location }) {
  const navigate = useNavigate();
  // Définition des pages pour le swipe
  const pages = ["/pea", "/immobilier", "/MoreActions"];
  const currentIndex = pages.indexOf(location.pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex !== -1 && currentIndex < pages.length - 1) {
        navigate(pages[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(pages[currentIndex - 1]);
      }
    },
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="mt-16 pb-20 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pea" element={<PeaPage />} />
            <Route path="/immobilier" element={<ImmobilierPage />} />
            <Route path="/MoreActions" element={<MoreActions />} />
            <Route path="/calcul" element={<CalculatorCredit />} />
            <Route path="/HistoriqueOrderPage/:id" element={<HistoriqueOrderPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ModalWrapper({ children, onClose }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClose}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg"
        style={{ height: "98vh" }}
        initial={{ y: "100%" }}
        animate={{ y: "2%" }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 150) {
            onClose();
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full z-20 pointer-events-none" />
        <div className="h-full w-full overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
