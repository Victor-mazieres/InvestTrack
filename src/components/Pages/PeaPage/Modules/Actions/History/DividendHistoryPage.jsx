import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format, parse } from "date-fns";
import { ActionsContext } from "../ActionsContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des composants nécessaires à Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Fonction de formatage d'une date ISO en "dd/MM/yyyy"
function formatIsoDate(dateString) {
  if (!dateString) return "—";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

export default function DividendHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, loading } = useContext(ActionsContext);
  const [showDates, setShowDates] = useState(false);
  const chartRef = useRef(null); // Référence pour accéder à l'instance Chart.js

  // Choix de l'option d'affichage des axes :
  // - true : masquer complètement les axes (aucun label) – Option 1
  // - false : masquer les traits tout en conservant les labels – Option 2
  const hideAxesCompletely = false; // change à true pour l'Option 1

  const action = actions.find(
    (a) => a.id === id || a.id === Number(id)
  );
  if (loading) return <p>Chargement...</p>;
  if (!action)
    return <p className="text-center text-red-500">Action non trouvée !</p>;

  const dividends = action.dividendsHistory || [];

  // Tri des dividendes par date croissante
  const sortedDividends = useMemo(() => {
    return dividends.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dividends]);

  // Récupération des montants uniques pour l'axe des ordonnées
  const uniqueAmounts = useMemo(() => {
    const amounts = sortedDividends.map((div) => div.amount);
    return Array.from(new Set(amounts)).sort((a, b) => a - b);
  }, [sortedDividends]);

  // Transformation de chaque dividende en indice dans uniqueAmounts
  const transformedData = useMemo(() => {
    return sortedDividends.map((div) => uniqueAmounts.indexOf(div.amount));
  }, [sortedDividends, uniqueAmounts]);

  // Configuration des données du graphique
  const chartData = useMemo(
    () => ({
      labels: sortedDividends.map((div) => formatIsoDate(div.date)),
      datasets: [
        {
          label: "",
          data: transformedData,
          borderColor: "#22b99a",          // Couleur de la courbe
          backgroundColor: "transparent",  // Pas de couleur sous la courbe
          fill: false,
          tension: 0.3,                    // Pour une courbe lisse
          borderWidth: 2,
          pointBackgroundColor: "#22b99a",  // Couleur des points
          pointRadius: 4,
        },
      ],
    }),
    [sortedDividends, transformedData]
  );

  // Configuration des options du graphique en fonction de l'option choisie
  const options = useMemo(() => {
    if (hideAxesCompletely) {
      // Option 1 : Masquer totalement les axes (aucun label)
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: false },
          y: { display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const idx = context.parsed.y;
                const amount = uniqueAmounts[idx];
                return `${amount}€`;
              },
            },
          },
        },
      };
    } else {
      // Option 2 : Masquer uniquement les traits, tout en conservant les labels
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,    // Masque la grille
              drawBorder: false, // Masque la bordure de l'axe
              drawTicks: false,  // Masque les petits traits
            },
            ticks: { display: showDates }, // Affiche les dates seulement lors de l'interaction
          },
          y: {
            type: "category",
            // Affichage uniquement des montants uniques (avec "€")
            labels: uniqueAmounts.map((amount) => `${amount}€`),
            grid: {
              display: false,
              drawBorder: false,
              drawTicks: false,
            },
            ticks: { display: true },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const idx = context.parsed.y;
                const amount = uniqueAmounts[idx];
                return `${amount}€`;
              },
            },
          },
        },
      };
    }
  }, [hideAxesCompletely, showDates, uniqueAmounts]);

  // Gestion des interactions tactiles pour afficher temporairement les dates (axe x)
  useEffect(() => {
    const chartInstance = chartRef.current;
    if (!chartInstance || !chartInstance.canvas) return;
    const canvas = chartInstance.canvas;
    const handleTouchStart = () => setShowDates(true);
    const handleTouchEnd = () => setTimeout(() => setShowDates(false), 2000);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      {/* Barre de navigation */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>

      <h1 className="text-3xl font-bold text-secondary mb-4 text-center">
        Historique des dividendes –{" "}
        <span className="text-greenLight">{action.name}</span>
      </h1>

      {/* Affichage du graphique */}
      <div
        className="bg-white p-6 rounded-3xl shadow-xl mb-6"
        style={{ height: "300px" }}
      >
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Liste des dividendes */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Dividendes reçus
        </h2>
        <ul className="space-y-3">
          {sortedDividends.map((div, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="text-xs text-secondary">
                {div.date ? formatIsoDate(div.date) : "—"}
              </span>
              <span className="text-xl font-bold text-greenLight">
                {div.amount}€
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
