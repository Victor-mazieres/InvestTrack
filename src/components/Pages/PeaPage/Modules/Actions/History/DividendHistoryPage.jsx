import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format, parse } from "date-fns";
import { ActionsContext } from "../../Reutilisable/ActionsContext";
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

// Formate une date ISO en "dd/MM/yyyy"
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
  const chartRef = useRef(null);

  const hideAxesCompletely = false;

  const action = actions.find((a) => a.id === id || a.id === Number(id));
  if (loading)
    return <p className="text-center text-gray-100">Chargement...</p>;
  if (!action)
    return (
      <p className="text-center text-red-500">Action non trouvée !</p>
    );

  const dividends = action.dividendsHistory || [];
  const sortedDividends = useMemo(
    () => dividends.slice().sort((a, b) => new Date(a.date) - new Date(b.date)),
    [dividends]
  );
  const uniqueAmounts = useMemo(() => {
    const amounts = sortedDividends.map((div) => div.amount);
    return Array.from(new Set(amounts)).sort((a, b) => a - b);
  }, [sortedDividends]);
  const transformedData = useMemo(
    () => sortedDividends.map((div) => uniqueAmounts.indexOf(div.amount)),
    [sortedDividends, uniqueAmounts]
  );

  const chartData = useMemo(
    () => ({
      labels: sortedDividends.map((div) => formatIsoDate(div.date)),
      datasets: [
        {
          label: "",
          data: transformedData,
          borderColor: "#22b99a",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: "#22b99a",
          pointRadius: 4,
        },
      ],
    }),
    [sortedDividends, transformedData]
  );

  const options = useMemo(() => {
    if (hideAxesCompletely) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
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
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
              drawTicks: false,
            },
            ticks: { display: showDates },
          },
          y: {
            type: "category",
            labels: uniqueAmounts.map((amount) => `${amount}€`),
            grid: { display: false, drawBorder: false, drawTicks: false },
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

  useEffect(() => {
    const chartInstance = chartRef.current;
    if (!chartInstance || !chartInstance.canvas) return;
    const canvas = chartInstance.canvas;
    const handleTouchStart = () => setShowDates(true);
    const handleTouchEnd = () =>
      setTimeout(() => setShowDates(false), 2000);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100">
      {/* Barre de navigation */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>
      <h1 className="text-3xl font-bold mb-4 text-left text-white">
        Historique des dividendes –{" "}
        <span className="text-greenLight">{action.name}</span>
      </h1>
      {/* Graphique avec container sombre et border */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-3xl border border-gray-600 shadow-2xl hover:shadow-3xl mb-6" style={{ height: "300px" }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      {/* Séparation par border */}
      <div className="border-t border-gray-600 my-6"></div>
      {/* Liste des dividendes */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-3xl border border-gray-600 shadow-2xl hover:shadow-3xl">
        <h2 className="text-2xl font-bold text-white mb-4">Dividendes reçus</h2>
        <ul className="space-y-3">
          {sortedDividends.map((div, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b border-gray-600 pb-2"
            >
              <span className="text-xs text-gray-400">
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
