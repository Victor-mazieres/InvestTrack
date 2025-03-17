import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Settings,
  X,
  ChevronRight,
  Trash,
  Minus,
  Filter,
  LineChart,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allActions = [
  { id: 1, name: "Tesla", quantity: 15, price: 850, currentPrice: 890, change: 4.7, sector: "Tech" },
  { id: 2, name: "Apple", quantity: 10, price: 1200, currentPrice: 1180, change: -1.7, sector: "Tech" },
  { id: 3, name: "Amazon", quantity: 8, price: 950, currentPrice: 970, change: 2.1, sector: "E-commerce" },
  { id: 4, name: "Microsoft", quantity: 12, price: 1100, currentPrice: 1125, change: 2.3, sector: "Tech" },
  { id: 5, name: "Google", quantity: 5, price: 1050, currentPrice: 1020, change: -2.9, sector: "Tech" },
  { id: 6, name: "Meta", quantity: 7, price: 880, currentPrice: 920, change: 4.5, sector: "Tech" },
  { id: 7, name: "Nvidia", quantity: 4, price: 2100, currentPrice: 2150, change: 2.4, sector: "Tech" },
  { id: 8, name: "JP Morgan", quantity: 6, price: 1300, currentPrice: 1280, change: -1.5, sector: "Finance" },
];

// Composant CustomSelect pour un dropdown stylisé avec icônes
const CustomSelect = ({ name, value, onChange, options, placeholder = "Sélectionnez" }) => {
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

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleOptionClick = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full p-3 border rounded-3xl bg-gray-50 flex justify-between items-center focus:outline-none"
      >
        <span>{selectedLabel || placeholder}</span>
        <svg className="w-4 h-4 ml-2 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-3xl shadow-lg z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-3xl flex items-center space-x-2"
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function PeaTopActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayMode, setDisplayMode] = useState("percent");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("");

  // Filtrer les actions selon les critères
  const filteredActions = allActions
    .filter((action) => action.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((action) => (minQuantity ? action.quantity >= parseInt(minQuantity) : true))
    .filter((action) => (selectedSector ? action.sector === selectedSector : true))
    .filter((action) => {
      if (performanceFilter === "Hausses") return action.change > 0;
      if (performanceFilter === "Baisses") return action.change < 0;
      if (performanceFilter === "Stable") return action.change === 0;
      return true;
    })
    .slice(0, 5);

  return (
    <div className="w-full p-4 relative">
      {/* Titre avec icône et engrenage */}
      <div className="flex items-center justify-between p-3 bg-white rounded-3xl shadow-lg">
        <h2 className="text-lg font-bold text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 ml-2 text-primary" /> Top 5 Actions
        </h2>
        <button onClick={() => setShowFilters(true)} className="text-gray-600 hover:text-primary transition">
          <Settings className="w-5 h-5 mr-2" />
        </button>
      </div>

      {/* Liste des actions */}
      <ul className="space-y-4 mt-3 relative">
        {filteredActions.map((action) => (
          <motion.li
            key={action.id}
            className="flex items-center justify-between p-3 rounded-3xl shadow-sm transition-all duration-300 cursor-pointer hover:bg-gray-100"
            whileHover={{ scale: 1.02 }}
            onClick={() =>
              navigate(`/DetailPage/${action.id}`, { state: { background: location } })
            }
          >
            <div>
              <p className="text-primary font-medium ">{action.name}</p>
              <p className="text-greenLight text-sm font-bold ">{action.quantity} actions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-end">
                <p className="text-lg font-medium">{action.currentPrice}€</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode(displayMode === "percent" ? "euro" : "percent");
                  }}
                  className={`flex items-center justify-center text-sm font-medium transition-transform duration-200 ${
                    action.change > 0 ? "text-checkgreen" : "text-checkred"
                  }`}
                >
                  {action.change > 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  {displayMode === "percent"
                    ? `${action.change.toFixed(1)}%`
                    : `${((action.currentPrice - action.price) * action.quantity).toFixed(2)}€`}
                </button>
              </div>
              <ChevronRight className="text-gray-400" />
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Bouton Voir Plus */}
      <div className="relative mt-4 flex justify-center">
        <button onClick={() => navigate("/MoreActions")} className="text-greenLight font-semibold hover:text-secondary transition text-base">
          Voir plus →
        </button>
      </div>

      {/* Fenêtre pop-up des filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-lg p-6 w-4/5 max-w-md relative"
            >
              {/* Bouton de fermeture */}
              <button onClick={() => setShowFilters(false)} className="absolute top-3 right-3 text-gray-600 hover:text-primary">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-primary mb-4">Filtres</h3>

              {/* Filtre par nom */}
              <input
                type="text"
                placeholder="Rechercher une action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-3xl mb-3"
              />

              {/* Filtre par quantité */}
              <input
                type="number"
                placeholder="Min quantité"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full p-2 border rounded-3xl mb-3"
              />

              {/* Filtre par secteur avec CustomSelect */}
              <div className="mb-3">
                <CustomSelect
                  name="selectedSector"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  options={[
                    { value: "", label: "Tous les secteurs" },
                    { value: "Tech", label: "Tech" },
                    { value: "E-commerce", label: "E-commerce" },
                    { value: "Finance", label: "Finance" },
                  ]}
                  placeholder="Secteur"
                />
              </div>

              {/* Filtre par performance avec CustomSelect et icônes */}
              <CustomSelect
                name="performanceFilter"
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                options={[
                  { value: "", label: "Toutes les variations", icon: <Filter className="w-4 h-4 text-gray-600" /> },
                  { value: "Hausses", label: "Hausses", icon: <ChevronUp className="w-4 h-4 text-checkgreen" /> },
                  { value: "Baisses", label: "Baisses", icon: <ChevronDown className="w-4 h-4 text-checkred" /> },
                  { value: "Stable", label: "Stable", icon: <Minus className="w-4 h-4 text-gray-600" /> },
                ]}
                placeholder="Performance"
              />

              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-greenLight text-white p-2 rounded-3xl hover:bg-greenLight transition mt-4"
              >
                Appliquer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
