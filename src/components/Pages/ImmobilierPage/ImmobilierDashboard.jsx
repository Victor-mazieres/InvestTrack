// src/pages/ImmobilierDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Trash } from 'lucide-react';

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1"];

export default function ImmobilierDashboard() {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);

  // Exemple de données statiques pour le graphique en camembert
  const dataImmo = [
    { name: "Loyers", value: 65 },
    { name: "Charges", value: 20 },
    { name: "Taxes", value: 15 },
  ];

  // Récupération du userId en le convertissant en nombre si possible
  const rawUserId = localStorage.getItem('userId');
  const userId = rawUserId ? Number(rawUserId) : null;

  // Récupération des biens immobiliers, filtrés par userId si défini
  useEffect(() => {
    const url = userId 
      ? `http://localhost:5000/api/properties?userId=${encodeURIComponent(userId)}`
      : `http://localhost:5000/api/properties`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP error, status = " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProperties(data);
        } else {
          throw new Error("Format de données incorrect : " + JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des propriétés:', err);
        setError(err.message);
      });
  }, [userId]);

  // Récupération des locataires, filtrés par userId si défini
  useEffect(() => {
    const url = userId 
      ? `http://localhost:5000/api/tenants?userId=${encodeURIComponent(userId)}`
      : `http://localhost:5000/api/tenants`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP error, status = " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTenants(data);
        } else {
          throw new Error("Format de données incorrect : " + JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des locataires:', err);
        setError(err.message);
      });
  }, [userId]);

  // Fonction de suppression d'un bien immobilier
  const handleDeleteProperty = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du bien");
      }
      setProperties(properties.filter(prop => (prop._id || prop.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Fonction de suppression d'un locataire
  const handleDeleteTenant = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tenants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du locataire");
      }
      setTenants(tenants.filter(tenant => (tenant._id || tenant.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen pt-16">
      <h1 className="text-2xl font-bold text-gray-100">Suivi Immobilier</h1>
      
      {error && <p className="text-red-500 mb-4">Erreur : {error}</p>}

      {/* Graphique en camembert */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Répartition des revenus
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={dataImmo}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
            >
              {dataImmo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Liste des biens immobiliers */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-300">Vos Biens</h2>
          <Link to="/nouveau-bien">
            <button className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-600">
              Créer un bien
            </button>
          </Link>
        </div>
        {properties.length > 0 ? (
          properties.map((prop) => (
            <Link key={prop._id || prop.id} to={`/property/${prop._id || prop.id}`}>
              <div className="relative bg-gray-800 p-4 rounded-3xl shadow-xl mt-2 border border-gray-600 cursor-pointer transition overflow-hidden">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteProperty(prop._id || prop.id);
                  }}
                  className="absolute top-2 right-2 bg-checkred text-white p-2 rounded-3xl shadow-xl hover:bg-red-700"
                  aria-label="Supprimer le bien"
                >
                  <Trash className="w-5 h-5" />
                </button>
                <p className="text-gray-100 font-semibold">{prop.name}</p>
                <p className="text-gray-400">{prop.city} - {prop.address}</p>
                <p className="text-gray-400">Valeur : {prop.value}€</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-greenLight rounded-b-3xl"></div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-300">Aucun bien enregistré.</p>
        )}
      </div>

      {/* Liste des locataires */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-300">Locataires</h2>
          <Link to="/nouveau-locataire">
            <button className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-700 transition">
              Créer un locataire
            </button>
          </Link>
        </div>
        {tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Link
              key={tenant.id || tenant._id}
              to={`/locataire/${tenant.id || tenant._id}`}
            >
              <div className="relative bg-gray-800 p-4 rounded-3xl shadow-xl mt-2 border border-gray-600 cursor-pointer">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteTenant(tenant.id || tenant._id);
                  }}
                  className="absolute top-2 right-2 bg-checkred text-white p-2 rounded-3xl shadow-xl hover:bg-red-700"
                  aria-label="Supprimer le locataire"
                >
                  <Trash className="w-5 h-5" />
                </button>
                <p className="text-gray-100 font-semibold">{tenant.name}</p>
                <p className="text-gray-400">{tenant.email}</p>
                <p className="text-gray-400">{tenant.phone}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-300">Aucun locataire enregistré.</p>
        )}
      </div>
    </div>
  );
}
