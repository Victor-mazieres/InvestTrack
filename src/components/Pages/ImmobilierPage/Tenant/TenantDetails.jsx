// src/pages/TenantDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

// Exemple de variant pour l'animation (vous pouvez ajuster selon vos besoins)
const sectionVariants = (delay = 0) => ({
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } },
});

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer les informations du locataire par son ID (sans token)
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
        setError(err.message);
      });
  }, [id]);

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  // Construction de l'URL de l'image
  const imageUrl = tenant.profilePicture 
    ? tenant.profilePicture.startsWith('http')
      ? tenant.profilePicture 
      : `http://localhost:5000/${tenant.profilePicture}`
    : null;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <motion.h1
          className="ml-4 text-2xl font-bold text-gray-100"
          variants={sectionVariants(0)}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
        >
          Retour
        </motion.h1>
      </header>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-white text-2xl font-bold mb-6">Fiche de {tenant.name} {tenant.firstName}</h2>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Photo de profil"
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400">Pas d'image</span>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-white font-semibold">
            Email : <span className="text-greenLight">{tenant.email}</span>
          </p>
          <p className="text-white font-semibold">
            Téléphone : <span className="text-greenLight">{tenant.phone}</span>
          </p>
          <p className="text-white font-semibold">
            Date de Naissance : <span className="text-greenLight">{tenant.dateOfBirth}</span>
          </p>
          <p className="text-white font-semibold">
            Profession : <span className="text-greenLight">{tenant.occupation}</span>
          </p>
          <p className="text-white font-semibold">
            Biographie : <span className="text-greenLight">{tenant.bio}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
