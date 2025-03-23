// SavedCalculations.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Save } from "lucide-react"; // Import de l'icône Save

const SavedCalculations = () => {
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSimulations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/simulations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedCalculations(data);
      } else {
        console.error("Erreur:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des simulations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/simulations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedCalculations(savedCalculations.filter((sim) => sim.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex flex-col h-full p-6 box-border">
      {/* Header fixe avec icône à gauche du titre */}
      <header className="mb-4 p-3 flex items-center bg-white rounded-3xl shadow-lg">
        <Save className="w-5 h-5 mr-2 ml-2 " />
        <h2 className="text-xl font-semibold text-gray-800">
          Calculs Sauvegardés
        </h2>
      </header>
      {/* Zone de contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {savedCalculations.length === 0 ? (
          <p className="text-gray-600">Aucun calcul sauvegardé.</p>
        ) : (
          <ul className="space-y-4">
            {savedCalculations.map((calc) => (
              <li
                key={calc.id}
                className="p-4 border rounded-3xl shadow flex justify-between items-center bg-white"
              >
                <Link to={`/detailscalcul/${calc.id}`} className="block flex-1">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {calc.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enregistré le : {new Date(calc.createdAt).toLocaleString()}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(calc.id)}
                  className="ml-4 px-3 py-1 bg-checkred text-white rounded-3xl hover:bg-red-600"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SavedCalculations;
