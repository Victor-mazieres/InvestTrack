// src/components/PEAOverview.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import TotalActions from "./Modules/TotalActions";
import NextDividend from "./Modules/NextDividend";
import DividendCalendar from "./Modules/DividendCalendar";
import DividendCalendarModal from "./Modules/DividendCalendarModal";
import { ActionsContext } from "../PeaPage/Modules/Reutilisable/ActionsContext";

/* --- Petite Card réutilisable (copiée du Dashboard) --- */
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

/* --- Helpers spécifiques PEA --- */
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

/* --- Données mock PEA (inchangées) --- */
const dataPEA = [
  { name: "Jan", value: 1200 },
  { name: "Fév", value: 1600 },
  { name: "Mar", value: 900 },
  { name: "Avr", value: 1400 },
  { name: "Mai", value: 1800 },
];

export default function PEAOverview() {
  const isMobile = useIsMobile();
  const { actions } = useContext(ActionsContext);
  const dividendEvents = useMemo(() => getDividendEvents(actions), [actions]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Performance PEA */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
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

      {/* Total actions & prochain dividende */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          <Card elevation="md" className="h-full">
            <TotalActions />
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          <Card elevation="md" className="h-full">
            <NextDividend />
          </Card>
        </motion.div>
      </div>

      {/* Calendrier dividendes */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.2 }}>
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

      <AnimatePresence>
        {isMobile && modalOpen && (
          <DividendCalendarModal dividends={dividendEvents} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
