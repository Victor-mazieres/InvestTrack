// src/App.jsx
import React, { lazy, Suspense, memo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

// Composants standards
import Navbar from "./components/Navbar/Navbar";
import NavigationButton from "./components/Navbar/NavigationButton";
import Dashboard from "./components/Pages/Dashboard/Dashboard";
import PeaPage from "./components/Pages/PeaPage/PeaPage";
import ImmobilierPage from "./components/Pages/ImmobilierPage/ImmobilierPage";
import MoreActions from "./components/Pages/PeaPage/Modules/Actions/MoreActions";
import ProfilePage from "./components/Pages/Profile/ProfilePage";
import Profile from "./components/Pages/Profile/Modules/Profile";
import LoginPinPage from "./components/Pages/ConnexionPage/LoginPage/LoginPage";
import RegisterPage from "./components/Pages/ConnexionPage/RegisterPage/RegisterPage";

// Lazy Loading pour les modales (optimisation)
const DetailPage = lazy(() => import("./components/Pages/PeaPage/Modules/Actions/DetailPage"));
const DividendeDetailPage = lazy(() => import("./components/Pages/PeaPage/Modules/Actions/DividendeDetailPage"));
const HistoriqueOrderPage = lazy(() => import("./components/Pages/PeaPage/Modules/Actions/History/HistoriqueOrderPage"));
const CalculatorCredit = lazy(() => import("./components/Pages/CalculatorCredit/CalculatorCredit"));
const PeaPie = lazy(() => import("./components/Pages/PeaPage/Modules/Portfolio/PeaPie"));
const PeaBarsSecteurs = lazy(() => import("./components/Pages/PeaPage/Modules/Portfolio/PeaBarsSecteurs"));
const PeaBarsValeurs = lazy(() => import("./components/Pages/PeaPage/Modules/Portfolio/PeaBarsValeurs"));
const PeaPieSecteurs = lazy(() => import("./components/Pages/PeaPage/Modules/Portfolio/PeaPieSecteurs"));
const PeaPieValeurs = lazy(() => import("./components/Pages/PeaPage/Modules/Portfolio/PeaPieValeurs"));
const SavedCalculations = lazy(() => import("./components/Pages/CalculatorCredit/SavedCalculations"));
const CalculationDetails = lazy(() => import("./components/Pages/CalculatorCredit/CalculationDetails"));
const MortgageTabs  = lazy(() => import("./components/Pages/CalculatorCredit/MortgageTabs"));
const DividendHistoryPage  = lazy(() => import("./components/Pages/PeaPage/Modules/Actions/History/DividendHistoryPage"));

// Import du contexte pour les actions
import { ActionsProvider } from "./components/Pages/PeaPage/Modules/Actions/ActionsContext";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Si location.state.background existe, cela signifie qu'une modal est ouverte
  // et que l'on souhaite conserver l'affichage du contenu principal (ex. la page Pea).
  const background = location.state?.background;
  const hideNav = location.pathname === "/connexion" || location.pathname === "/inscription";

  return (
    <>
      {/* Toujours afficher le contenu principal en utilisant la location de background si présente */}
      <MainContent location={background || location} />

      {/* Affichage des modales uniquement si un background est défini */}
      {background && (
        <AnimatePresence>
          <Suspense fallback={<div>Chargement...</div>}>
            <Routes location={location}>
              <Route
                path="/DetailPage/:id"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <DetailPage />
                  </ModalWrapper>
                }
              />
              {/* Autres routes de modale... */}
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
                path="/Calcul"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <MortgageTabs />
                  </ModalWrapper>
                }
              />
              <Route
                path="/RepartitionBarreSecteurs"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <PeaBarsSecteurs />
                  </ModalWrapper>
                }
              />
              <Route
                path="/RepartitionBarreValeurs"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <PeaBarsValeurs />
                  </ModalWrapper>
                }
              />
              <Route
                path="/RepartitionCamembertSecteurs"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <PeaPieSecteurs />
                  </ModalWrapper>
                }
              />
              <Route
                path="/RepartitionCamembertValeurs"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <PeaPieValeurs />
                  </ModalWrapper>
                }
              />
              <Route
                path="/detailscalcul/:id"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <CalculationDetails />
                  </ModalWrapper>
                }
              />
              <Route
                path="/HistoriqueDividendePage/:id"
                element={
                  <ModalWrapper onClose={() => navigate(-1)}>
                    <DividendHistoryPage />
                  </ModalWrapper>
                }
              />

            </Routes>
          </Suspense>
        </AnimatePresence>
      )}

      {/* Navbar toujours affichée sauf sur les pages /connexion et /inscription */}
      {!hideNav && (
        <>
          <NavigationButton />
          <MemoizedNavbar />
        </>
      )}
    </>
  );
}


// Composant MainContent avec gestion du swipe et animation
function MainContent({ location }) {
  const navigate = useNavigate();
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
  const animationProps = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  return (
    <div {...handlers} className="h-full flex flex-col overflow-hidden pt-16">
      <AnimatePresence exitBeforeEnter>
        <motion.div {...animationProps}>
          <Routes location={location}>
            {/* Redirection par défaut vers la page de connexion */}
            <Route path="/" element={<Navigate to="/connexion" replace />} />
            <Route path="/pea" element={<PeaPage />} />
            <Route path="/immobilier" element={<ImmobilierPage />} />
            <Route path="/MoreActions" element={<MoreActions />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/info-profile" element={<Profile />} />
            <Route path="/RepartitionBarreSecteurs" element={<PeaBarsSecteurs />} />
            <Route path="/connexion" element={<LoginPinPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calculimmobilier" element={<SavedCalculations />} />
            <Route path="/calculimmobilier/:timestamp" element={<SavedCalculations />} />
            <Route path="/detailscalcul/:id" element={<CalculationDetails />} />
            <Route path="/DetailPage/:id" element={<DetailPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


// Composant ModalWrapper optimisé
function ModalWrapper({ children, onClose }) {
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
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
        style={{ height: "99vh" }}
        initial={{ y: "100%" }}
        animate={{ y: "1%" }}
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

// Optimisation de la Navbar
const MemoizedNavbar = memo(Navbar);

export default function App() {
  return (
    <Router>
      <ActionsProvider>
        <AppContent />
      </ActionsProvider>
    </Router>
  );
}
