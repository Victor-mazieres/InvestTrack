import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, Pencil, Trash, ChevronRight, LineChart, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MoreActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [actions, setActions] = useState([]);

  // Charger les actions depuis localStorage
  useEffect(() => {
    const storedActions = JSON.parse(localStorage.getItem("actions")) || [];
    setActions(storedActions);
  }, []);

  // Ajout des nouveaux critères : dividende et date du dividende, ainsi qu'une catégorie (sector)
  const [newAction, setNewAction] = useState({
    name: "",
    quantity: "",
    price: "",
    fees: "",
    dividend: "",
    dividendDate: "",
    sector: "Non défini"
  });

  // Gérer la saisie du formulaire
  const handleInputChange = (e) => {
    setNewAction({ ...newAction, [e.target.name]: e.target.value });
  };

  // Ajouter une action
  const addAction = () => {
    if (!newAction.name || !newAction.quantity || !newAction.price) return;

    const newActionsList = [...actions, { ...newAction, id: Date.now() }];
    setActions(newActionsList);
    localStorage.setItem("actions", JSON.stringify(newActionsList));

    setNewAction({
      name: "",
      quantity: "",
      price: "",
      fees: "",
      dividend: "",
      dividendDate: "",
      sector: "Non défini"
    });
  };

  // Supprimer une action
  const deleteAction = (id) => {
    const updatedActions = actions.filter((action) => action.id !== id);
    setActions(updatedActions);
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  // Calculer la valorisation totale et le bénéfice
  const totalValorisation = actions.reduce((sum, action) => sum + action.quantity * action.price, 0);
  const totalBénéfice = actions.reduce((sum, action) => sum + (action.quantity * (action.price - action.fees)), 0);
  const bénéficeColor = totalBénéfice >= 0 ? "text-checkgreen" : "text-checkred";

  return (
    <div className="w-full p-4 min-h-screen bg-gray-100">
      {/* Valorisation & Bénéfice */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-primary flex items-center justify-center">
          <span className="text-xl font-bold text-primary">€ Valorisation totale</span>
        </h1>
        <p className="text-4xl font-extrabold mt-2">{totalValorisation.toFixed(2)}€</p>
        <p className={`text-lg font-semibold mt-1 ${bénéficeColor}`}>
          {totalBénéfice >= 0 ? `+${totalBénéfice.toFixed(2)}€` : `${totalBénéfice.toFixed(2)}€`} (bénéfice)
        </p>
      </div>

      {/* Onglets */}
      <div className="flex justify-around bg-white rounded-xl shadow-md p-3 mb-4 border border-gray-200">
        <button
          onClick={() => setActiveTab("details")}
          className={`text-lg font-semibold transition px-4 py-2 rounded-md ${activeTab === "details" ? "text-primary bg-gray-100 shadow" : "text-gray-500"}`}
        >
          Détails
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`text-lg font-semibold transition px-4 py-2 rounded-md ${activeTab === "add" ? "text-primary bg-gray-100 shadow" : "text-gray-500"}`}
        >
          Ajouter
        </button>
      </div>

      {/* Liste des actions */}
      {activeTab === "details" && (
        <div>
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Toutes les actions
          </h2>
          <ul className="space-y-4">
            {actions.map((action) => (
              <motion.li
                key={action.id}
                className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
                onClick={() =>
                  navigate(`/DetailPage/${action.id}`, {
                    state: {
                      background: {
                        pathname: location.pathname,
                        search: location.search,
                        hash: location.hash,
                      },
                    },
                  })
                }
              >
                {/* Infos */}
                <div className="flex items-center space-x-4">
                  <LineChart className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-primary font-semibold text-lg">{action.name}</p>
                    <p className="text-gray-600 font-medium text-sm">{action.quantity} actions</p>
                  </div>
                </div>

                {/* Prix */}
                <div className="text-right">
                  <p className="text-lg font-bold">{action.price}€</p>
                </div>

                {/* Modifier / Supprimer */}
                <div className="flex space-x-2">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAction(action.id);
                    }}
                  >
                    <Trash size={18} />
                  </button>
                  <ChevronRight className="text-gray-400" />
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {activeTab === "add" && (
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-primary mb-4">Ajouter une action</h2>
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Nom de l'action"
              value={newAction.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantité"
              value={newAction.quantity}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            <input
              type="number"
              name="price"
              placeholder="Prix d'achat (€)"
              value={newAction.price}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            {/* Sélection de la catégorie */}
            <select
              name="sector"
              value={newAction.sector}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            >
              <option value="Non défini">Catégorie</option>
              <option value="Technologie">Technologie</option>
              <option value="Finance">Finance</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Santé">Santé</option>
              <option value="Autre">Autre</option>
            </select>
            {/* Champ Dividende */}
            <input
              type="number"
              name="dividend"
              placeholder="Dividende (€)"
              value={newAction.dividend}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            {/* Champ Date du dividende */}
            <input
              type="date"
              name="dividendDate"
              placeholder="Date du dividende"
              value={newAction.dividendDate}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            <motion.button
              onClick={addAction}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-secondary transition flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Ajouter l'action
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
