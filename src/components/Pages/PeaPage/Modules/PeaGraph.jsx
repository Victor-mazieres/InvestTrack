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
      className="w-full p-4 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dataPEA}>
          <XAxis dataKey="date" stroke="#bdced3" />
          <YAxis stroke="#bdced3" />
          <Tooltip contentStyle={{ backgroundColor: "#2e2e2e", color: "#fff" }} />
          <CartesianGrid stroke="#444" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="valeur" stroke="#2e8e97" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
