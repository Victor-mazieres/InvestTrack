import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp,
  Trash,
  ChevronRight,
  LineChart,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Composant CustomSelect pour un dropdown stylisé uniformément
const CustomSelect = ({ name, value, onChange, options, placeholder = "Catégorie" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full p-3 border rounded-3xl bg-gray-50 flex justify-between items-center focus:outline-none"
      >
        <span>{selectedLabel || placeholder}</span>
        <svg
          className="w-4 h-4 ml-2 text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-3xl shadow-lg z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-3xl"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant CustomDatePicker utilisant react-datepicker
const CustomDatePicker = ({ selected, onChange, placeholderText }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      className="w-full p-3 border rounded-3xl bg-gray-50"
      calendarClassName="fixed-calendar rounded-3xl shadow-lg border border-gray-200"
      wrapperClassName="w-full"
      popperPlacement="bottom"
      showYearDropdown
      yearDropdownItemNumber={5}
      scrollableYearDropdown
      showMonthDropdown
    />
  );
};



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

  // État du formulaire d'ajout
  const [newAction, setNewAction] = useState({
    name: "",
    quantity: "",
    price: "",
    fees: "",
    dividend: "",
    dividendDate: null, // Utilise null pour aucune date sélectionnée
    sector: "Non défini",
  });

  const handleInputChange = (e) => {
    setNewAction({ ...newAction, [e.target.name]: e.target.value });
  };

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
      dividendDate: null,
      sector: "Non défini",
    });
  };

  const deleteAction = (id) => {
    const updatedActions = actions.filter((action) => action.id !== id);
    setActions(updatedActions);
    localStorage.setItem("actions", JSON.stringify(updatedActions));
  };

  const totalValorisation = actions.reduce(
    (sum, action) => sum + action.quantity * action.price,
    0
  );
  const totalBénéfice = actions.reduce(
    (sum, action) => sum + action.quantity * (action.price - action.fees),
    0
  );
  const bénéficeColor = totalBénéfice >= 0 ? "text-checkgreen" : "text-checkred";

  const sectorOptions = [
    { value: "Non défini", label: "Catégorie" },
    { value: "Technologie", label: "Technologie" },
    { value: "Finance", label: "Finance" },
    { value: "E-commerce", label: "E-commerce" },
    { value: "Santé", label: "Santé" },
    { value: "Autre", label: "Autre" },
  ];

  return (
    <div className="w-full p-4 min-h-screen bg-gray-100">
      {/* Valorisation & Bénéfice */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-primary flex items-center justify-center">
          <span className="text-xl font-bold text-primary">€ Valorisation totale</span>
        </h1>
        <p className="text-4xl font-extrabold mt-2">{totalValorisation.toFixed(2)}€</p>
        <p className={`text-lg font-semibold mt-1 ${bénéficeColor}`}>
          {totalBénéfice >= 0
            ? `+${totalBénéfice.toFixed(2)}€`
            : `${totalBénéfice.toFixed(2)}€`} (bénéfice)
        </p>
      </div>

      {/* Onglets */}
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
                <div className="flex items-center space-x-4">
                  <LineChart className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-primary font-semibold text-lg">{action.name}</p>
                    <p className="text-gray-600 font-medium text-sm">{action.quantity} actions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{action.price}€</p>
                </div>
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
        <div className="p-6 bg-white rounded-3xl shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-primary mb-4">Ajouter une action</h2>
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Nom de l'action"
              value={newAction.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />
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
              name="price"
              placeholder="Prix d'achat (€)"
              value={newAction.price}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />

            {/* CustomSelect pour la catégorie */}
            <CustomSelect
              name="sector"
              value={newAction.sector}
              onChange={handleInputChange}
              options={sectorOptions}
              placeholder="Catégorie"
            />

            <input
              type="number"
              name="dividend"
              placeholder="Dividende (€)"
              value={newAction.dividend}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-3xl bg-gray-50"
            />

            {/* Utilisation du CustomDatePicker pour la date du dividende */}
            <div className="w-full">
              <CustomDatePicker
                selected={newAction.dividendDate}
                onChange={(date) =>
                  setNewAction({ ...newAction, dividendDate: date })
                }
                placeholderText="Sélectionnez la date du dividende"
              />
            </div>

            <motion.button
              onClick={addAction}
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
