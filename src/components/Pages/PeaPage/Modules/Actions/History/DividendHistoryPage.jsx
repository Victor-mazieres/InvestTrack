import React, { useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format, parse } from "date-fns";
import { ActionsContext } from "../ActionsContext";
import ModernLineChart from "./ModernLineChart"; // Ajustez le chemin si nécessaire

function formatIsoDate(dateString) {
  if (!dateString) return "—";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

export default function DividendHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, loading } = useContext(ActionsContext);

  const action = actions.find((a) => a.id === id || a.id === Number(id));

  const [showAll, setShowAll] = useState(false);

  if (loading) return <p>Chargement...</p>;
  if (!action) return <p className="text-center text-red-500">Action non trouvée !</p>;

  const dividends = action.dividendsHistory || [];

  const sortedDividends = useMemo(() => {
    return dividends.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dividends]);

  const chartData = useMemo(
    () => ({
      labels: sortedDividends.map((div) => formatIsoDate(div.date)),
      datasets: [
        {
          label: "Dividendes reçus (€)",
          data: sortedDividends.map((div) => div.amount),
          borderColor: "#00A86B",
          backgroundColor: "rgba(0, 168, 107, 0.2)",
          fill: true,
          tension: 0.3,
          borderWidth: 3,
        },
      ],
    }),
    [sortedDividends]
  );

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
        Historique des dividendes – <span className="text-greenLight">{action.name}</span>
      </h1>

      {/* Graphique modernisé */}
      <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
        <ModernLineChart data={chartData} height={300} />
      </div>

      {/* Liste des dividendes */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Dividendes reçus</h2>
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
