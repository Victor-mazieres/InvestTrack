import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Pencil,
  Euro,
  Trash,
  Plus,
  X,
  Briefcase,
  PlusCircle,
  List
} from "lucide-react";
import PeaActionChart from "./PeaActionChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

/**
 * Formate une date ISO (yyyy-MM-dd) en dd/MM/yyyy.
 */
function formatIsoDate(dateString) {
  if (!dateString) return "Non défini";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

// Données par défaut
const fakeActionsDB = [
  {
    id: "1",
    name: "Tesla",
    sector: "Technologie",
    history: [
      { date: "2024-01-10", quantity: 5, price: 800, fees: 3 },
      { date: "2024-02-12", quantity: 4, price: 850, fees: 4 },
      { date: "2024-03-15", quantity: 6, price: 900, fees: 5 },
      { date: "2025-01-10", quantity: 5, price: 780, fees: 2 },
      { date: "2025-02-12", quantity: 3, price: 820, fees: 1 },
      { date: "2025-03-15", quantity: 7, price: 910, fees: 3 },
    ],
    priceHistory: [
      { date: "2024-01-01", price: 780 },
      { date: "2024-02-01", price: 820 },
      { date: "2024-03-01", price: 860 },
      { date: "2024-04-01", price: 910 },
    ],
    dividendsHistory: [
      { date: "2024-04-15", amount: 15 },
      { date: "2024-07-15", amount: 15 },
    ],
    dividendPrice: 2.5,
    dividendDate: "2025-02-28",
  },
];

export default function DetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = new URLSearchParams(location.search).get("edit") === "true";

  const openHistorique = (id) => {
    navigate(`/HistoriqueOrderPage/${id}`, {
      state: { 
        // Conservez le background de la navigation principale (si défini)
        background: location.state?.background || location,
        // Stockez ici la location actuelle (celle de DetailPage)
        detailBackground: location 
      }
    });
  };

  // États principaux
  const [action, setAction] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // États pour l'ajout d'achat (avec DatePicker)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ date: null, quantity: "", price: "", fees: "" });

  // États pour l'édition du dividende (dans le bloc "Dividendes reçus")
  const [isEditingDividend, setIsEditingDividend] = useState(false);
  const [editDiv, setEditDiv] = useState({ dividendPrice: "", dividendDate: "" });

  // États pour l'ajout de dividende (avec DatePicker)
  const [isAddDividendModalOpen, setIsAddDividendModalOpen] = useState(false);
  const [newDividend, setNewDividend] = useState({ date: null, amount: "" });

  // Charger l'action depuis localStorage ou utiliser fakeActionsDB
  useEffect(() => {
    let storedActions = JSON.parse(localStorage.getItem("actions"));
    if (!storedActions || storedActions.length === 0) {
      storedActions = fakeActionsDB;
      localStorage.setItem("actions", JSON.stringify(fakeActionsDB));
    }
    const foundAction = storedActions.find((a) => a.id === Number(id) || a.id === id);
    setAction(foundAction || null);
    setIsLoaded(true);
  }, [id]);

  // Initialiser les champs d'édition du dividende
  useEffect(() => {
    if (action) {
      setEditDiv({
        dividendPrice: action.dividendPrice ? action.dividendPrice.toString() : "",
        dividendDate: action.dividendDate || "",
      });
    }
  }, [action]);

  // Fonction pour sauvegarder les modifications du dividende
  const saveDividendEdits = () => {
    const updatedAction = {
      ...action,
      dividendPrice: parseFloat(editDiv.dividendPrice),
      dividendDate: editDiv.dividendDate
    };
    setAction(updatedAction);
    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) => (a.id === action.id ? updatedAction : a));
    localStorage.setItem("actions", JSON.stringify(updatedActions));
    setIsEditingDividend(false);
  };

  if (!isLoaded) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }
  if (!action || !action.name) {
    return <p className="text-center text-red-500">Action non trouvée !</p>;
  }

  // Calculs financiers
  const totalQuantity = action.history ? action.history.reduce((sum, a) => sum + a.quantity, 0) : 0;
  const currentPrice = action.priceHistory?.length
    ? action.priceHistory[action.priceHistory.length - 1].price
    : 0;
  const totalValorisation = (totalQuantity * currentPrice).toFixed(2);
  const totalCost = action.history
    ? action.history.reduce((sum, a) => sum + a.quantity * a.price, 0)
    : 0;
  const performancePercent =
    totalQuantity > 0
      ? (
          ((currentPrice - totalCost / totalQuantity) / (totalCost / totalQuantity)) *
          100
        ).toFixed(1)
      : 0;
  const gainOrLoss = (totalValorisation - totalCost).toFixed(2);
  const gainColor = gainOrLoss >= 0 ? "text-checkgreen" : "text-checkred";

  // Dividendes
  const expectedTotalDividend =
    action.dividendPrice && totalQuantity
      ? (action.dividendPrice * totalQuantity).toFixed(2) + "€"
      : "0.00€";
  const totalDividends = action.dividendsHistory
    ? action.dividendsHistory.reduce((sum, d) => sum + d.amount, 0).toFixed(2)
    : "0.00";

  // Gestion du formulaire d'ajout d'achat
  const handlePurchaseInputChange = (e) => {
    setNewPurchase({ ...newPurchase, [e.target.name]: e.target.value });
  };
  const addPurchase = () => {
    if (!newPurchase.date || !newPurchase.quantity || !newPurchase.price) return;
    const dateString = format(newPurchase.date, "yyyy-MM-dd");
    const updatedHistory = [
      ...(action.history || []),
      {
        date: dateString,
        quantity: parseInt(newPurchase.quantity),
        price: parseFloat(newPurchase.price),
        fees: parseFloat(newPurchase.fees) || 0,
      },
    ];
    const updatedAction = { ...action, history: updatedHistory };
    setAction(updatedAction);
    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) => (a.id === action.id ? updatedAction : a));
    localStorage.setItem("actions", JSON.stringify(updatedActions));
    setNewPurchase({ date: null, quantity: "", price: "", fees: "" });
    setIsPurchaseModalOpen(false);
  };
  const deletePurchase = (index) => {
    const updatedHistory = action.history.filter((_, i) => i !== index);
    const updatedAction = { ...action, history: updatedHistory };
    setAction(updatedAction);
    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) => (a.id === action.id ? updatedAction : a));
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  // Gestion du formulaire d'ajout de dividende
  const handleDividendInputChange = (e) => {
    setNewDividend({ ...newDividend, [e.target.name]: e.target.value });
  };
  const addDividend = () => {
    if (!newDividend.date || !newDividend.amount) return;
    const dateString = format(newDividend.date, "yyyy-MM-dd");
    const updatedDividends = [
      ...(action.dividendsHistory || []),
      { date: dateString, amount: parseFloat(newDividend.amount) },
    ];
    const updatedAction = { ...action, dividendsHistory: updatedDividends };
    setAction(updatedAction);
    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) => (a.id === action.id ? updatedAction : a));
    localStorage.setItem("actions", JSON.stringify(updatedActions));
    setNewDividend({ date: null, amount: "" });
    setIsAddDividendModalOpen(false);
  };
  const deleteDividend = (index) => {
    const updatedDividends = (action.dividendsHistory || []).filter((_, i) => i !== index);
    const updatedAction = { ...action, dividendsHistory: updatedDividends };
    setAction(updatedAction);
    let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) => (a.id === action.id ? updatedAction : a));
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  // Limiter l'affichage des achats à 5 lignes
  const hasMoreHistory = action.history && action.history.length > 5;

  return (
    <div className="relative p-6 min-h-screen bg-light">
      {/* Petit overlay dégradé en haut */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-10" />
      {/* Petite barre "poignée" centrée en haut */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full z-20" />

      {/* Barre de navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-greenLight text-2xl font-semibold hover:text-secondary transition"
        >
          <ArrowLeft className="w-6 h-6 mr-2" /> Retour
        </button>
      </div>

      {/* Titre, Secteur & Graphique */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Modifier" : "Détails"} de{" "}
          <span className="text-greenLight">{action.name}</span>
        </h1>
        <div className="flex items-center mt-2 mb-4">
          <Briefcase className="w-5 h-5 text-gray-500 mr-2" />
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {action.sector || "Non défini"}
          </span>
        </div>
        <PeaActionChart data={action.priceHistory || []} />
      </div>

      {/* Bloc Informations financières & Dividendes */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Informations & Dividendes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Valorisation totale</p>
            <p className="text-2xl font-bold text-greenLight">{totalValorisation}€</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Performance</p>
            <p className="text-2xl font-bold text-greenLight">{performancePercent}%</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Nombre d'actions</p>
            <p className="text-2xl font-bold text-greenLight">{totalQuantity}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Gain/Perte</p>
            <p className={`text-2xl font-bold ${gainColor}`}>{gainOrLoss}€</p>
          </div>
        </div>
      </div>

  <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6 relative">
  {!isEditingDividend ? (
    <>
      {/* Bouton Modifier positionné en dehors du contenu, en haut à droite */}
      <button
        onClick={() => setIsEditingDividend(true)}
        className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md text-primary hover:text-blue-700 transition z-50"
      >
        <Pencil className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <p className="text-sm text-gray-500">Dividende par action</p>
            <p className="text-2xl font-bold text-greenLight">
              {action.dividendPrice ? action.dividendPrice + "€" : "—"}
            </p>
          </div>
          <div className="w-px bg-gray-300 h-12 mx-4"></div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Dividendes totaux attendus</p>
            <p className="text-2xl font-bold text-greenLight">
              {expectedTotalDividend}
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Date de versement prévue</p>
          <p className="text-2xl font-bold">
            {action.dividendDate ? formatIsoDate(action.dividendDate) : "Non défini"}
          </p>
        </div>
      </div>
    </>
  ) : (
    // Vue édition
    <div className="mb-4 p-4 border rounded-md bg-gray-50">
      <div className="flex flex-col items-center mb-4">
        <p className="font-semibold text-primary mb-1">Dividende par action</p>
        <input
          type="number"
          value={editDiv.dividendPrice}
          onChange={(e) => setEditDiv({ ...editDiv, dividendPrice: e.target.value })}
          className="text-xl font-bold border rounded p-2 w-32 text-center"
        />
        <p className="text-sm text-gray-500 mt-2">Date de versement</p>
        <input
          type="date"
          value={editDiv.dividendDate}
          onChange={(e) => setEditDiv({ ...editDiv, dividendDate: e.target.value })}
          className="border rounded p-2 text-center"
        />
      </div>
      <div className="flex space-x-2">
        <button
          onClick={saveDividendEdits}
          className="bg-primary text-white p-2 rounded-lg hover:bg-secondary transition w-full"
        >
          Enregistrer
        </button>
        <button
          onClick={() => setIsEditingDividend(false)}
          className="bg-gray-200 text-gray-800 p-2 rounded-lg transition w-full"
        >
          Annuler
        </button>
      </div>
    </div>
  )}
</div>


      {/* Bloc Historique */}
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
          <List className="w-5 h-5 mr-2 text-primary" /> Historique
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne Achats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-secondary">Achats</h3>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="text-greenLight hover:text-secondary transition flex items-center text-l"
              >
                <PlusCircle className="w-4 h-4 mr-1 text-greenLight" /> Ajouter
              </button>
            </div>
            {/* Conteneur scrollable pour les achats */}
            <div className="max-h-[150px] overflow-y-auto">
              <ul className="space-y-3">
                {action.history?.map((entry, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b pb-2 last:border-none"
                  >
                    <span className="text-xs text-secondary">
                      {entry.date ? formatIsoDate(entry.date) : "—"}
                    </span>
                    <span className="text-gray-900 text-sm">{entry.quantity} actions</span>
                    <span className="text-primary text-sm">{entry.price}€</span>
                    <span className="text-gray-600 text-xs">{entry.fees}€ frais</span>
                    <button
                      onClick={() => deletePurchase(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {action.history.length > 5 && (
              <button
              onClick={() =>
                navigate(`/HistoriqueOrderPage/${action.id}`, {
                  state: {
                    // On conserve le background d'origine s'il existe, ou on passe la location actuelle (la modal détail)
                    background: location.state?.background || location,
                    // On stocke la location actuelle comme background de détail
                    detailBackground: location,
                  },
                })
              }
              className="font-bold text-greenLight"
            >
              Voir plus
            </button>
            
            
            )}
          </div>

          {/* Colonne Dividendes reçus */}
          <div>
            <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
          <Euro className="w-5 h-5 mr-2 text-primary" /> Dividende reçu
        </h2>
              <button
                onClick={() => setIsAddDividendModalOpen(true)}
                className="text-greenLight hover:text-secondary transition flex items-center text-l"
              >
                <PlusCircle className="w-4 h-4 mr-1 text-greenLight" /> Ajouter
              </button>
            </div>
            <div className="max-h-[150px] overflow-y-auto">
              <ul className="space-y-3">
                {action.dividendsHistory && action.dividendsHistory.length > 0 ? (
                  action.dividendsHistory.map((div, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b pb-2 last:border-none"
                    >
                      <span className="text-xs text-secondary">
                        {div.date ? formatIsoDate(div.date) : "—"}
                      </span>
                      <span className="text-xl font-bold text-greenLight">{div.amount}€</span>
                      <button
                        onClick={() => {
                          const updatedDividends = action.dividendsHistory.filter((_, i) => i !== index);
                          const updatedAction = { ...action, dividendsHistory: updatedDividends };
                          setAction(updatedAction);
                          let storedActions = JSON.parse(localStorage.getItem("actions")) || [];
                          const updatedActions = storedActions.map((a) =>
                            a.id === action.id ? updatedAction : a
                          );
                          localStorage.setItem("actions", JSON.stringify(updatedActions));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">Aucun dividende enregistré.</p>
                )}
              </ul>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total des dividendes reçus</p>
              <p className="text-2xl font-bold">{totalDividends}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modale pour ajouter un achat */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Ajouter un achat</h2>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <DatePicker
                selected={newPurchase.date}
                onChange={(date) => setNewPurchase({ ...newPurchase, date })}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 border rounded"
                placeholderText="Sélectionnez une date"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantité"
                value={newPurchase.quantity}
                onChange={handlePurchaseInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="price"
                placeholder="Prix d'achat (€)"
                value={newPurchase.price}
                onChange={handlePurchaseInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="fees"
                placeholder="Frais (€)"
                value={newPurchase.fees}
                onChange={handlePurchaseInputChange}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={addPurchase}
                className="w-full bg-primary text-white p-2 rounded-lg hover:bg-secondary transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour ajouter un dividende */}
      {isAddDividendModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Ajouter un dividende</h2>
              <button onClick={() => setIsAddDividendModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <DatePicker
                selected={newDividend.date}
                onChange={(date) => setNewDividend({ ...newDividend, date })}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 border rounded"
                placeholderText="Sélectionnez une date"
              />
              <input
                type="number"
                name="amount"
                placeholder="Montant (€)"
                value={newDividend.amount}
                onChange={(e) => setNewDividend({ ...newDividend, amount: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={addDividend}
                className="w-full bg-primary text-white p-2 rounded-lg hover:bg-secondary transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
