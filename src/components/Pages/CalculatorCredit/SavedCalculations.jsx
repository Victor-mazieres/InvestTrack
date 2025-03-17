// SavedCalculations.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SavedCalculations = () => {
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSimulations = async () => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/simulations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedCalculations(savedCalculations.filter(sim => sim.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <section className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Calculs Sauvegardés
      </h2>
      {savedCalculations.length === 0 ? (
        <p className="text-gray-600">Aucun calcul sauvegardé.</p>
      ) : (
        <ul className="space-y-4">
          {savedCalculations.map((calc) => (
            <li
              key={calc.id}
              className="p-4 border rounded-lg shadow bg-gray-50 flex justify-between items-center"
            >
              <Link to={`/detailscalcul/${calc.id}`} className="block flex-1">
                <h3 className="text-lg font-semibold text-gray-700">{calc.name}</h3>
                <p className="text-sm text-gray-600">
                  Enregistré le : {new Date(calc.createdAt).toLocaleString()}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(calc.id)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded-3xl hover:bg-red-600"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SavedCalculations;
