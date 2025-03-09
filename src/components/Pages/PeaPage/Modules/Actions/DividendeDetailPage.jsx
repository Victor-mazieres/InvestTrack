import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash,
  X,
  PlusCircle,
  Briefcase
} from "lucide-react";

export default function DividendeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // État de l'action et du chargement
  const [action, setAction] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // État pour le formulaire d'ajout de dividende
  const [newDividend, setNewDividend] = useState({ date: "", amount: "" });
  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);

  // État pour le mode édition du dividende
  const [isEditingDividend, setIsEditingDividend] = useState(false);
  const [editDiv, setEditDiv] = useState({ dividendPrice: "", dividendDate: "" });

  // Données par défaut si le localStorage est vide
  const fakeActionsDB = [
    {
      id: "1",
      name: "Tesla",
      sector: "Technologie",
      history: [
        { date: "2024-01-10", quantity: 5, price: 800, fees: 3 },
        { date: "2024-02-12", quantity: 4, price: 850, fees: 4 },
        { date: "2024-03-15", quantity: 6, price: 900, fees: 5 }
      ],
      priceHistory: [
        { date: "2024-01-01", price: 780 },
        { date: "2024-02-01", price: 820 },
        { date: "2024-03-01", price: 860 },
        { date: "2024-04-01", price: 910 }
      ],
      dividendsHistory: [
        { date: "2024-04-15", amount: 15 },
        { date: "2024-07-15", amount: 15 }
      ],
      dividendPrice: 2.5,
      dividendDate: "2024-08-15"
    }
  ];

  // Charger l'action depuis localStorage, ou initialiser si vide
  useEffect(() => {
    let storedActions = JSON.parse(localStorage.getItem("actions"));
    if (!storedActions || storedActions.length === 0) {
      storedActions = fakeActionsDB;
      localStorage.setItem("actions", JSON.stringify(fakeActionsDB));
    }
    const foundAction = storedActions.find(
      (a) => a.id === Number(id) || a.id === id
    );
    if (foundAction) {
      setAction(foundAction);
    }
    setIsLoaded(true);
  }, [id]);

  // Calcul du nombre total d'actions à partir de l'historique
  const totalQuantity = action.history
    ? action.history.reduce((sum, a) => sum + a.quantity, 0)
    : 0;

  // Calcul du montant total attendu (dividende × total d'actions)
  const expectedTotalDividend =
    action.dividendPrice && totalQuantity
      ? (action.dividendPrice * totalQuantity).toFixed(2) + "€"
      : "0.00€";

  // Initialiser les champs d'édition du dividende
  useEffect(() => {
    if (action && action.name) {
      setEditDiv({
        dividendPrice: action.dividendPrice ? action.dividendPrice.toString() : "",
        dividendDate: action.dividendDate || ""
      });
    }
  }, [action]);

  // Calcul du total des dividendes reçus (historique)
  const totalDividends = action.dividendsHistory
    ? action.dividendsHistory.reduce((sum, d) => sum + d.amount, 0).toFixed(2)
    : "0.00";

  // Sauvegarder les modifications du dividende
  const saveDividendEdits = () => {
    const updatedAction = {
      ...action,
      dividendPrice: parseFloat(editDiv.dividendPrice) || 0,
      dividendDate: editDiv.dividendDate || ""
    };
    setAction(updatedAction);
    // Mettre à jour localStorage
    const storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) =>
      a.id === action.id ? updatedAction : a
    );
    localStorage.setItem("actions", JSON.stringify(updatedActions));
    setIsEditingDividend(false);
  };

  // Gérer la saisie du formulaire d'ajout
  const handleDividendInputChange = (e) => {
    setNewDividend({ ...newDividend, [e.target.name]: e.target.value });
  };

  // Ajouter un dividende
  const addDividend = () => {
    if (!newDividend.date || !newDividend.amount) return;
    const updatedDividends = [
      ...(action.dividendsHistory || []),
      { date: newDividend.date, amount: parseFloat(newDividend.amount) }
    ];
    const updatedAction = { ...action, dividendsHistory: updatedDividends };
    setAction(updatedAction);
    // Mise à jour localStorage
    const storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) =>
      a.id === action.id ? updatedAction : a
    );
    localStorage.setItem("actions", JSON.stringify(updatedActions));
    setNewDividend({ date: "", amount: "" });
    setIsDividendModalOpen(false);
  };

  // Supprimer un dividende
  const deleteDividend = (index) => {
    const updatedDividends = (action.dividendsHistory || []).filter(
      (_, i) => i !== index
    );
    const updatedAction = { ...action, dividendsHistory: updatedDividends };
    setAction(updatedAction);
    const storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    const updatedActions = storedActions.map((a) =>
      a.id === action.id ? updatedAction : a
    );
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  // Éviter de changer l'ordre des hooks : on attend que l'action soit chargée
  if (!isLoaded) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }
  if (!action || !action.name) {
    return <p className="text-center text-red-500">Action non trouvée !</p>;
  }

  return (
    <div className="p-6 min-h-screen bg-light">
      {/* Barre de navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary font-semibold hover:text-secondary transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour
        </button>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-4">
        Dividendes de {action.name}
      </h1>

      {/* Bloc d'informations sur le dividende */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
        {isEditingDividend ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <p className="text-sm text-gray-500">Dividende par action</p>
                  <input
                    type="number"
                    value={editDiv.dividendPrice}
                    onChange={(e) =>
                      setEditDiv({ ...editDiv, dividendPrice: e.target.value })
                    }
                    className="text-2xl font-bold border rounded p-1 w-32"
                  />
                  <span className="ml-1">€</span>
                </div>
                {/* Ligne verticale */}
                <div className="w-px bg-gray-300 h-12 mx-4"></div>
                <div>
                  <p className="text-sm text-gray-500">
                    Dividendes totaux attendus
                  </p>
                  <p className="text-2xl font-bold">{expectedTotalDividend}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={saveDividendEdits}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-secondary transition"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditingDividend(false)}
                  className="bg-gray-200 text-gray-800 p-2 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Date de versement prévue</p>
              <input
                type="date"
                value={editDiv.dividendDate}
                onChange={(e) =>
                  setEditDiv({ ...editDiv, dividendDate: e.target.value })
                }
                className="text-2xl font-bold border rounded p-1"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <p className="text-sm text-gray-500">Dividende par action</p>
                  <p className="text-2xl font-bold">
                    {action.dividendPrice
                      ? action.dividendPrice + "€"
                      : "Non défini"}
                  </p>
                </div>
                {/* Ligne verticale */}
                <div className="w-px bg-gray-300 h-12 mx-4"></div>
                <div>
                  <p className="text-sm text-gray-500">
                    Dividendes totaux attendus
                  </p>
                  <p className="text-2xl font-bold">{expectedTotalDividend}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingDividend(true)}
                className="text-blue-500 hover:text-blue-700 transition flex items-center ml-4"
              >
                <Pencil className="w-4 h-4 mr-1" /> Modifier
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Date de versement prévue</p>
              <p className="text-2xl font-bold">
                {action.dividendDate || "Non défini"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bloc Historique des dividendes */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Historique des dividendes
        </h2>
        <ul className="space-y-3">
          {action.dividendsHistory && action.dividendsHistory.length > 0 ? (
            action.dividendsHistory.map((div, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-2 last:border-none"
              >
                <span className="text-xs text-secondary">{div.date}</span>
                <span className="text-xl font-bold">{div.amount}€</span>
                <button
                  onClick={() => deleteDividend(index)}
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
        <div className="mt-4">
          <p className="text-sm text-gray-500">Total des dividendes reçus</p>
          <p className="text-2xl font-bold">{totalDividends}€</p>
        </div>
        <button
          onClick={() => setIsDividendModalOpen(true)}
          className="w-full bg-primary text-white p-2 rounded-2xl mt-4 hover:bg-secondary transition flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Ajouter un dividende
        </button>
      </div>

      {/* Modale pour ajouter un dividende */}
      {isDividendModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">
                Ajouter un dividende
              </h2>
              <button
                onClick={() => setIsDividendModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="date"
                name="date"
                placeholder="Date du dividende"
                value={newDividend.date}
                onChange={(e) =>
                  setNewDividend({ ...newDividend, date: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="amount"
                placeholder="Montant (€)"
                value={newDividend.amount}
                onChange={(e) =>
                  setNewDividend({ ...newDividend, amount: e.target.value })
                }
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
