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
import CustomSelect from "./Reutilisable/CustomSelect";
import { ActionsContext } from "./Reutilisable/ActionsContext";

/* ---------- Card locale : relief marqué (pas d'import externe) ---------- */
function Card({ children, className = "", interactive = false, elevation = "md", ...rest }) {
  const shadow =
    elevation === "lg"
      ? "shadow-[0_22px_50px_-12px_rgba(0,0,0,0.8)]"
      : elevation === "sm"
      ? "shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
      : "shadow-[0_14px_34px_-12px_rgba(0,0,0,0.7)]";

  return (
    <div
      className={[
        "relative rounded-3xl overflow-hidden p-4",
        "bg-gradient-to-br from-[#111821] via-[#0f1620] to-[#0b1118]",
        "border border-white/10",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/15",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/40",
        shadow,
        "ring-1 ring-black/10",
        interactive && "transition-transform duration-200 will-change-transform hover:-translate-y-[2px]",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_60%)]" />
      {children}
    </div>
  );
}

/* ---------- Modal Filtres (styles harmonisés + onChange fix) ---------- */
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="w-4/5 max-w-md"
      >
        <Card elevation="lg" className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-bold text-gray-100 mb-4">Filtres</h3>

          <input
            type="text"
            placeholder="Rechercher une action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 mb-3 rounded-3xl text-gray-100 bg-gray-700/95 border border-gray-600 shadow-md focus:shadow-lg focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-[#0b1118] transition"
          />

          <input
            type="number"
            placeholder="Min quantité"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            className="w-full px-4 py-3 mb-3 rounded-3xl text-gray-100 bg-gray-700/95 border border-gray-600 shadow-md focus:shadow-lg focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-[#0b1118] transition"
          />

          <div className="mb-3">
            <CustomSelect
              name="selectedSector"
              value={selectedSector}
              onChange={(v) => setSelectedSector(v)} 
              options={[
                { value: "", label: "Tous les secteurs" },
                { value: "Tech", label: "Tech" },
                { value: "E-commerce", label: "E-commerce" },
                { value: "Finance", label: "Finance" },
              ]}
              placeholder="Secteur"
              className="bg-gray-800/95 text-gray-100 border border-gray-600 rounded-3xl shadow-md focus:shadow-lg focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-[#0b1118] transition"
              dropdownClassName="bg-gray-800/95"
            />
          </div>

          <CustomSelect
            name="performanceFilter"
            value={performanceFilter}
            onChange={(v) => setPerformanceFilter(v)} 
            options={[
              { value: "", label: "Toutes les variations", icon: <Filter className="w-4 h-4 text-gray-400" /> },
              { value: "Hausses", label: "Hausses", icon: <ChevronUp className="w-4 h-4 text-checkgreen" /> },
              { value: "Baisses", label: "Baisses", icon: <ChevronDown className="w-4 h-4 text-checkred" /> },
              { value: "Stable", label: "Stable", icon: <Minus className="w-4 h-4 text-gray-400" /> },
            ]}
            placeholder="Performance"
            className="bg-gray-800/95 text-gray-100 border border-gray-600 rounded-3xl shadow-md focus:shadow-lg focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-[#0b1118] transition"
            dropdownClassName="bg-gray-800/95"
          />

          <button
            onClick={onClose}
            className={[
              "relative w-full mt-4 px-6 py-3 rounded-3xl font-medium text-white",
              "bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg",
              "focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-[#0b1118] focus:shadow-xl transition",
            ].join(" ")}
          >
            <span className="relative z-10">Appliquer</span>
            <span className="pointer-events-none absolute inset-x-2 bottom-0 h-1 rounded-full bg-black/20 blur-[2px]" />
          </button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function PeaTopActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useContext(ActionsContext);
  const actionsData = Array.isArray(actions) ? actions : [];

  const [displayMode, setDisplayMode] = useState("percent");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("");

  const filteredActions = useMemo(() => {
    return actionsData
      .filter((action) => {
        if (!action.name) return false;
        if (!action.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (minQuantity && action.quantity < parseInt(minQuantity, 10)) return false;
        if (selectedSector && action.sector !== selectedSector) return false;
        const change = action.change ?? 0;
        if (performanceFilter === "Hausses" && change <= 0) return false;
        if (performanceFilter === "Baisses" && change >= 0) return false;
        if (performanceFilter === "Stable" && change !== 0) return false;
        return true;
      })
      .slice(0, 5);
  }, [actionsData, searchTerm, minQuantity, selectedSector, performanceFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Carte principale (titre + liste) */}
      <Card elevation="lg" className="p-4">
        <div className="flex items-center justify-between p-1">
          <h2 className="text-lg font-bold text-gray-100 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 ml-2 text-gray-100" /> Top 5 Actions
          </h2>
          <button
            onClick={() => setShowFilters(true)}
            className="text-gray-400 hover:text-gray-100 transition"
          >
            <Settings className="w-5 h-5 mr-2" />
          </button>
        </div>

        {/* Liste : chaque ligne devient une mini-card clickable */}
        <ul className="space-y-3 mt-3">
          {filteredActions.map((action) => {
            const change = action.change ?? 0;
            const currentPrice = action.currentPrice ?? 0;
            const price = action.price ?? 0;
            const quantity = action.quantity ?? 0;

            const goToDetail = () =>
              navigate(`/DetailPage/${action.id}`, { state: { background: location } });

            return (
              <motion.li
                key={action.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                onClick={goToDetail}
              >
                <Card
                  interactive
                  elevation="md"
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 font-medium">{action.name}</p>
                      <p className="text-greenLight text-sm font-bold">{quantity} actions</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end">
                        <p className="text-lg font-medium text-gray-100">{currentPrice}€</p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDisplayMode(displayMode === "percent" ? "euro" : "percent");
                          }}
                          className={[
                            "flex items-center justify-center text-sm font-medium transition-transform duration-200",
                            change > 0 ? "text-checkgreen" : "text-checkred",
                          ].join(" ")}
                        >
                          {change > 0 ? (
                            <ChevronUp className="w-4 h-4 mr-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mr-1" />
                          )}
                          {displayMode === "percent"
                            ? `${change.toFixed(1)}%`
                            : `${((currentPrice - price) * quantity).toFixed(2)}€`}
                        </button>
                      </div>

                      <ChevronRight className="text-gray-400" />
                    </div>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </ul>

        {/* CTA bas */}
        <div className="relative mt-4 flex justify-center">
          <button
            onClick={() => navigate("/MoreActions")}
            className="relative px-6 py-2 rounded-3xl font-medium text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
          >
            <span className="relative z-10">Voir plus →</span>
            <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-black/20 blur-[2px]" />
          </button>
        </div>
      </Card>

      {/* Modal filtres */}
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
    </motion.div>
  );
}
