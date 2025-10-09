// src/components/Dashboard.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { CalendarIcon, BanknotesIcon } from "@heroicons/react/24/outline";
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
import OngoingTasks from "./Modules/OngoingTasks";

/* -------- Card interne -------- */
function Card({ children, className = "", interactive = false, elevation = "md", ...rest }) {
  const shadow =
    elevation === "lg"
      ? "shadow-[0_22px_50px_-12px_rgba(0,0,0,0.8)]"
      : elevation === "sm"
      ? "shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
      : "shadow-[0_14px_34px_-12px_rgba(0,0,0,0.7)]";

  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden p-4",
        "bg-gradient-to-br from-[#111821] via-[#0f1620] to-[#0b1118]",
        "border border-white/10",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/15",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/40",
        shadow,
        "ring-1 ring-black/10",
        interactive && "transition-transform duration-200 will-change-transform hover:-translate-y-[2px]",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_60%)]" />
      {children}
    </div>
  );
}

/* ---------------- Données mock ---------------- */
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

/* ---------------- Hooks & utils ---------------- */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : true);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

function getDividendEvents(actions) {
  const events = [];
  if (!actions || !Array.isArray(actions) || actions.length === 0) return events;

  for (const action of actions) {
    const totalQuantity = action.history?.length
      ? action.history.reduce((sum, a) => sum + a.quantity, 0)
      : action.quantity || 1;

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

/* ---------------- Component ---------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { actions, fetchActions } = useContext(ActionsContext);

  const [profile, setProfile] = useState(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ statusFilter stable (évite refetchs inutiles)
  const defaultStatusFilter = useMemo(() => ["in_progress", "todo", "blocked"], []);

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
            if (!userData.email || userData.emailVerified === false) {
              setShowEmailVerification(true);
            }
          } else if (response.status === 401) {
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

  useEffect(() => {
    if (!isLoading && profile && (!profile.email || profile.emailVerified === false) && !showEmailVerification) {
      setShowEmailVerification(true);
    }
  }, [isLoading, profile, showEmailVerification]);

  const dividendEvents = useMemo(() => getDividendEvents(actions), [actions]);

  const handleVerified = () => {
    setProfile((p) => ({ ...p, emailVerified: true }));
    setShowEmailVerification(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-950 min-h-screen">
        <div className="w-16 h-16 border-t-4 border-emerald-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-300">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 min-h-screen pt-16 bg-[#050a0f] bg-[radial-gradient(1200px_600px_at_-10%_-10%,rgba(57,217,138,0.06),transparent_60%),radial-gradient(900px_500px_at_110%_110%,rgba(57,217,138,0.04),transparent_60%)]">
      {/* Header animé */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full flex justify-between items-center mb-4 px-1"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
      </motion.header>

      {/* --- Performance PEA --- */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full"
      >
        <Card elevation="lg" className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Performance PEA</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dataPEA}>
              <CartesianGrid stroke="#1f2a36" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#cdd6df" />
              <YAxis stroke="#cdd6df" />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid #223042",
                  borderRadius: 14,
                  color: "#fff",
                }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Line type="monotone" dataKey="value" stroke="#39d98a" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* === Grille 1 : deux cartes (Total actions, Prochain dividende) === */}
      <div className="w-full mt-6 grid grid-cols-2 md:grid-cols-2 gap-4 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="h-full"
        >
          <Card elevation="md" className="h-full">
            <TotalActions />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="h-full"
        >
          <Card elevation="md" className="h-full">
            <NextDividend />
          </Card>
        </motion.div>
      </div>

      {/* === Calendrier des dividendes (immédiatement sous les deux cartes) === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="w-full mt-6"
      >
        {isMobile ? (
          <motion.div whileTap={{ scale: 0.96 }} onClick={() => setModalOpen(true)}>
            <Card interactive elevation="md" className="flex justify-between items-center cursor-pointer">
              <div>
                <h3 className="text-md font-semibold text-white">Calendrier dividende</h3>
                <p className="text-sm text-gray-400">Cliquez pour ouvrir</p>
              </div>
              <CalendarIcon className="h-9 w-9 text-gray-300" />
            </Card>
          </motion.div>
        ) : (
          <Card elevation="lg">
            <h3 className="text-md font-semibold text-white mb-4">Calendrier dividende</h3>
            <DividendCalendar dividends={dividendEvents} />
          </Card>
        )}
      </motion.div>

      {/* === Grille 2 : tuiles carrées (Optimiseur d’épargne, Salaire+TMI) === */}
      <div className="w-full mt-6 grid grid-cols-2 md:grid-cols-2 gap-4 items-stretch">
        {/* Optimiseur d’épargne */}
        <motion.button
          type="button"
          onClick={() => navigate("/budget-optimizer")}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group aspect-square w-full"
          aria-label="Ouvrir l’optimiseur d’épargne"
        >
          <Card interactive elevation="md" className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0a1016]/70 border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <BanknotesIcon className="h-7 w-7 text-[#39d98a]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Optimiseur d’épargne</p>
                <p className="text-xs text-gray-400 mt-0.5">Salaire • Fixes • Dépenses</p>
              </div>
            </div>
          </Card>
        </motion.button>

        {/* Salaire + TMI */}
        <motion.button
          type="button"
          onClick={() => navigate("/TMI")}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group aspect-square w-full"
          aria-label="Ouvrir TMI"
        >
          <Card interactive elevation="md" className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0a1016]/70 border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <BanknotesIcon className="h-7 w-7 text-[#39d98a]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Salaire + TMI</p>
                <p className="text-xs text-gray-400 mt-0.5">Stockage • Calcul TMI</p>
              </div>
            </div>
          </Card>
        </motion.button>
      </div>

      {/* Répartition immobilière */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mt-6"
      >
        <Card elevation="lg" className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Répartition Immobilière</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dataImmo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {dataImmo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#39d98a", "#22d3ee", "#a78bfa"][index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid #223042",
                  borderRadius: 14,
                  color: "#fff",
                }}
                itemStyle={{ color: "#e5e7eb" }}
                labelStyle={{ color: "#9ca3af" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Tâches en cours (SOUS la répartition immobilière) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="w-full mt-6"
      >
        <Card elevation="lg" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tâches en cours</h2>
            <p className="text-xs text-gray-400">Aperçu global par bien</p>
          </div>
          <OngoingTasks statusFilter={defaultStatusFilter} />
        </Card>
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={handleVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>

      {isMobile && modalOpen && (
        <DividendCalendarModal dividends={dividendEvents} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
