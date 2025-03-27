import { useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Settings,
  X,
  ChevronRight,
  Minus,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "./Actions/CustomSelect";
import { ActionsContext } from "./Actions/ActionsContext";

// Composant extrait pour la modale de filtres
function FiltersModal({
  searchTerm,
  setSearchTerm,
  minQuantity,
  setMinQuantity,
  selectedSector,
  setSelectedSector,
  performanceFilter,
  setPerformanceFilter,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-lg p-6 w-4/5 max-w-md relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-primary">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-primary mb-4">Filtres</h3>
        <input
          type="text"
          placeholder="Rechercher une action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-3xl mb-3"
        />
        <input
          type="number"
          placeholder="Min quantité"
          value={minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
          className="w-full p-2 border rounded-3xl mb-3"
        />
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
          onClick={onClose}
          className="w-full bg-greenLight text-white p-2 rounded-3xl hover:bg-greenLight transition mt-4"
        >
          Appliquer
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PeaTopActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];

  // États locaux
  const [displayMode, setDisplayMode] = useState("percent");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("");

  // Utilisation de useMemo pour recalculer uniquement si un des critères change
  const filteredActions = useMemo(() => {
    return actionsData.filter((action) => {
      if (!action.name) return false;
      if (!action.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (minQuantity && action.quantity < parseInt(minQuantity, 10)) return false;
      if (selectedSector && action.sector !== selectedSector) return false;
      const change = action.change ?? 0;
      if (performanceFilter === "Hausses" && change <= 0) return false;
      if (performanceFilter === "Baisses" && change >= 0) return false;
      if (performanceFilter === "Stable" && change !== 0) return false;
      return true;
    }).slice(0, 5);
  }, [actionsData, searchTerm, minQuantity, selectedSector, performanceFilter]);

  return (
    <div className="w-full p-4 relative">
      {/* En-tête */}
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
        {filteredActions.map((action) => {
          const change = action.change ?? 0;
          const currentPrice = action.currentPrice ?? 0;
          const price = action.price ?? 0;
          const quantity = action.quantity ?? 0;
          return (
            <motion.li
              key={action.id}
              className="flex items-center justify-between p-3 rounded-3xl shadow-sm transition-all duration-300 cursor-pointer hover:bg-gray-100"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/DetailPage/${action.id}`, { state: { background: location } })}
            >
              <div>
                <p className="text-primary font-medium">{action.name}</p>
                <p className="text-greenLight text-sm font-bold">{quantity} actions</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col items-end">
                  <p className="text-lg font-medium">{currentPrice}€</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisplayMode(displayMode === "percent" ? "euro" : "percent");
                    }}
                    className={`flex items-center justify-center text-sm font-medium transition-transform duration-200 ${
                      change > 0 ? "text-checkgreen" : "text-checkred"
                    }`}
                  >
                    {change > 0 ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    {displayMode === "percent"
                      ? `${change.toFixed(1)}%`
                      : `${((currentPrice - price) * quantity).toFixed(2)}€`}
                  </button>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </motion.li>
          );
        })}
      </ul>

      {/* Bouton Voir plus */}
      <div className="relative mt-4 flex justify-center">
        <button onClick={() => navigate("/MoreActions")} className="text-greenLight font-semibold hover:text-secondary transition text-base">
          Voir plus →
        </button>
      </div>

      {/* Affichage conditionnel de la modale des filtres */}
      <AnimatePresence>
        {showFilters && (
          <FiltersModal
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            minQuantity={minQuantity}
            setMinQuantity={setMinQuantity}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            performanceFilter={performanceFilter}
            setPerformanceFilter={setPerformanceFilter}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
