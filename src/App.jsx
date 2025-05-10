// src/App.jsx
import React, { lazy, Suspense, memo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Utils
import ScrollToTop from './components/Utils/ScrollToTop';

// Composants standards
import Navbar from './components/Navbar/Navbar';
import NavigationButton from './components/Navbar/NavigationButton';
import { ActionsProvider } from './components/Pages/PeaPage/Modules/Reutilisable/ActionsContext';

// Error Boundary
import GeneralErrorBoundary from './components/Pages/Errors/GeneralErrorBoundary';

// Hook swipe
import useSwipeNavigation from './components/hooks/useSwipeNavigation';

// Lazy-loaded modales et pages
const DetailPage            = lazy(() => import('./components/Pages/PeaPage/Modules/Actions/DetailPage'));
const DividendeDetailPage   = lazy(() => import('./components/Pages/PeaPage/Modules/Actions/DividendeDetailPage'));
const HistoriqueOrderPage   = lazy(() => import('./components/Pages/PeaPage/Modules/Actions/History/HistoriqueOrderPage'));
const MortgageTabs          = lazy(() => import('./components/Pages/CalculatorCredit/MortgageTabs'));
const PeaBarsSecteurs       = lazy(() => import('./components/Pages/PeaPage/Modules/Portfolio/PeaBarsSecteurs'));
const PeaBarsValeurs        = lazy(() => import('./components/Pages/PeaPage/Modules/Portfolio/PeaBarsValeurs'));
const PeaPieSecteurs        = lazy(() => import('./components/Pages/PeaPage/Modules/Portfolio/PeaPieSecteurs'));
const PeaPieValeurs         = lazy(() => import('./components/Pages/PeaPage/Modules/Portfolio/PeaPieValeurs'));
const CalculationDetails    = lazy(() => import('./components/Pages/CalculatorCredit/CalculationDetails'));
const DividendHistoryPage   = lazy(() => import('./components/Pages/PeaPage/Modules/Actions/History/DividendHistoryPage'));
const FinancialInfo         = lazy(() => import('./components/Pages/ImmobilierPage/PropertyDetail/FinancialInfo/FinancialInfo'));

// Routes principales
import { mainRoutes } from './components/Navbar/routes';

// Fallback skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Skeleton height={40} width={300} />
      <div className="w-full mt-4">
        <Skeleton count={5} />
      </div>
    </div>
  );
}

// Props d’animation Framer Motion
const animationProps = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit:    { x: '-100%', opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background;
  const hideNav = ['/connexion','/inscription'].includes(location.pathname);

  return (
    <>
      <GeneralErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <MainContent location={background || location} />
        </Suspense>
      </GeneralErrorBoundary>

      {background && (
        <AnimatePresence>
          <GeneralErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
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
                <Route
                  path="/information-financiere"
                  element={
                    <ModalWrapper onClose={() => navigate(-1)}>
                      <FinancialInfo />
                    </ModalWrapper>
                  }
                />
              </Routes>
            </Suspense>
          </GeneralErrorBoundary>
        </AnimatePresence>
      )}

      {!hideNav && (
        <>
          <NavigationButton />
          <MemoizedNavbar />
        </>
      )}
    </>
  );
}

function MainContent({ location }) {
  const pages = ['/pea','/immobilier','/MoreActions'];
  const swipeHandlers = useSwipeNavigation(pages, location.pathname);

  return (
    <div {...swipeHandlers} className="h-full flex flex-col overflow-hidden pt-16 pb-20">
      <AnimatePresence exitBeforeEnter>
        <Suspense fallback={<LoadingSkeleton />}>
          <motion.div {...animationProps}>
            <Routes location={location}>
              {mainRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Routes>
          </motion.div>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

function ModalWrapper({ children, onClose }) {
  return (
    <motion.div
      role="dialog" aria-modal="true"
      className="fixed inset-0 z-50 bg-black bg-opacity-40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-[#303A49] rounded-t-3xl shadow-lg overflow-visible"
        style={{ height: '99vh' }}
        initial={{ y: '100%' }} animate={{ y: '1%' }} exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(_, info) => info.offset.y > 150 && onClose()}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full pointer-events-none" />
        <div className="h-full w-full overflow-y-auto pb-14">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

const MemoizedNavbar = memo(Navbar);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <ActionsProvider>
        <AppContent />
      </ActionsProvider>
    </Router>
  );
}
