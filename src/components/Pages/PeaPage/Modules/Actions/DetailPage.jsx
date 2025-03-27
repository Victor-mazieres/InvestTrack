import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash,
  PlusCircle,
  X,
  Briefcase,
  List,
} from "lucide-react";
import PeaActionChart from "../Actions/PeaActionChart";
import CustomDatePicker from "../Actions/CustomDatePickerAddAction/CustomDatePicker"; // Import du CustomDatePicker
import { format, parse } from "date-fns";
import { ActionsContext } from "./ActionsContext";

// Formate une date ISO en "dd/MM/yyyy"
function formatIsoDate(dateString) {
  if (!dateString) return "Non défini";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

// Composant Modal pour ajouter un achat
function PurchaseModal({ onClose, newPurchase, setNewPurchase, onAddPurchase }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-4/5 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-primary">Ajouter un achat</h2>
          <button onClick={onClose} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="w-full">
            <CustomDatePicker
              selected={newPurchase.date}
              onChange={(date) =>
                setNewPurchase((prev) => ({ ...prev, date }))
              }
              placeholderText="Sélectionnez une date"
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
          </div>
          <input
            type="number"
            name="quantity"
            placeholder="Quantité"
            value={newPurchase.quantity}
            onChange={(e) =>
              setNewPurchase((prev) => ({
                ...prev,
                quantity: e.target.value,
              }))
            }
            className="w-full p-2 border rounded-3xl"
          />
          <input
            type="number"
            name="price"
            placeholder="Prix d'achat (€)"
            value={newPurchase.price}
            onChange={(e) =>
              setNewPurchase((prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
            className="w-full p-2 border rounded-3xl"
          />
          <input
            type="number"
            name="fees"
            placeholder="Frais (€)"
            value={newPurchase.fees}
            onChange={(e) =>
              setNewPurchase((prev) => ({
                ...prev,
                fees: e.target.value,
              }))
            }
            className="w-full p-2 border rounded-3xl"
          />
          <button
            onClick={onAddPurchase}
            className="w-full bg-greenLight text-white p-2 rounded-3xl"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour ajouter un dividende
function DividendModal({ onClose, newDividend, setNewDividend, onAddDividend }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-4/5 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-primary">Ajouter un dividende</h2>
          <button onClick={onClose} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="w-full">
            <CustomDatePicker
              selected={newDividend.date}
              onChange={(date) =>
                setNewDividend((prev) => ({ ...prev, date }))
              }
              placeholderText="Sélectionnez une date"
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
          </div>
          <input
            type="number"
            name="amount"
            placeholder="Montant (€)"
            value={newDividend.amount}
            onChange={(e) =>
              setNewDividend((prev) => ({ ...prev, amount: e.target.value }))
            }
            className="w-full p-2 border rounded-3xl"
          />
          <button
            onClick={onAddDividend}
            className="w-full bg-greenLight text-white p-2 rounded-3xl"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = new URLSearchParams(location.search).get("edit") === "true";
  const { actions, updateAction, loading } = useContext(ActionsContext);

  // Récupération de l'action soit depuis le contexte, soit depuis location.state
  const createdAction = location.state?.createdAction;
  const actionFromContext = actions.find(
    (a) => a.id === Number(id) || a.id === id
  );
  const action = actionFromContext || createdAction;

  // États pour les modaux et l'édition de dividende
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    date: null,
    quantity: "",
    price: "",
    fees: "",
  });
  const [isEditingDividend, setIsEditingDividend] = useState(false);
  const [editDiv, setEditDiv] = useState({ dividendPrice: "", dividendDate: "" });
  const [isAddDividendModalOpen, setIsAddDividendModalOpen] = useState(false);
  const [newDividend, setNewDividend] = useState({ date: null, amount: "" });
  // Nouvel état pour gérer l'affichage partiel/complet des dividendes
  const [showAllDividends, setShowAllDividends] = useState(false);

  useEffect(() => {
    if (action) {
      setEditDiv({
        dividendPrice: action.dividendPrice ? action.dividendPrice.toString() : "",
        dividendDate: action.dividendDate || "",
      });
    }
  }, [action]);

  const saveDividendEdits = () => {
    const updatedAction = {
      ...action,
      dividendPrice: parseFloat(editDiv.dividendPrice),
      dividendDate: editDiv.dividendDate,
    };
    updateAction(action.id, updatedAction);
    setIsEditingDividend(false);
  };

  // Calculs mémorisés pour éviter des recalculs inutiles
  const totalQuantity = useMemo(() => {
    return action?.history?.length > 0
      ? action.history.reduce((sum, a) => sum + a.quantity, 0)
      : action?.quantity || 0;
  }, [action]);

  const currentPrice = useMemo(() => {
    return action?.priceHistory?.length
      ? action.priceHistory[action.priceHistory.length - 1].price
      : 0;
  }, [action]);

  const totalValorisation = useMemo(
    () => (totalQuantity * currentPrice).toFixed(2),
    [totalQuantity, currentPrice]
  );
  const totalCost = useMemo(
    () =>
      action?.history
        ? action.history.reduce((sum, a) => sum + a.quantity * a.price, 0)
        : 0,
    [action]
  );
  const performancePercent = useMemo(() => {
    return totalQuantity > 0
      ? (((currentPrice - totalCost / totalQuantity) / (totalCost / totalQuantity)) *
          100).toFixed(1)
      : 0;
  }, [totalQuantity, currentPrice, totalCost]);
  const gainOrLoss = useMemo(
    () => (totalValorisation - totalCost).toFixed(2),
    [totalValorisation, totalCost]
  );
  const gainColor = gainOrLoss >= 0 ? "text-checkgreen" : "text-checkred";

  const expectedTotalDividend =
    action?.dividendPrice && totalQuantity
      ? (action.dividendPrice * totalQuantity).toFixed(2) + "€"
      : "0.00€";
  const totalDividends = action?.dividendsHistory
    ? action.dividendsHistory.reduce((sum, d) => sum + d.amount, 0).toFixed(2)
    : "0.00";

  // Détermine quels dividendes afficher : 3 ou tous
  const displayedDividends = useMemo(() => {
    if (!action?.dividendsHistory) return [];
    return showAllDividends
      ? action.dividendsHistory
      : action.dividendsHistory.slice(0, 3);
  }, [action, showAllDividends]);

  // Ajout d'un achat
  const addPurchase = () => {
    if (!newPurchase.date || !newPurchase.quantity || !newPurchase.price) return;
    const dateString = format(newPurchase.date, "yyyy-MM-dd");
    const updatedHistory = [
      ...(action.history || []),
      {
        date: dateString,
        quantity: parseInt(newPurchase.quantity, 10),
        price: parseFloat(newPurchase.price),
        fees: parseFloat(newPurchase.fees) || 0,
      },
    ];
    updateAction(action.id, { ...action, history: updatedHistory });
    setNewPurchase({ date: null, quantity: "", price: "", fees: "" });
    setIsPurchaseModalOpen(false);
  };

  const deletePurchase = (index) => {
    const updatedHistory = action.history.filter((_, i) => i !== index);
    updateAction(action.id, { ...action, history: updatedHistory });
  };

  // Ajout d'un dividende
  const addDividend = () => {
    if (!newDividend.date || !newDividend.amount) return;
    const dateString = format(newDividend.date, "yyyy-MM-dd");
    const updatedDividends = [
      ...(action.dividendsHistory || []),
      { date: dateString, amount: parseFloat(newDividend.amount) },
    ];
    updateAction(action.id, { ...action, dividendsHistory: updatedDividends });
    setNewDividend({ date: null, amount: "" });
    setIsAddDividendModalOpen(false);
  };

  const deleteDividend = (index) => {
    const updatedDividends = (action.dividendsHistory || []).filter(
      (_, i) => i !== index
    );
    updateAction(action.id, { ...action, dividendsHistory: updatedDividends });
  };

  if (loading) return <p>Chargement...</p>;
  if (!action)
    return <p className="text-center text-red-500">Action non trouvée !</p>;

  return (
    <div className="relative p-6 min-h-screen bg-light">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-10" />
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>
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
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Informations & Dividendes
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Valorisation totale</p>
            <p className="text-xl font-bold text-greenLight">
              {totalValorisation}€
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Performance</p>
            <p className="text-xl font-bold text-greenLight">
              {performancePercent}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Nombre d'actions</p>
            <p className="text-xl font-bold text-greenLight">
              {totalQuantity}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">Gain/Perte</p>
            <p className={`text-xl font-bold ${gainColor}`}>
              {gainOrLoss}€
            </p>
          </div>
        </div>
      </div>

      {/* Section Dividende */}
      <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-6 relative">
        {!isEditingDividend ? (
          <>
            <button
              onClick={() => setIsEditingDividend(true)}
              className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md text-primary hover:text-blue-700 transition z-50"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-full">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Dividende par action
                  </p>
                  <p className="text-xl font-bold text-greenLight">
                    {action.dividendPrice
                      ? `${action.dividendPrice}€`
                      : "—"}
                  </p>
                </div>
                <div className="w-px bg-gray-300 h-12 mx-4"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Dividendes totaux attendus
                  </p>
                  <p className="text-xl font-bold text-greenLight">
                    {expectedTotalDividend}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Date de versement prévue
                </p>
                <p className="text-xl font-bold">
                  {action.dividendDate
                    ? formatIsoDate(action.dividendDate)
                    : "Non défini"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4 p-4 border rounded-3xl bg-gray-50">
            <div className="flex flex-col items-center mb-4">
              <p className="font-semibold text-primary mb-1">
                Dividende par action
              </p>
              <input
                type="number"
                value={editDiv.dividendPrice}
                onChange={(e) =>
                  setEditDiv((prev) => ({
                    ...prev,
                    dividendPrice: e.target.value,
                  }))
                }
                className="text-xl font-bold border rounded-3xl p-2 w-32 text-center"
              />
              <p className="text-sm text-gray-500 mt-2">Date de versement</p>
              <div className="w-full">
                <CustomDatePicker
                  selected={
                    editDiv.dividendDate ? new Date(editDiv.dividendDate) : null
                  }
                  onChange={(date) =>
                    setEditDiv((prev) => ({
                      ...prev,
                      dividendDate: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                  placeholderText="Sélectionnez la date du dividende"
                  className="w-full p-3 border rounded-3xl bg-gray-50"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={saveDividendEdits}
                className="bg-greenLight text-white p-2 rounded-3xl w-full"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditingDividend(false)}
                className="bg-gray-200 text-gray-800 p-2 rounded-3xl w-full"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section Historique */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
          <List className="w-5 h-5 mr-2 text-primary" /> Historique
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne Achats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-secondary">
                Achats
              </h3>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="text-greenLight flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1 text-greenLight" /> Ajouter
              </button>
            </div>
            <div className="max-h-[150px] overflow-y-auto">
              <ul className="space-y-3">
                {action.history?.map((entry, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="text-xs text-secondary">
                      {entry.date ? formatIsoDate(entry.date) : "—"}
                    </span>
                    <span className="text-gray-900 text-sm">
                      {entry.quantity} actions
                    </span>
                    <span className="text-primary text-sm">
                      {entry.price}€
                    </span>
                    <span className="text-gray-600 text-xs">
                      {entry.fees}€ frais
                    </span>
                    <button
                      onClick={() => deletePurchase(index)}
                      className="text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {action.history && action.history.length > 3 && (
              <button
                onClick={() =>
                  navigate(`/HistoriqueOrderPage/${action.id}`, {
                    state: {
                      background: location.state?.background || location,
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
          {/* Colonne Dividendes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                Dividende reçu
              </h2>
              <button
                onClick={() => setIsAddDividendModalOpen(true)}
                className="text-greenLight flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1 text-greenLight" /> Ajouter
              </button>
            </div>
            <div className="max-h-[150px] overflow-y-auto">
              <ul className="space-y-3">
                {displayedDividends && displayedDividends.length > 0 ? (
                  displayedDividends.map((div, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <span className="text-xs text-secondary">
                        {div.date ? formatIsoDate(div.date) : "—"}
                      </span>
                      <span className="text-l text-primary">
                        {div.amount}€
                      </span>
                      <button
                        onClick={() => deleteDividend(index)}
                        className="text-red-500"
                      >
                        <Trash size={16} />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">
                    Aucun dividende enregistré.
                  </p>
                )}
              </ul>
            </div>
            {/* Bouton "Voir plus" pour les dividendes */}
            {action.dividendsHistory &&
              action.dividendsHistory.length > 3 && (
                <button
                  onClick={() =>
                    navigate(`/HistoriqueDividendePage/${action.id}`, {
                      state: { background: location },
                    })
                  }
                  className="mt-4 font-bold text-greenLight"
                >
                  Voir plus
                </button>
              )}

            <div className="mt-4 text-right">
              <p className="text-sm text-gray-500">
                Total des dividendes reçus
              </p>
              <p className="text-xl font-bold text-greenLight">
                {totalDividends}€
              </p>
            </div>
          </div>
        </div>
      </div>

      {isPurchaseModalOpen && (
        <PurchaseModal
          onClose={() => setIsPurchaseModalOpen(false)}
          newPurchase={newPurchase}
          setNewPurchase={setNewPurchase}
          onAddPurchase={addPurchase}
        />
      )}

      {isAddDividendModalOpen && (
        <DividendModal
          onClose={() => setIsAddDividendModalOpen(false)}
          newDividend={newDividend}
          setNewDividend={setNewDividend}
          onAddDividend={addDividend}
        />
      )}
    </div>
  );
}
