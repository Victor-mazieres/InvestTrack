// src/components/Navbar/modalRoutes.js
import { lazy } from 'react';

// Lazy-loaded modales
const DetailPage = lazy(() => import('../Pages/PeaPage/Modules/Actions/DetailPage'));
const DividendeDetailPage = lazy(() => import('../Pages/PeaPage/Modules/Actions/DividendeDetailPage'));
const HistoriqueOrderPage = lazy(() => import('../Pages/PeaPage/Modules/Actions/History/HistoriqueOrderPage'));
const MortgageTabs = lazy(() => import('../Pages/CalculatorCredit/MortgageTabs'));
const PeaBarsSecteurs = lazy(() => import('../Pages/PeaPage/Modules/Portfolio/PeaBarsSecteurs'));
const PeaBarsValeurs = lazy(() => import('../Pages/PeaPage/Modules/Portfolio/PeaBarsValeurs'));
const PeaPieSecteurs = lazy(() => import('../Pages/PeaPage/Modules/Portfolio/PeaPieSecteurs'));
const PeaPieValeurs = lazy(() => import('../Pages/PeaPage/Modules/Portfolio/PeaPieValeurs'));
const CalculationDetails = lazy(() => import('../Pages/CalculatorCredit/CalculationDetails'));
const DividendHistoryPage = lazy(() => import('../Pages/PeaPage/Modules/Actions/History/DividendHistoryPage'));
const FinancialInfo = lazy(() => import('../Pages/ImmobilierPage/PropertyDetail/FinancialInfo/FinancialInfo'));

// Configuration des routes modales
export const modalRoutes = [
  {
    path: '/DetailPage/:id',
    Component: DetailPage
  },
  {
    path: '/HistoriqueOrderPage/:id',
    Component: HistoriqueOrderPage
  },
  {
    path: '/DividendeDetailPage/:id',
    Component: DividendeDetailPage
  },
  {
    path: '/Calcul',
    Component: MortgageTabs
  },
  {
    path: '/RepartitionBarreSecteurs',
    Component: PeaBarsSecteurs
  },
  {
    path: '/RepartitionBarreValeurs',
    Component: PeaBarsValeurs
  },
  {
    path: '/RepartitionCamembertSecteurs',
    Component: PeaPieSecteurs
  },
  {
    path: '/RepartitionCamembertValeurs',
    Component: PeaPieValeurs
  },
  {
    path: '/detailscalcul/:id',
    Component: CalculationDetails
  },
  {
    path: '/HistoriqueDividendePage/:id',
    Component: DividendHistoryPage
  },
  {
    path: '/information-financiere',
    Component: FinancialInfo
  },

];