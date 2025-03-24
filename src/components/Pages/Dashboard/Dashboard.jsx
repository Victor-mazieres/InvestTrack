// src/components/Pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import des composants
import TotalActions from "./Modules/TotalActions";
import NextDividend from "./Modules/NextDividend";
import DividendCalendar from "./Modules/DividendCalendar";
import DividendCalendarModal from "./Modules/DividendCalendarModal";
import EmailVerificationModal from "../ConnexionPage/EmailVerificationModal";

// Contexte pour les actions
import { ActionsContext } from "../PeaPage/Modules/Actions/ActionsContext";

// Données factices pour les graphiques
const dataPEA = [
  { name: "Jan", value: 1200 },
  { name: "Fév", value: 1600 },
  { name: "Mar", value: 900 },
  { name: "Avr", value: 1400 },
  { name: "Mai", value: 1800 },
];

const dataImmo = [
  { name: "Loyer", value: 65 },
  { name: "Charges", value: 20 },
  { name: "Taxes", value: 15 },
];

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1"];

// Hook personnalisé pour obtenir la largeur de la fenêtre
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768; // seuil pour mobile

  // Gestion de la vérification d'e-mail via modal
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const handleVerified = () => {
    localStorage.setItem("emailVerified", "true");
    setShowEmailVerification(false);
  };

  // État pour l'ouverture de la modale du calendrier (sur mobile)
  const [modalOpen, setModalOpen] = useState(false);
  // État pour les événements de dividendes : { date: Date, amount: Number, name: String }
  const [dividendEvents, setDividendEvents] = useState([]);

  // Utilisation du contexte pour récupérer les actions
  const { actions, fetchActions } = useContext(ActionsContext);

  // Vérifier si un email a déjà été validé
  useEffect(() => {
    const verified = localStorage.getItem("emailVerified");
    if (verified !== "true") {
      setShowEmailVerification(true);
    }
  }, []);

  // Charger les actions si elles ne sont pas déjà présentes
  useEffect(() => {
    if (actions.length === 0) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  // Préparation des données pour les dividendes
  useEffect(() => {
    if (actions.length > 0) {
      let events = [];
      actions.forEach((action) => {
        // Déterminer le nombre total d'actions (via l'historique ou la propriété 'quantity')
        const totalQuantity =
          action.history && action.history.length > 0
            ? action.history.reduce((sum, a) => sum + a.quantity, 0)
            : action.quantity || 1;
        // Extraction depuis l'historique des dividendes
        if (action.dividendsHistory && Array.isArray(action.dividendsHistory)) {
          action.dividendsHistory.forEach((div) => {
            if (div.date && div.amount) {
              const d = new Date(div.date);
              const normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              events.push({
                date: normalizedDate,
                amount: Number(div.amount) * totalQuantity,
                name: action.name,
              });
            }
          });
        }
        // Extraction du dividende principal défini dans la fiche de détail
        if (action.dividendDate && action.dividendPrice) {
          const d = new Date(action.dividendDate);
          const normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          events.push({
            date: normalizedDate,
            amount: Number(action.dividendPrice) * totalQuantity,
            name: action.name,
          });
        }
      });
      setDividendEvents(events);
    }
  }, [actions]);

  return (
    <div className="flex flex-col items-center p-4 bg-light min-h-screen pt-16">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      </header>

      {/* Graphique de performance du PEA */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-secondary">Performance PEA</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataPEA}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="value" stroke="#2e8e97" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grille avec TotalActions, NextDividend et Calendrier Dividende */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <TotalActions />
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <NextDividend />
        </div>
        {isMobile ? (
          // Sur mobile : bouton ouvrant la modale du calendrier
          <div
            className="col-span-2 bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <h3 className="text-md font-semibold text-gray-800">Calendrier dividende</h3>
            <p className="text-sm text-gray-600">Cliquez pour ouvrir</p>
          </div>
        ) : (
          // Sur desktop : affichage direct du calendrier
          <div className="col-span-2 bg-white p-4 rounded-3xl shadow-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Calendrier dividende</h3>
            <DividendCalendar dividends={dividendEvents} />
          </div>
        )}
      </div>

      {/* Graphique de répartition immobilière */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-secondary">Répartition Immobilière</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dataImmo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {dataImmo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Modal de vérification d'e-mail */}
      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={handleVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal pour le calendrier des dividendes (affiché uniquement sur mobile) */}
      {isMobile && modalOpen && (
        <DividendCalendarModal dividends={dividendEvents} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
