import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Search,
  Save,
  RotateCcw,
  CircleCheck,
  LayoutGrid,
  Receipt,
  TrendingUp,
  FileText,
  Building2,
} from "lucide-react";
// nouveaux icônes pour les items ajoutés
import {
  Percent,
  CreditCard,
  Calculator,
  Ruler,
  Banknote,
  Landmark,
  Shield,
  ArrowDownCircle,
} from "lucide-react";
import PrimaryButton from '../../../Reutilisable/PrimaryButton';

const STORAGE_KEY = "dashboardImmobilierSelection:v1";

// ---- Widgets demandés ----
const WIDGETS = [
  { id: "loyerHC",        title: "Loyer HC",             description: "Loyer hors charges encaissé",               icon: Receipt },
  { id: "interets",       title: "Intérêts",             description: "Intérêts d’emprunt (mois/année)",          icon: Percent },
  { id: "mensualites",    title: "Mensualités",          description: "Échéance de prêt versée",                  icon: CreditCard },
  { id: "cashflowMensuel",title: "Cash flow mensuel",    description: "Recettes - dépenses (mois)",               icon: TrendingUp },
  { id: "cashflowAnnuel", title: "Cash flow annuel",     description: "Recettes - dépenses (année)",              icon: FileText },
  { id: "taxeFonciere",   title: "Taxe foncière",        description: "Montant annuel / mensualisé",              icon: Landmark },
  { id: "assurancePNO",   title: "Assurance PNO",        description: "Prime propriétaire non-occupant",          icon: Shield },
  { id: "chargesCopro",   title: "Charges de copropriété", description: "Appels de fonds / charges courantes",   icon: Building2 },
  { id: "surface",        title: "Surface",              description: "Surface habitable (m²)",                    icon: Ruler },
  { id: "montantEmprunte",title: "Montant emprunté",     description: "Capital initial emprunté",                 icon: Banknote },
  { id: "totalSorties",   title: "Total sorties",        description: "Somme des dépenses mensuelles",            icon: ArrowDownCircle },
  { id: "impotMensuel",   title: "Impôt mensuel",        description: "Estimation impôt / mois",                  icon: Calculator },
  { id: "impotAnnuel",    title: "Impôt annuel",         description: "Estimation impôt / an",                    icon: FileText },
];

// ---- Presets utiles ----
const PRESETS = {
  essentiels: ["loyerHC", "mensualites", "interets", "cashflowMensuel", "totalSorties"],
  fiscalite: ["impotMensuel", "impotAnnuel", "taxeFonciere"],
  structure: ["surface", "montantEmprunte", "chargesCopro", "assurancePNO"],
};

export default function DashboardImmobilierSelection({ onSave }) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : ["loyerHC", "mensualites", "interets", "cashflowMensuel", "totalSorties"]; // valeurs par défaut
    } catch {
      return ["loyerHC", "mensualites", "interets", "cashflowMensuel", "totalSorties"];
    }
  });

  // Persistance automatique
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectAll = () => setSelected(WIDGETS.map((w) => w.id));
  const clearAll = () => setSelected([]);

  const applyPreset = (key) => {
    const items = PRESETS[key] || [];
    setSelected(items);
  };

  const handleSave = () => {
    if (onSave) onSave(selected);
    navigate(-1); // retour à la page précédente (ferme la modale si tu l’ouvres en modal)
  };

  const filtered = React.useMemo(() => {
    if (!query.trim()) return WIDGETS;
    const q = query.toLowerCase();
    return WIDGETS.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen text-gray-100 flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="text-2xl font-bold text-white">Sélection Dashboard Immobilier</h1>
      </div>

      {/* Barre d'actions */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-3xl px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un module (ex: loyer, impôt, cash flow...)"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-500"
          />
        </div>
        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          <PresetButton label="Essentiels" onClick={() => applyPreset("essentiels")} />
          <PresetButton label="Fiscalité" onClick={() => applyPreset("fiscalite")} />
          <PresetButton label="Structure" onClick={() => applyPreset("structure")} />
        </div>
      </div>

      {/* Boutons globaux */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <ActionButton onClick={selectAll} icon={LayoutGrid} label="Tout sélectionner" />
        <ActionButton onClick={clearAll} icon={RotateCcw} label="Tout désélectionner" />
        <PrimaryButton onClick={handleSave} icon={Save}>  Enregistrer</PrimaryButton>
      </div>

      {/* Grille de widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {filtered.map((w) => (
          <WidgetCard
            key={w.id}
            widget={w}
            selected={selected.includes(w.id)}
            onToggle={() => toggle(w.id)}
          />
        ))}
      </div>

      {/* Résumé sélection */}
      <div className="mt-auto bg-gray-800 rounded-3xl p-4 text-sm text-gray-300">
        <div className="flex items-center gap-2 mb-2">
          <CircleCheck className="w-5 h-5" />
          <span>
            {selected.length} module{selected.length > 1 ? "s" : ""} sélectionné
            {selected.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => (
            <span key={id} className="px-2 py-1 rounded-full bg-gray-700 text-gray-200 text-xs">
              {WIDGETS.find((w) => w.id === id)?.title || id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetCard({ widget, selected, onToggle }) {
  const Icon = widget.icon;
  return (
    <button
      onClick={onToggle}
      className={`group w-full text-left rounded-3xl p-4 border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-greenLight/40 ${
        selected ? "bg-gray-700/80 border-greenLight/40" : "bg-gray-800 border-gray-700 hover:bg-gray-700"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-2xl p-2 ${selected ? "bg-gray-800" : "bg-gray-700"}`}>
          <Icon className="w-6 h-6 text-gray-200" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white">{widget.title}</h3>
            {selected && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Actif
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{widget.description}</p>
        </div>
      </div>
    </button>
  );
}

function ActionButton({ onClick, icon: Icon, label, intent = "neutral" }) {
  const base =
    "inline-flex items-center gap-2 rounded-3xl px-4 py-4 text-sm transition focus:outline-none focus:ring-2";
  const styles =
    intent === "primary"
      ? "bg-greenLight/90 text-black hover:bg-greenLight focus:ring-greenLight/40"
      : "bg-gray-800 text-gray-100 hover:bg-gray-700 focus:ring-gray-600/40";
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function PresetButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700"
    >
      {label}
    </button>
  );
}

/**
 * Helper pour récupérer la sélection ailleurs dans l'appli
 * import { getDashboardSelection } from "./DashboardImmobilierSelection";
 */
export function getDashboardSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
