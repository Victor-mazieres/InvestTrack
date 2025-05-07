// src/pages/ImmobilierDashboard.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import MetricPieChart from './Components/MetricPieChart';
import { useFetch } from './PropertyDetail/hooks/useFetch';

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const wrapperClass =
  "w-full p-4 bg-gradient-to-br from-gray-800 to-gray-700 " +
  "border border-gray-600 rounded-3xl shadow-2xl " +
  "hover:shadow-3xl transition-all duration-300 mb-6";

export default function ImmobilierDashboard() {
  const navigate  = useNavigate();
  const rawUserId = localStorage.getItem('userId');
  const userId    = rawUserId ? Number(rawUserId) : null;

  // Redirige vers login si pas authentifié
  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
    }
  }, [userId, navigate]);

  // Avant de créer un nouveau bien, on vide le formulaire sauvegardé
  const handleNewProperty = useCallback(() => {
    localStorage.removeItem('propertyFormData');
    navigate('/nouveau-bien');
  }, [navigate]);

  const baseUrl    = 'http://localhost:5000/api';
  const propsUrl   = `${baseUrl}/properties${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`;
  const tenantsUrl = `${baseUrl}/tenants${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`;

  const {
    data: properties = [],
    loading: loadingP,
    error: errorP
  } = useFetch(propsUrl);

  const {
    data: tenants = [],
    loading: loadingT,
    error: errorT
  } = useFetch(tenantsUrl);

  const error = errorP || errorT;

  // États locaux pour pouvoir mettre à jour sans rechargement
  const [localProperties, setLocalProperties] = useState([]);
  const [localTenants,    setLocalTenants]    = useState([]);

  // Sync des propriétés
  useEffect(() => {
    if (!loadingP) {
      setLocalProperties(properties);
    }
  }, [loadingP, properties]);

  // Sync des locataires
  useEffect(() => {
    if (!loadingT) {
      setLocalTenants(tenants);
    }
  }, [loadingT, tenants]);

  const handleDeleteProperty = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression du bien');
      // Mise à jour locale : on filtre le bien supprimé
      setLocalProperties(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTenant = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/tenants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression du locataire');
      // Mise à jour locale : on retire le locataire supprimé
      setLocalTenants(prev => prev.filter(t => (t._id || t.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen pt-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Suivi Immobilier</h1>
      {error && <p className="text-red-500 mb-4">Erreur : {error.message || error}</p>}

      {/* Répartition des métriques */}
      <div className="w-full mb-6">
        <MetricPieChart properties={localProperties} />
      </div>

      {/* Vos Biens */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Vos Biens</h2>
          <button
            onClick={handleNewProperty}
            className="flex items-center bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Créer un bien
          </button>
        </div>

        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : localProperties.length > 0 ? (
          <div className="space-y-3">
            {localProperties.map(prop => {
              const id = prop._id || prop.id;
              const tenantId   = prop.owner || prop.tenantId;
              const associated = localTenants.find(t => (t._id || t.id) === tenantId);

              return (
                <div
                  key={id}
                  className="bg-gray-800 p-4 rounded-2xl flex flex-col space-y-1 cursor-pointer hover:bg-gray-700 transition"
                >
                  <div
                    className="flex justify-between items-start"
                    onClick={() => navigate(`/property/${id}`)}
                  >
                    <div>
                      <p className="text-gray-100 font-semibold">{prop.name}</p>
                      <p className="text-gray-400 text-sm">{prop.city} — {prop.address}</p>
                      <p className="text-gray-400 text-sm">Valeur : {prop.value} €</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteProperty(id); }}
                      className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700"
                      aria-label="Supprimer le bien"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  {associated && (
                    <p className="text-greenLight text-sm">
                      Associé à : {associated.firstName} {associated.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun bien enregistré.</p>
        )}
      </motion.div>

      {/* Locataires */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Locataires</h2>
          <button
            onClick={() => navigate('/nouveau-locataire', { state: { fromDashboard: true } })}
            className="flex items-center bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Créer un locataire
          </button>
        </div>

        {loadingT ? (
          <p className="text-gray-300">Chargement…</p>
        ) : localTenants.length > 0 ? (
          <div className="space-y-3">
            {localTenants.map(t => {
              const id = t._id || t.id;
              const associatedProps = localProperties
                .filter(p => (p.owner || p.tenantId) === id)
                .map(p => p.name);
              const label = associatedProps.length > 1 ? 'Associés à' : 'Associé à';

              return (
                <div
                  key={id}
                  className="bg-gray-800 p-4 rounded-2xl flex flex-col space-y-1 cursor-pointer hover:bg-gray-700 transition"
                >
                  <div
                    className="flex justify-between items-start"
                    onClick={() => navigate(`/locataire/${id}`)}
                  >
                    <div>
                      <p className="text-gray-100 font-semibold">{t.name}</p>
                      <p className="text-gray-400 text-sm">{t.email}</p>
                      <p className="text-gray-400 text-sm">{t.phone}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteTenant(id); }}
                      className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700"
                      aria-label="Supprimer le locataire"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  {associatedProps.length > 0 && (
                    <p className="text-greenLight text-sm">
                      {label} : {associatedProps.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun locataire enregistré.</p>
        )}
      </motion.div>
    </div>
  );
}
