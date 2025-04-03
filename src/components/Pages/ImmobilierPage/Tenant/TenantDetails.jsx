// src/pages/TenantDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from 'lucide-react';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer les informations du locataire via l'ID
  useEffect(() => {
    fetch(`http://localhost:5000/api/tenants/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP error, status = " + res.status);
        }
        return res.json();
      })
      .then((data) => setTenant(data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [id]);

  // Fonction pour supprimer le locataire
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tenants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du locataire");
      }
      navigate('/immobilier-dashboard'); // Retour vers le dashboard après suppression
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen pt-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen pt-16">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen pt-16">
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Fiche de {tenant.name}</h1>
      </header>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-100">{tenant.name}</h2>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
            aria-label="Supprimer le locataire"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
        <p className="text-white font-semibold mt-2">Email : <span className='text-greenLight'>{tenant.email}</span></p>
        <p className="text-white font-semibold mt-2">Téléphone : <span className='text-greenLight'>{tenant.phone}</span></p>
        <p className="text-white font-semibold mt-2">Adresse : <span className='text-greenLight'>{tenant.address}</span></p>
        {/* Ajoutez ici d'autres informations détaillées si nécessaire */}
      </div>
    </div>
  );
};

export default TenantDetails;
