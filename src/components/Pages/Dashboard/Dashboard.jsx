import React, { useState, useEffect, useContext, useMemo } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
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
import { AnimatePresence, motion } from "framer-motion";

import TotalActions from "./Modules/TotalActions";
import NextDividend from "./Modules/NextDividend";
import DividendCalendar from "./Modules/DividendCalendar";
import DividendCalendarModal from "./Modules/DividendCalendarModal";
import EmailVerificationModal from "../ConnexionPage/EmailVerificationModal";
import { ActionsContext } from "../PeaPage/Modules/Reutilisable/ActionsContext";

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
  for (const action of actions) {
    const totalQuantity = action.history?.length
      ? action.history.reduce((sum, a) => sum + a.quantity, 0)
      : action.quantity || 1;

    // Extraction de l'historique
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
  const [modalOpen, setModalOpen] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const { actions, fetchActions } = useContext(ActionsContext);

  useEffect(() => {
    // Vérification e-mail
    setShowEmailVerification(localStorage.getItem("emailVerified") !== "true");
  }, []);

  useEffect(() => {
    // Charger les actions si elles ne sont pas déjà présentes
    if (!actions.length) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  // Calcul des événements de dividendes uniquement quand 'actions' change
  const dividendEvents = useMemo(() => {
    if (!actions.length) return [];
    return getDividendEvents(actions);
  }, [actions]);

  const handleVerified = () => {
    localStorage.setItem("emailVerified", "true");
    setShowEmailVerification(false);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-light min-h-screen pt-16">
      {/* Header animé */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-between items-center mb-4 px-4"
      >
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      </motion.header>

      {/* Graphique de performance du PEA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full mt-6 bg-white rounded-3xl p-2 shadow-xl"
      >
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
      </motion.div>

      {/* Grid des cards TotalActions et NextDividend */}
      <div className="w-full mt-6 grid grid-cols-[1.25fr_1.5fr] gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-4 rounded-3xl shadow-lg"
        >
          <TotalActions />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-4 rounded-3xl shadow-lg"
        >
          <NextDividend />
        </motion.div>
      </div>

      {/* Calendrier des dividendes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mt-6 grid grid-cols-1 gap-4"
      >
        {isMobile ? (
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-white p-4 rounded-3xl shadow-lg cursor-pointer flex items-center justify-between"
            onClick={() => setModalOpen(true)}
          >
            <div>
              <h3 className="text-md font-semibold text-gray-800">Calendrier dividende</h3>
              <p className="text-sm text-gray-600">Cliquez pour ouvrir</p>
            </div>
            <CalendarIcon className="h-9 w-9 text-gray-400" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-4 rounded-3xl shadow-lg"
          >
            <h3 className="text-md font-semibold text-gray-800 mb-4">Calendrier dividende</h3>
            <DividendCalendar dividends={dividendEvents} />
          </motion.div>
        )}
      </motion.div>

      {/* Graphique de répartition immobilière */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full mt-6"
      >
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
      </motion.div>

      {/* Modal de vérification d'e-mail */}
      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={handleVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal du calendrier (uniquement sur mobile) */}
      {isMobile && modalOpen && (
        <DividendCalendarModal dividends={dividendEvents} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
