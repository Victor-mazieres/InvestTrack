// src/pages/ImmobilierDashboard.jsx
import React, { useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Lazy load the heavy chart component
const MetricPieChart = lazy(() => import('./Components/MetricPieChart'));

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const wrapperClass =
  "w-full p-4 bg-gradient-to-br from-gray-800 to-gray-700 " +
  "border border-gray-600 rounded-3xl shadow-2xl " +
  "hover:shadow-3xl transition-all duration-300 mb-6";

// Added `relative` so that absolute-positioned delete button is placed relative to this container
const cardClass =
  "relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105";

export default function ImmobilierDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userId = useMemo(() => Number(localStorage.getItem('userId')), []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userId) navigate('/login', { replace: true });
  }, [userId, navigate]);

  const baseUrl = 'http://localhost:5000/api';
  const propsUrl = `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`;
  const tenantsUrl = `${baseUrl}/tenants?userId=${encodeURIComponent(userId)}`;

  // Queries
  const {
    data: properties = [],
    isLoading: loadingP,
    error: errorP
  } = useQuery({
    queryKey: ['properties', userId],
    queryFn: () => fetch(propsUrl).then(res => res.json()),
    enabled: !!userId
  });

  const {
    data: tenants = [],
    isLoading: loadingT,
    error: errorT
  } = useQuery({
    queryKey: ['tenants', userId],
    queryFn: () => fetch(tenantsUrl).then(res => res.json()),
    enabled: !!userId
  });

  // Mutations
  const deletePropertyMutation = useMutation({
    mutationFn: id => fetch(`${baseUrl}/properties/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties', userId] })
  });

  const deleteTenantMutation = useMutation({
    mutationFn: id => fetch(`${baseUrl}/tenants/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants', userId] })
  });

  // Callbacks
  const handleNewProperty = useCallback(() => {
    localStorage.removeItem('propertyFormData');
    navigate('/nouveau-bien');
  }, [navigate]);

  const handleDeleteProperty = useCallback((id, e) => {
    e.stopPropagation();
    deletePropertyMutation.mutate(id);
  }, [deletePropertyMutation]);

  const handleNewTenant = useCallback(() => {
    navigate('/nouveau-locataire', { state: { fromDashboard: true } });
  }, [navigate]);

  const handleDeleteTenant = useCallback((id, e) => {
    e.stopPropagation();
    deleteTenantMutation.mutate(id);
  }, [deleteTenantMutation]);

  // Tenant map for quick lookup
  const tenantsMap = useMemo(() =>
    tenants.reduce((acc, t) => { acc[t._id || t.id] = t; return acc; }, {}),
  [tenants]
  );

  const error = errorP || errorT;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Suivi Immobilier</h1>
      {error && <p className="text-red-500 mb-6">Erreur : {error.message || error}</p>}

      {/* Metrics Chart */}
      <div className="w-full mb-8">
        <Suspense fallback={<p className="text-gray-300">Chargement du graphique…</p>}>
          <MetricPieChart properties={properties} />
        </Suspense>
      </div>

      {/* Properties Section */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Vos Biens</h2>
          <button
            onClick={handleNewProperty}
            className="flex items-center bg-greenLight text-white px-4 py-2 rounded-full shadow hover:bg-checkgreen transition"
          >
            <Plus className="w-5 h-5 mr-2" /> Créer un bien
          </button>
        </div>

        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : properties.length > 0 ? (
          <div className="grid gap-4">
            {properties.map(prop => {
              const id = prop._id || prop.id;
              const tenant = tenantsMap[prop.owner || prop.tenantId];

              return (
                <div
                  key={id}
                  className={cardClass}
                  onClick={() => navigate(`/property/${id}`)}
                >
                  {/* Delete button positioned at top-right */}
                  <button
                    onClick={e => handleDeleteProperty(id, e)}
                    className="absolute top-4 right-4 bg-checkred p-2 rounded-full hover:bg-checkred transition"
                    aria-label="Supprimer le bien"
                  >
                    <Trash className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-100 font-semibold text-lg">{prop.name}</p>
                      <p className="text-gray-400 text-sm mt-1">{prop.city} — {prop.address}</p>
                      {tenant && (
                        <p className="text-green-400 text-sm mt-2">
                          Associé à : {tenant.firstName} {tenant.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun bien enregistré.</p>
        )}
      </motion.div>

      {/* Tenants Section */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Locataires</h2>
          <button
            onClick={handleNewTenant}
            className="flex items-center bg-greenLight text-white px-4 py-2 rounded-full shadow hover:bg-checkgreen transition"
          >
            <Plus className="w-5 h-5 mr-2" /> Créer un locataire
          </button>
        </div>

        {loadingT ? (
          <p className="text-gray-300">Chargement…</p>
        ) : tenants.length > 0 ? (
          <div className="grid gap-6">
            {tenants.map(t => {
              const id = t._id || t.id;
              const associatedProps = properties
                .filter(p => (p.owner || p.tenantId) === id)
                .map(p => p.name);
              const label = associatedProps.length > 1 ? 'Associés à' : 'Associé à';

              return (
                <div
                  key={id}
                  className={cardClass}
                  onClick={() => navigate(`/locataire/${id}`)}
                >
                  {/* Delete button positioned at top-right */}
                  <button
                    onClick={e => handleDeleteTenant(id, e)}
                    className="absolute top-4 right-4 bg-checkred p-2 rounded-full hover:bg-checkred transition"
                    aria-label="Supprimer le locataire"
                  >
                    <Trash className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-100 font-semibold text-lg">{t.name}</p>
                      <p className="text-gray-400 text-sm mt-1">{t.email}</p>
                      <p className="text-gray-400 text-sm mt-1">{t.phone}</p>
                      {associatedProps.length > 0 && (
                        <p className="text-green-400 text-sm mt-2">
                          {label} : {associatedProps.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
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
