// src/routes.js
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy loaded pages
const PeaPage = lazy(() => import("../Pages/PeaPage/PeaPage"));
const ImmobilierDashboard = lazy(() => import("../Pages/ImmobilierPage/ImmobilierDashboard"));
const MoreActions = lazy(() => import("../Pages/PeaPage/Modules/Actions/MoreActions"));
const ProfilePage = lazy(() => import("../Pages/Profile/ProfilePage"));
const Profile = lazy(() => import("../Pages/Profile/Modules/Profile"));
const LoginPinPage = lazy(() => import("../Pages/ConnexionPage/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../Pages/ConnexionPage/RegisterPage/RegisterPage"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const SavedCalculations = lazy(() => import("../Pages/CalculatorCredit/SavedCalculations"));
const CalculationDetails = lazy(() => import("../Pages/CalculatorCredit/CalculationDetails"));
const CreatePropertyStep1 = lazy(() => import("../Pages/ImmobilierPage/CreateProperty/CreatePropertyStep1"));
const CreatePropertyStep2 = lazy(() => import("../Pages/ImmobilierPage/CreateProperty/CreatePropertyStep2"));
const PropertyDetail = lazy(() => import("../Pages/ImmobilierPage/PropertyDetail/PropertyDetail"));
const CreateTenant = lazy(() => import("../Pages/ImmobilierPage/Tenant/CreateTenant/"));
const TenantDetails = lazy(() => import("../Pages/ImmobilierPage/Tenant/TenantDetails"));
const FinancialInfo = lazy (() => import("../Pages/ImmobilierPage/PropertyDetail/FinancialInfo/FinancialInfo"));
const DashboardImmobilierSelection = lazy(() => import('../Pages/Profile/Modules/SelectDashboardImmo'));
const BudgetOptimizer = lazy(() => import('../Pages/Dashboard/Modules/BudgetOptimizer/BudgetOptimizer'));
const PayslipsPage = lazy(() => import('../Pages/Dashboard/Modules/PayslipsPage/PayslipsPage'));

// Error Pages
const NotFoundPage = lazy(() => import("../Pages/Errors/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../Pages/Errors/UnauthorizedPage"));
const InternalServerError = lazy(() => import("../Pages/Errors/InternalServerError"));

export const mainRoutes = [
  { path: "/", element: <Navigate to="/connexion" replace /> },
  { path: "/pea", element: <PeaPage /> },
  { path: "/immobilier", element: <ImmobilierDashboard /> },
  { path: "/MoreActions", element: <MoreActions /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/info-profile", element: <Profile /> },
  { path: "/connexion", element: <LoginPinPage /> },
  { path: "/inscription", element: <RegisterPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/calculimmobilier", element: <SavedCalculations /> },
  { path: "/calculimmobilier/:timestamp", element: <SavedCalculations /> },
  { path: "/detailscalcul/:id", element: <CalculationDetails /> },
  { path: "/DetailPage/:id", element: <CalculationDetails /> },
  { path: "/nouveau-bien", element: <CreatePropertyStep1 /> },
  { path: "/nouveau-bien/etape-2", element: <CreatePropertyStep2 /> },
  { path: "/property/:id", element: <PropertyDetail />},
  { path: "/nouveau-locataire", element: <CreateTenant  />},
  { path: "/properties/:id/financial", element: <FinancialInfo /> },
  { path: "/locataire/:id", element: <TenantDetails />},
  { path: "/401", element: <UnauthorizedPage /> },
  { path: "/500", element: <InternalServerError /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "/dashboard-immobilier-selection", element: <DashboardImmobilierSelection /> },
  { path: "/budget-optimizer", element: <BudgetOptimizer /> },
  { path: "/TMI", element: <PayslipsPage /> },
  
];
