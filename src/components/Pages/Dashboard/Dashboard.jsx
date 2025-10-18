// src/components/Dashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import EmailVerificationModal from "../ConnexionPage/EmailVerificationModal";
import OngoingTasks from "./Modules/OngoingTasks";
import CalendarWidget from "./Modules/CalendarWidget"; // ⬅️ import du calendrier

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

/* ---------------- Données mock uniquement immo ---------------- */
const dataImmo = [
  { name: "Loyer", value: 65 },
  { name: "Charges", value: 20 },
  { name: "Taxes", value: 15 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filtre par défaut pour OngoingTasks
  const defaultStatusFilter = useMemo(() => ["in_progress", "todo", "blocked"], []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

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
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && profile && (!profile.email || profile.emailVerified === false) && !showEmailVerification) {
      setShowEmailVerification(true);
    }
  }, [isLoading, profile, showEmailVerification]);

  // ⬇️ Événements mock pour le calendrier (remplace par tes données)
  const calendarEvents = useMemo(
    () => [
      { date: new Date(), title: "Échéance loyer — Appartement A12", meta: "700 €" },
      { date: new Date(new Date().setDate(new Date().getDate() + 2)), title: "Appel charges copro", meta: "120 €" },
      { date: new Date(new Date().getFullYear(), new Date().getMonth(), 5), title: "Assurance PNO", meta: "15 €/mois" },
    ],
    []
  );

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
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full flex justify-between items-center mb-4 px-1"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
      </motion.header>

      {/* Répartition immobilière */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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

      {/* ⬇️ Calendrier (sous les deux tuiles) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="w-full mt-6"
      >
        <Card elevation="lg" className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Calendrier</h2>
          <CalendarWidget events={calendarEvents} />
        </Card>
      </motion.div>

      {/* Tâches en cours */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
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

      {/* Modale vérification email */}
      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={() => setShowEmailVerification(false)}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
