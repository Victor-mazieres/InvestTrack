import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Trash } from "lucide-react";
import { format, parse } from "date-fns";

/**
 * Formate une date ISO ("yyyy-MM-dd") en "dd/MM/yyyy".
 */
function formatIsoDate(dateString) {
  if (!dateString) return "—";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

// Exemple de données par défaut (si localStorage est vide)
const fakeActionsDB = [
  {
    id: "1",
    name: "Tesla",
    history: [
      { date: "2024-01-10", quantity: 5, price: 800, fees: 3 },
      { date: "2024-02-12", quantity: 4, price: 850, fees: 4 },
      { date: "2024-03-15", quantity: 6, price: 900, fees: 5 },
      { date: "2025-01-10", quantity: 5, price: 780, fees: 2 },
      { date: "2025-02-12", quantity: 3, price: 820, fees: 1 },
      { date: "2025-03-15", quantity: 7, price: 910, fees: 3 },
    ],
  },
];

export default function HistoriqueOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [action, setAction] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortOption, setSortOption] = useState("dateAsc");

  useEffect(() => {
    let storedActions = JSON.parse(localStorage.getItem("actions"));
    if (!storedActions || storedActions.length === 0) {
      storedActions = fakeActionsDB;
      localStorage.setItem("actions", JSON.stringify(fakeActionsDB));
    }
    const foundAction = storedActions.find(
      (a) => a.id === Number(id) || a.id === id
    );
    setAction(foundAction || null);
    setIsLoaded(true);
  }, [id]);

  // Supprimer un achat
  const deletePurchase = (index) => {
    if (!action) return;
    const updatedHistory = action.history.filter((_, i) => i !== index);
    const updatedAction = { ...action, history: updatedHistory };
    setAction(updatedAction);

    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) =>
      a.id === action.id ? updatedAction : a
    );
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  // Tri global des achats
  const sortedHistory = useMemo(() => {
    if (!action || !action.history) return [];
    const copy = [...action.history];
    copy.sort((a, b) => {
      switch (sortOption) {
        case "dateAsc":
          return new Date(a.date) - new Date(b.date);
        case "dateDesc":
          return new Date(b.date) - new Date(a.date);
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "quantityAsc":
          return a.quantity - b.quantity;
        case "quantityDesc":
          return b.quantity - a.quantity;
        case "totalAsc": {
          const totalA = a.price * a.quantity + a.fees;
          const totalB = b.price * b.quantity + b.fees;
          return totalA - totalB;
        }
        case "totalDesc": {
          const totalA = a.price * a.quantity + a.fees;
          const totalB = b.price * b.quantity + b.fees;
          return totalB - totalA;
        }
        default:
          return 0;
      }
    });
    return copy;
  }, [action, sortOption]);

  // Groupement par mois
  const groupedHistory = useMemo(() => {
    if (!sortedHistory.length) return [];
    const groups = {};
    sortedHistory.forEach((entry) => {
      const dateObj = new Date(entry.date);
      // On utilise l'année et le mois (0-11) comme clé
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    // Préparer les labels pour chaque groupe
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;

    const grouped = Object.entries(groups).map(([key, entries]) => {
      const [year, monthIndex] = key.split("-").map(Number);
      let label = ` ${monthNames[monthIndex]} ${year}`;
      if (key === currentKey) label = "Ce mois-ci";
      else if (key === prevKey) label = "Le mois dernier";
      return { key, label, entries };
    });
    // Trier les groupes par ordre décroissant (le plus récent en premier)
    grouped.sort((a, b) => {
      const [yearA, monthA] = a.key.split("-").map(Number);
      const [yearB, monthB] = b.key.split("-").map(Number);
      return (yearB - yearA) || (monthB - monthA);
    });
    return grouped;
  }, [sortedHistory]);

  if (!isLoaded) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }
  if (!action) {
    return <p className="text-center text-red-500">Action non trouvée !</p>;
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      {/* Barre de navigation */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-greenLight text-2xl font-semibold hover:text-secondary transition"
        >
          <ArrowLeft className="w-6 h-6 mr-2" /> Retour
        </button>
      </div>

      <h1 className="text-3xl font-bold text-secondary mb-4">
        Historique d'achats –{" "}
        <span className="text-greenLight inline-block">{action.name}</span>
      </h1>


      {/* Sélecteur de tri */}
      <div className="mb-4 flex items-center space-x-2">
        <label className="text-gray-600 text-sm font-medium">Trier par :</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-teal-500"
        >
          <option value="dateAsc">Date (asc)</option>
          <option value="dateDesc">Date (desc)</option>
          <option value="priceAsc">Prix unitaire (asc)</option>
          <option value="priceDesc">Prix unitaire (desc)</option>
          <option value="quantityAsc">Quantité (asc)</option>
          <option value="quantityDesc">Quantité (desc)</option>
          <option value="totalAsc">Total (asc)</option>
          <option value="totalDesc">Total (desc)</option>
        </select>
      </div>

      {/* Affichage groupé par mois */}
      {groupedHistory.length > 0 ? (
        <div className="space-y-6">
          {groupedHistory.map((group) => (
            <div key={group.key}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{group.label}</h2>
              <div className="space-y-3">
                {group.entries.map((entry, index) => {
                  const total = entry.quantity * entry.price + entry.fees;
                  const average =
                    entry.quantity > 0 ? (total / entry.quantity).toFixed(2) : "0.00";
                  return (
                    <div
                      key={index}
                      className="bg-white border-l-4 border-greenLight shadow-sm rounded p-2 text-sm flex flex-col gap-1"
                    >
                      {/* Ligne supérieure : date + bouton suppression */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {entry.date ? formatIsoDate(entry.date) : "—"}
                        </span>
                        <button
                          onClick={() => deletePurchase(index)}
                          className="text-checkred hover:text-red-700 transition"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      {/* Infos principales */}
                      <div className="text-gray-700 flex flex-wrap gap-2">
                        <p>
                          <span className="font-semibold">Quantité :</span> {entry.quantity}
                        </p>
                        <p>
                          <span className="font-semibold">Prix unitaire :</span> {entry.price}€
                        </p>
                        <p>
                          <span className="font-semibold">Frais :</span> {entry.fees}€
                        </p>
                      </div>
                      {/* Montants calculés */}
                      <div className="flex flex-wrap gap-2 text-gray-600">
                        <p>
                          <span className="font-semibold">Total (frais inclus) :</span>{" "}
                          <span className="text-teal-700 font-bold">
                            {total.toFixed(2)}€
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Prix moyen :</span>{" "}
                          <span className="text-teal-700 font-bold">{average}€</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun achat enregistré.</p>
      )}
    </div>
  );
}
