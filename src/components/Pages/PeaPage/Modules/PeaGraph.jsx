import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

/* -------- Card locale pour le relief -------- */
function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden p-4",
        "bg-gradient-to-br from-[#111821] via-[#0f1620] to-[#0b1118]",
        "border border-white/10",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/15",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/40",
        "shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)]",
        "ring-1 ring-black/10",
        "transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.85)]",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_60%)]" />
      {children}
    </div>
  );
}

/* -------- Données -------- */
const dataPEA = [
  { date: "Jan", valeur: 1200 },
  { date: "Fév", valeur: 1600 },
  { date: "Mar", valeur: 900 },
  { date: "Avr", valeur: 1400 },
  { date: "Mai", valeur: 1800 },
  { date: "Jun", valeur: 1100 },
];

export default function PeaGraph() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Performance PEA</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataPEA}>
            <CartesianGrid stroke="#1f2a36" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#cdd6df" />
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
            <Line
              type="monotone"
              dataKey="valeur"
              stroke="#39d98a"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
