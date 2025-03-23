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

export default function Dashboard() {
  const navigate = useNavigate();

  // États du profil utilisateur
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [country, setCountry] = useState("France");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  // Récupération du contexte d'actions
  const { actions, fetchActions } = useContext(ActionsContext);

  // État pour l'ouverture de la modale du calendrier
  const [modalOpen, setModalOpen] = useState(false);
  // État pour les événements de dividendes (format { date: Date, amount: Number })
  const [dividendEvents, setDividendEvents] = useState([]);

  // Charger le profil utilisateur
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

  // Vérification de l'email
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

  // Charger les actions si elles ne sont pas déjà chargées
  useEffect(() => {
    if (actions.length === 0) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  // Extraction et fusion des dividendes à partir de chaque action
  useEffect(() => {
    if (actions.length > 0) {
      let events = [];
      actions.forEach((action) => {
        if (action.dividendsHistory && Array.isArray(action.dividendsHistory)) {
          action.dividendsHistory.forEach((div) => {
            if (div.date && div.amount) {
              const d = new Date(div.date);
              // Normaliser la date (ignorer l'heure)
              const normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              events.push({ date: normalizedDate, amount: Number(div.amount) });
            }
          });
        }
      });
      // Fusionner les événements ayant la même date (additionner les montants)
      const merged = {};
      events.forEach((ev) => {
        const key = ev.date.getTime();
        if (merged[key]) {
          merged[key].amount += ev.amount;
        } else {
          merged[key] = { date: ev.date, amount: ev.amount };
        }
      });
      const mergedEvents = Object.values(merged).sort((a, b) => a.date - b.date);
      setDividendEvents(mergedEvents);
    }
  }, [actions]);

  return (
    <div className="flex flex-col items-center p-4 bg-light min-h-screen pt-16">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <div className="w-6"></div>
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

      {/* 4 carrés en dessous du graphique */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4">
        {/* Carré 1 : TotalActions */}
        <div className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <TotalActions />
        </div>
        {/* Carré 2 : NextDividend */}
        <div className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <NextDividend />
        </div>
        {/* Carré 3 : Placeholder */}
        <div className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <h3 className="text-md font-semibold text-gray-800">Carré 3</h3>
          <p className="text-sm text-gray-600">Contenu futur</p>
        </div>
        {/* Carré 4 : Ouvre la modale du calendrier des dividendes */}
        <div
          className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <h3 className="text-md font-semibold text-gray-800">Calendrier dividende</h3>
          <p className="text-sm text-gray-600">Cliquez pour ouvrir</p>
        </div>
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

      {/* Modal pour le calendrier des dividendes */}
      {modalOpen && (
        <DividendCalendarModal
          dividends={dividendEvents}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
