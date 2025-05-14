// src/components/Dashboard.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import TotalActions from "./Modules/TotalActions";
import NextDividend from "./Modules/NextDividend";
import DividendCalendar from "./Modules/DividendCalendar";
import DividendCalendarModal from "./Modules/DividendCalendarModal";
import EmailVerificationModal from "../ConnexionPage/EmailVerificationModal";
import { ActionsContext } from "../PeaPage/Modules/Reutilisable/ActionsContext";

// Données simulées pour le graphique PEA
const dataPEA = [
  { name: "Jan", value: 1200 },
  { name: "Fév", value: 1600 },
  { name: "Mar", value: 900 },
  { name: "Avr", value: 1400 },
  { name: "Mai", value: 1800 },
];

// Données simulées pour la répartition immobilière
const dataImmo = [
  { name: "Loyer", value: 65 },
  { name: "Charges", value: 20 },
  { name: "Taxes", value: 15 },
];

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1"];

// Hook pour détecter si l'écran est mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

// Prépare la liste d'événements de dividendes
function getDividendEvents(actions) {
  const events = [];
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return events;
  }
  for (const action of actions) {
    const totalQuantity = action.history?.length
      ? action.history.reduce((sum, a) => sum + a.quantity, 0)
      : action.quantity || 1;

    // Extraction de l'historique des dividendes
    if (Array.isArray(action.dividendsHistory)) {
      for (const div of action.dividendsHistory) {
        if (div.date && div.amount) {
          const d = new Date(div.date);
          events.push({
            date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
            amount: Number(div.amount) * totalQuantity,
            name: action.name,
          });
        }
      }
    }
    // Extraction du dividende principal
    if (action.dividendDate && action.dividendPrice) {
      const d = new Date(action.dividendDate);
      events.push({
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        amount: Number(action.dividendPrice) * totalQuantity,
        name: action.name,
      });
    }
  }
  return events;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { actions, fetchActions } = useContext(ActionsContext);

  // États locaux
  const [profile, setProfile] = useState(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Chargement initial : data + profil utilisateur
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        await fetchActions();

        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("http://localhost:5000/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setProfile(userData);
            // Si pas d'email enregistré OU non vérifié → pop-up
            if (!userData.email || userData.emailVerified === false) {
              setShowEmailVerification(true);
            }
          } else if (response.status === 401) {
            // token invalide ou expiré
            localStorage.removeItem("token");
            navigate("/connexion");
          }
        } else {
          navigate("/connexion");
        }
      } catch (error) {
        console.error("Erreur dashboard :", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchActions, navigate]);

  // Filet de secours : garantir l'ouverture de la modal si besoin
  useEffect(() => {
    if (
      !isLoading &&
      profile &&
      (!profile.email || profile.emailVerified === false) &&
      !showEmailVerification
    ) {
      setShowEmailVerification(true);
    }
  }, [isLoading, profile, showEmailVerification]);

  // Préparer le calendrier des dividendes
  const dividendEvents = useMemo(() => getDividendEvents(actions), [actions]);

  // Quand l'utilisateur vérifie son e-mail
  const handleVerified = () => {
    setProfile((p) => ({ ...p, emailVerified: true }));
    setShowEmailVerification(false);
  };

  // Affichage loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900 min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-300">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen pt-16">
      {/* Header animé */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-between items-center mb-4 px-4"
      >
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
      </motion.header>

      {/* --- Performance PEA (chart en début) --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full mt-6 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl p-4 shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Performance PEA</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataPEA}>
            <XAxis dataKey="name" stroke="#bdced3" />
            <YAxis stroke="#bdced3" />
            <Tooltip contentStyle={{ backgroundColor: "#2e2e2e", color: "#fff" }} />
            <CartesianGrid stroke="#444" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="value" stroke="#2e8e97" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* TotalActions & NextDividend côte à côte */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl shadow-2xl"
        >
          <TotalActions />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl shadow-2xl"
        >
          <NextDividend />
        </motion.div>
      </div>

      {/* Calendrier des dividendes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mt-6"
      >
        {isMobile ? (
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 p-4 rounded-3xl shadow-2xl flex justify-between items-center cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <div>
              <h3 className="text-md font-semibold text-gray-100">Calendrier dividende</h3>
              <p className="text-sm text-gray-400">Cliquez pour ouvrir</p>
            </div>
            <CalendarIcon className="h-9 w-9 text-gray-400" />
          </motion.div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 p-4 rounded-3xl shadow-2xl">
            <h3 className="text-md font-semibold text-gray-100 mb-4">Calendrier dividende</h3>
            <DividendCalendar dividends={dividendEvents} />
          </div>
        )}
      </motion.div>

      {/* Répartition immobilière */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full mt-6"
      >
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Répartition Immobilière
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={dataImmo}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
            >
              {dataImmo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#2e2e2e", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pop-up de vérification d’e-mail */}
      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={handleVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal du calendrier (mobile) */}
      {isMobile && modalOpen && (
        <DividendCalendarModal
          dividends={dividendEvents}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
