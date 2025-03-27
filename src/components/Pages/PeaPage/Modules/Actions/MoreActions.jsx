import React, { useState, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Trash,
  ChevronRight,
  LineChart,
  PlusCircle,
} from "lucide-react";
import CustomSelect from "./CustomSelect";
import CustomDatePicker from "./CustomDatePickerAddAction/CustomDatePicker";
import ActionAutoComplete from "./ActionAutoComplete";
import { ActionsContext } from "../Actions/ActionsContext";
import { sectors } from "../Actions/constants/sectors";

const sectorOptions = sectors.map((sector) => ({
  value: sector === "Tous les secteurs" ? "" : sector,
  label: sector,
}));

export default function MoreActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions, addAction, deleteAction, fetchActions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];

  const [activeTab, setActiveTab] = useState("details");
  const [showPopup, setShowPopup] = useState(false);
  const [newAction, setNewAction] = useState({
    name: "",
    quantity: "",
    purchasePrice: "",
    fees: "",
    dividendPrice: "",
    dividendDate: null,
    sector: "",
    isSectorAutoFilled: false,
    history: [],
    priceHistory: [],
    dividendsHistory: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAction((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => setNewAction((prev) => ({ ...prev, dividendDate: date }));

  const handleSectorChange = (selectedValue) => {
    setNewAction((prev) => ({ 
      ...prev, 
      sector: selectedValue,
      isSectorAutoFilled: false
    }));
  };

  const handleSelectAction = async (selectedAction) => {
    try {
      const response = await fetch(`/api/stock_profile/${selectedAction.symbol}`);
      if (response.ok) {
        const profile = await response.json();
  
        setNewAction((prev) => ({
          ...prev,
          name: selectedAction.name,
          sector: profile.sector || selectedAction.sector || "",
          isSectorAutoFilled: !!profile.sector,
          dividendPrice: selectedAction.dividendPrice || "",
          dividendDate: selectedAction.dividendDate
            ? new Date(selectedAction.dividendDate)
            : null,
        }));
      } else {
        console.error("Erreur API côté backend (profil)");
      }
    } catch (error) {
      console.error("Erreur fetch côté React (profil):", error);
    }
  };

  const handleAddAction = async () => {
    if (!newAction.name || !newAction.quantity || !newAction.purchasePrice) return;

    const initialHistoryEntry = {
      date: new Date().toISOString().slice(0, 10),
      quantity: parseInt(newAction.quantity, 10),
      price: parseFloat(newAction.purchasePrice),
      fees: parseFloat(newAction.fees) || 0,
    };

    const actionToCreate = {
      name: newAction.name,
      sector: newAction.sector,
      quantity: parseInt(newAction.quantity, 10),
      purchasePrice: parseFloat(newAction.purchasePrice),
      fees: parseFloat(newAction.fees) || 0,
      dividendPrice: newAction.dividendPrice ? parseFloat(newAction.dividendPrice) : null,
      dividendDate: newAction.dividendDate,
      history: [initialHistoryEntry],
      priceHistory: newAction.priceHistory,
      dividendsHistory: newAction.dividendsHistory,
    };

    try {
      const createdAction = await addAction(actionToCreate);
      await fetchActions();
      navigate(`/DetailPage/${createdAction.id}`, {
        state: { background: location, createdAction },
      });
      setNewAction({
        name: "",
        quantity: "",
        purchasePrice: "",
        fees: "",
        dividendPrice: "",
        dividendDate: null,
        sector: "",
        isSectorAutoFilled: false,
        history: [],
        priceHistory: [],
        dividendsHistory: [],
      });
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la création de l'action :", error);
    }
  };

  const totalValorisation = useMemo(
    () =>
      actionsData.reduce((sum, action) => sum + action.quantity * action.purchasePrice, 0),
    [actionsData]
  );

  const totalBénéfice = useMemo(
    () =>
      actionsData.reduce(
        (sum, action) => sum + action.quantity * (action.purchasePrice - action.fees),
        0
      ),
    [actionsData]
  );

  const bénéficeColor = totalBénéfice >= 0 ? "text-checkgreen" : "text-checkred";

  return (
    <div className="w-full p-4 min-h-screen bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
      >
        <ArrowLeft className="w-6 h-6 text-greenLight" />
      </button>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-greenLight text-white p-4 rounded shadow-lg z-50"
          >
            Action ajoutée !
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-primary">€ Valorisation totale</h1>
        <p className="text-4xl font-extrabold mt-2">{totalValorisation.toFixed(2)}€</p>
        <p className={`text-lg font-semibold mt-1 ${bénéficeColor}`}>
          {totalBénéfice >= 0
            ? `+${totalBénéfice.toFixed(2)}€`
            : `${totalBénéfice.toFixed(2)}€`} (bénéfice)
        </p>
      </div>

      <div className="flex justify-around bg-white rounded-3xl shadow-md p-2 mb-4 border border-gray-200">
        <button
          onClick={() => setActiveTab("details")}
          className={`text-lg font-semibold transition px-4 py-2 rounded-3xl ${
            activeTab === "details" ? "text-white bg-greenLight shadow" : "text-primary"
          }`}
        >
          Détails
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`text-lg font-semibold transition px-4 py-2 rounded-3xl ${
            activeTab === "add" ? "text-white bg-greenLight shadow" : "text-primary"
          }`}
        >
          Ajouter
        </button>
      </div>

      {activeTab === "details" ? (
        <div>
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Toutes les actions
          </h2>
          <ul className="space-y-4">
            {actionsData.map((action) => (
              <motion.li
                key={action.id}
                className="flex items-center justify-between p-4 rounded-3xl shadow-sm bg-white cursor-pointer hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
                onClick={() =>
                  navigate(`/DetailPage/${action.id}`, {
                    state: { background: location, createdAction: action },
                  })
                }
              >
                <div className="flex items-center space-x-4">
                  <LineChart className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-primary font-semibold text-lg">{action.name}</p>
                    <p className="text-greenLight font-medium text-sm">
                      {action.quantity} actions
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold">{action.purchasePrice}€</p>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAction(action.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={18} />
                  </button>
                  <ChevronRight className="text-gray-400" />
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-3xl shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-primary mb-4">Ajouter une action</h2>
          <div className="space-y-3">
            <ActionAutoComplete onSelect={handleSelectAction} />

            <input
              type="number"
              name="quantity"
              placeholder="Quantité"
              value={newAction.quantity}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
            <input
              type="number"
              name="purchasePrice"
              placeholder="Prix d'achat (€)"
              value={newAction.purchasePrice}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
            
            {newAction.isSectorAutoFilled ? (
              <div className="relative">
                <input
                  type="text"
                  value={newAction.sector}
                  readOnly
                  className="w-full p-3 border rounded-3xl bg-gray-100"
                  placeholder="Secteur auto-rempli"
                />
                <button
                  type="button"
                  onClick={() => setNewAction(prev => ({
                    ...prev,
                    isSectorAutoFilled: false,
                    sector: ""
                  }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-blue-500"
                >
                  Modifier
                </button>
              </div>
            ) : (
              <CustomSelect
                name="sector"
                value={newAction.sector}
                onChange={handleSectorChange}
                options={sectorOptions}
                placeholder="Catégorie"
              />
            )}

            <input
              type="number"
              name="dividendPrice"
              placeholder="Dividende (€)"
              value={newAction.dividendPrice}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
            <div className="w-full">
              <CustomDatePicker
                selected={newAction.dividendDate}
                onChange={handleDateChange}
                placeholderText="Sélectionnez la date du dividende"
                className="w-full p-3 border rounded-3xl bg-gray-50"
              />
            </div>
            <motion.button
              onClick={handleAddAction}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-greenLight text-white p-3 rounded-3xl hover:bg-greenLight transition flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Ajouter l'action
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}