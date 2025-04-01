import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash } from "lucide-react";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import { ActionsContext } from "../../Reutilisable/ActionsContext";
import CustomSelect from "../../Reutilisable/CustomSelect";

/**
 * Formate une date ISO ("yyyy-MM-dd") en "dd/MM/yyyy".
 */
function formatIsoDate(dateString) {
  if (!dateString) return "—";
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy");
}

// Variantes d'animation pour les blocs individuels
const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const containerVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function HistoriqueOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, loading, updateAction } = useContext(ActionsContext);
  const [sortOption, setSortOption] = useState("dateAsc");

  // Options de tri
  const sortOptions = [
    { value: "dateAsc", label: "Date ↑" },
    { value: "dateDesc", label: "Date ↓" },
    { value: "priceAsc", label: "Prix ↑" },
    { value: "priceDesc", label: "Prix ↓" },
    { value: "quantityAsc", label: "Quantité ↑" },
    { value: "quantityDesc", label: "Quantité ↓" },
    { value: "totalAsc", label: "Total ↑" },
    { value: "totalDesc", label: "Total ↓" },
  ];

  // Recherche de l'action dans le contexte
  const action = useMemo(
    () => actions.find((a) => a.id === id || a.id === Number(id)),
    [actions, id]
  );

  if (loading) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }
  if (!action) {
    return <p className="text-center text-red-500">Action non trouvée !</p>;
  }

  // Tri global des achats
  const sortedHistory = useMemo(() => {
    if (!action || !action.history) return [];
    const copy = [...action.history];
    copy.sort((a, b) => {
      switch (sortOption) {
        case "dateAsc":
          return new Date(a.date) - new Date(b.date);
        case "dateDesc":
          return new Date(b.date) - new Date(a.date);
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "quantityAsc":
          return a.quantity - b.quantity;
        case "quantityDesc":
          return b.quantity - a.quantity;
        case "totalAsc": {
          const totalA = a.price * a.quantity + a.fees;
          const totalB = b.price * b.quantity + b.fees;
          return totalA - totalB;
        }
        case "totalDesc": {
          const totalA = a.price * a.quantity + a.fees;
          const totalB = b.price * b.quantity + b.fees;
          return totalB - totalA;
        }
        default:
          return 0;
      }
    });
    return copy;
  }, [action, sortOption]);

  // Groupement des achats par mois
  const groupedHistory = useMemo(() => {
    if (!sortedHistory.length) return [];
    const groups = {};
    sortedHistory.forEach((entry) => {
      const dateObj = new Date(entry.date);
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;

    const grouped = Object.entries(groups).map(([key, entries]) => {
      const [year, monthIndex] = key.split("-").map(Number);
      let label = ` ${monthNames[monthIndex]} ${year}`;
      if (key === currentKey) label = "Ce mois-ci";
      else if (key === prevKey) label = "Le mois dernier";
      return { key, label, entries };
    });
    grouped.sort((a, b) => {
      const [yearA, monthA] = a.key.split("-").map(Number);
      const [yearB, monthB] = b.key.split("-").map(Number);
      return yearB - yearA || monthB - monthA;
    });
    return grouped;
  }, [sortedHistory]);

  const deletePurchase = (index) => {
    if (!action) return;
    const updatedHistory = action.history.filter((_, i) => i !== index);
    const updatedAction = { ...action, history: updatedHistory };
    updateAction(action.id, updatedAction);
  };

  return (
    <motion.div
      className="p-4 min-h-screen bg-gray-50"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Barre de navigation */}
      <motion.header
        className="flex items-center mb-4"
        variants={sectionVariants}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <motion.h1
          className="ml-4 text-2xl font-bold text-secondary"
          variants={sectionVariants}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Retour
        </motion.h1>
      </motion.header>

      {/* Titre principal */}
      <motion.h1
        className="text-3xl font-bold text-secondary mb-4"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Historique d'achats –{" "}
        <span className="text-greenLight inline-block">{action.name}</span>
      </motion.h1>

      {/* Sélecteur de tri */}
      <motion.div
        className="mb-4 flex items-center space-x-2"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <label className="text-gray-600 text-sm font-medium">Trier par :</label>
        <div className="w-1/2">
          <CustomSelect
            name="sortOption"
            value={sortOption}
            onChange={setSortOption}
            options={sortOptions}
            placeholder="Trier par"
            className="p-2 text-sm"
            dropdownClassName="w-full"
          />
        </div>
      </motion.div>

      {/* Groupement par mois */}
      <motion.div
        className="space-y-6"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {groupedHistory.length > 0 ? (
          groupedHistory.map((group) => (
            <motion.div
              key={group.key}
              className="space-y-4"
              variants={sectionVariants}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">{group.label}</h2>
              <div className="space-y-3">
                {group.entries.map((entry, index) => {
                  const total = entry.quantity * entry.price + entry.fees;
                  const average =
                    entry.quantity > 0 ? (total / entry.quantity).toFixed(2) : "0.00";
                  return (
                    <motion.div
                      key={index}
                      className="bg-white border-l-4 border-greenLight shadow-xl rounded-3xl p-4 text-sm flex flex-col gap-1"
                      whileHover={{ scale: 1.02 }}
                      variants={sectionVariants}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {entry.date ? formatIsoDate(entry.date) : "—"}
                        </span>
                        <button
                          onClick={() => deletePurchase(index)}
                          className="text-checkred hover:text-red-700 transition"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="text-gray-700 flex flex-wrap gap-2">
                        <p>
                          <span className="font-semibold">Quantité :</span> {entry.quantity}
                        </p>
                        <p>
                          <span className="font-semibold">Prix unitaire :</span> {entry.price}€
                        </p>
                        <p>
                          <span className="font-semibold">Frais :</span> {entry.fees}€
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-gray-600">
                        <p>
                          <span className="font-semibold">Total :</span>{" "}
                          <span className="text-teal-700 font-bold">{total.toFixed(2)}€</span>
                        </p>
                        <p>
                          <span className="font-semibold">Prix moyen :</span>{" "}
                          <span className="text-teal-700 font-bold">{average}€</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p className="text-gray-500" variants={sectionVariants}>
            Aucun achat enregistré.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}