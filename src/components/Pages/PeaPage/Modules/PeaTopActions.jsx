import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronUp, ChevronDown, TrendingUp, Settings, X } from "lucide-react";
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

export default function PeaTopActions() {
  const navigate = useNavigate();
  const location = useLocation(); // Important pour récupérer la localisation actuelle
  const [displayMode, setDisplayMode] = useState("percent");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("");

  // Actions filtrées selon les critères
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
      <div className="flex items-center justify-between p-2 bg-white rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Top 5 Actions
        </h2>
        <button onClick={() => setShowFilters(true)} className="text-gray-600 hover:text-primary transition">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Liste des actions */}
      <ul className="space-y-4 mt-3 relative">
        {filteredActions.map((action) => (
          <li
            key={action.id}
            className="flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-300 cursor-pointer hover:bg-gray-100"
            // Transmission de la localisation actuelle pour que la modal connaisse le background
            onClick={() => navigate(`/DetailPage/${action.id}`, { state: { background: location } })}
          >
            {/* Nom de l'action */}
            <div>
              <p className="text-primary font-semibold">{action.name}</p>
              <p className="text-greenLight text-sm font-bold">{action.quantity} actions</p>
            </div>

            {/* Prix + Variation */}
            <div className="text-right">
              <p className="text-lg font-bold">{action.currentPrice}€</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDisplayMode(displayMode === "percent" ? "euro" : "percent");
                }}
                className={`flex items-center text-sm font-medium transition-transform duration-200 ${
                  action.change > 0 ? "text-checkgreen" : "text-checkred"
                }`}
              >
                {action.change > 0 ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {displayMode === "percent"
                  ? `${action.change.toFixed(1)}%`
                  : `${((action.currentPrice - action.price) * action.quantity).toFixed(2)}€`}
              </button>
            </div>
          </li>
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
              className="bg-white rounded-lg shadow-lg p-6 w-4/5 max-w-md relative"
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
                className="w-full p-2 border rounded mb-3"
              />

              {/* Filtre par quantité */}
              <input
                type="number"
                placeholder="Min quantité"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full p-2 border rounded mb-3"
              />

              {/* Filtre par secteur */}
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full p-2 border rounded mb-3"
              >
                <option value="">Tous les secteurs</option>
                <option value="Tech">Tech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Finance">Finance</option>
              </select>

              {/* Filtre par performance */}
              <select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Toutes les variations</option>
                <option value="Hausses">Hausses</option>
                <option value="Baisses">Baisses</option>
                <option value="Stable">Stable</option>
              </select>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-primary text-white p-2 rounded-lg hover:bg-secondary transition"
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
