// src/routes.js
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy loaded pages
const PeaPage = lazy(() => import("../Pages/PeaPage/PeaPage"));
const ImmobilierPage = lazy(() => import("../Pages/ImmobilierPage/ImmobilierPage"));
const MoreActions = lazy(() => import("../Pages/PeaPage/Modules/Actions/MoreActions"));
const ProfilePage = lazy(() => import("../Pages/Profile/ProfilePage"));
const Profile = lazy(() => import("../Pages/Profile/Modules/Profile"));
const LoginPinPage = lazy(() => import("../Pages/ConnexionPage/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../Pages/ConnexionPage/RegisterPage/RegisterPage"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const SavedCalculations = lazy(() => import("../Pages/CalculatorCredit/SavedCalculations"));
const CalculationDetails = lazy(() => import("../Pages/CalculatorCredit/CalculationDetails"));

// Error Pages
const NotFoundPage = lazy(() => import("../Pages/Errors/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../Pages/Errors/UnauthorizedPage"));
const InternalServerError = lazy(() => import("../Pages/Errors/InternalServerError"));

export const mainRoutes = [
  { path: "/", element: <Navigate to="/connexion" replace /> },
  { path: "/pea", element: <PeaPage /> },
  { path: "/immobilier", element: <ImmobilierPage /> },
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
  { path: "/401", element: <UnauthorizedPage /> },
  { path: "/500", element: <InternalServerError /> },
  { path: "*", element: <NotFoundPage /> },
];
