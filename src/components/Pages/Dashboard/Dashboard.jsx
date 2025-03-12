import React, { useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

import EmailVerificationModal from "../ConnexionPage/EmailVerificationModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [country, setCountry] = useState("France");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/connexion");
      return;
    }
    fetch("http://localhost:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setCountry(data.country || "France");
        setAddress(data.address || "");
        setCity(data.city || "");
        setPostalCode(data.postalCode || "");
        setEmail(data.email || "");
      })
      .catch((err) => console.error("Erreur de chargement du profil :", err));
  }, [navigate]);

  useEffect(() => {
    const verified = localStorage.getItem("emailVerified");
    if (verified !== "true") {
      setShowEmailVerification(true);
    }
  }, []);

  const handleVerified = () => {
    localStorage.setItem("emailVerified", "true");
    setShowEmailVerification(false);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-light min-h-screen pt-16">
      <header className="w-full flex justify-between items-center mb-4 px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <div className="w-6"></div>
      </header>

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

      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerificationModal
            onVerified={handleVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}