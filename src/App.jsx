// src/App.jsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Utils
import ScrollToTop from './components/Utils/ScrollToTop';

// Composants standards
import Navbar from './components/Navbar/Navbar';
import NavigationButton from './components/Navbar/NavigationButton';

// Hook swipe
import useSwipeNavigation from './components/App/useSwipeNavigation';

// Routes
import { mainRoutes } from './components/Navbar/routes';
import { modalRoutes } from './components/App/modalRoutes';

// Error Boundary
import GeneralErrorBoundary from './components/App/GeneralErrorBoundary';

// Actions Context
import { ActionsProvider } from './components/Pages/PeaPage/Modules/Reutilisable/ActionsContext';

// PWA install prompt hook
import usePWAInstallPrompt from './components/Utils/usePWAInstallPrompt';

// Fallback skeleton optimisé
const LoadingSkeleton = React.memo(() => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <Skeleton height={40} width={300} />
    <div className="w-full mt-4">
      <Skeleton count={5} />
    </div>
  </div>
));

// Props d'animation Framer Motion
const pageAnimationProps = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const modalAnimationProps = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  content: {
    initial: { y: '100%' },
    animate: { y: '1%' },
    exit: { y: '100%' },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Modal wrapper
const ModalWrapper = React.memo(({ children, onClose }) => {
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 150) onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black bg-opacity-40"
      {...modalAnimationProps.overlay}
      onClick={onClose}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-[#303A49] rounded-t-3xl shadow-lg overflow-visible"
        style={{ height: '99vh' }}
        {...modalAnimationProps.content}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full pointer-events-none" />
        <div className="h-full w-full overflow-y-auto pb-20 pt-8">{children}</div>
      </motion.div>
    </motion.div>
  );
});
ModalWrapper.displayName = 'ModalWrapper';

// Routes modales
const ModalRoutes = ({ location }) => {
  const navigate = useNavigate();
  const handleClose = () => navigate(-1);

  return (
    <AnimatePresence>
      <GeneralErrorBoundary fallback={<div className="text-red-500 p-4">Une erreur est survenue.</div>}>
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes location={location}>
            {modalRoutes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ModalWrapper onClose={handleClose}>
                    <Component />
                  </ModalWrapper>
                }
              />
            ))}
          </Routes>
        </Suspense>
      </GeneralErrorBoundary>
    </AnimatePresence>
  );
};

// Contenu principal avec swipe
const MainContent = React.memo(({ location }) => {
  // Exclure les pages d'authentification du swipe
  const authPaths = ['/connexion', '/inscription'];
  const isAuthPage = authPaths.includes(location.pathname);
  const pages = ['/pea', '/immobilier', '/MoreActions'];
  const swipeHandlers = isAuthPage ? {} : useSwipeNavigation(pages, location.pathname);

  return (
    <div {...swipeHandlers} className="h-full flex flex-col overflow-hidden pt-16 pb-20">
      <AnimatePresence mode="wait">
        <GeneralErrorBoundary key={location.pathname}>
          <Suspense fallback={<LoadingSkeleton />}>
            <motion.div key={location.pathname} {...pageAnimationProps}>
              <Routes location={location}>
                {mainRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Routes>
            </motion.div>
          </Suspense>
        </GeneralErrorBoundary>
      </AnimatePresence>
    </div>
  );
});
MainContent.displayName = 'MainContent';

// Gestion de l'authentification expirée
const AuthenticationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !['/connexion', '/inscription'].includes(location.pathname)) {
      navigate('/connexion', { replace: true });
    }
  }, [navigate, location]);

  useEffect(() => {
    const logout = () => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/connexion', { replace: true });
    };

    window.addEventListener('sessionExpired', logout);
    return () => window.removeEventListener('sessionExpired', logout);
  }, [navigate]);

  return null;
};

// Contenu de l'application
function AppContent() {
  const location = useLocation();
  const background = location.state?.background;
  const hideAuth = ['/connexion', '/inscription'].includes(location.pathname);
  const [emailVerified, setEmailVerified] = useState(
    localStorage.getItem('emailVerified') === 'true'
  );
  const [showInstallBtn, promptInstall] = usePWAInstallPrompt();

  return (
    <>
      <AuthenticationHandler />

      {!hideAuth && emailVerified && showInstallBtn && (
        <button
          onClick={promptInstall}
          className="fixed bottom-4 right-4 p-3 bg-greenLight text-white rounded-2xl shadow-lg hover:bg-checkgreen transition z-50"
        >
          Installer InvestTrack
        </button>
      )}

      {hideAuth ? (
        <>
          <MainContent location={background || location} />
          {background && <ModalRoutes location={location} />}
        </>
      ) : (
        <ActionsProvider>
          <MainContent location={background || location} />
          {background && <ModalRoutes location={location} />}
          <NavigationButton />
          <Navbar />
        </ActionsProvider>
      )}
    </>
  );
}

// Application principale
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <GeneralErrorBoundary>
        <AppContent />
      </GeneralErrorBoundary>
    </Router>
  );
}
