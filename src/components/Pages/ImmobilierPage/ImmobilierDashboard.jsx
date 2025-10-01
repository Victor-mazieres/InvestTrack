// src/pages/ImmobilierDashboard.jsx
import React, { useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MetricPieChart = lazy(() => import('./Components/MetricPieChart'));

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const wrapperClass =
  "w-full p-4 bg-gradient-to-br from-gray-800 to-gray-700 " +
  "border border-gray-600 rounded-3xl shadow-2xl " +
  "hover:shadow-3xl transition-all duration-300 mb-6";

const cardClass =
  "relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105";

export default function ImmobilierDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userId = useMemo(() => Number(localStorage.getItem('userId')), []);

  useEffect(() => {
    if (!userId) navigate('/login', { replace: true });
  }, [userId, navigate]);

  const baseUrl = 'http://localhost:5000/api';
  const propsUrl = `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`;
  const tenantsUrl = `${baseUrl}/tenants?userId=${encodeURIComponent(userId)}`;

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

  const deletePropertyMutation = useMutation({
    mutationFn: id => fetch(`${baseUrl}/properties/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties', userId] })
  });

  const deleteTenantMutation = useMutation({
    mutationFn: id => fetch(`${baseUrl}/tenants/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants', userId] })
  });

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

  const tenantsMap = useMemo(
    () => tenants.reduce((acc, t) => { acc[t._id || t.id] = t; return acc; }, {}),
    [tenants]
  );

  const error = errorP || errorT;

  const rentalProps = useMemo(
    () => properties.filter(p => (p.mode || '').toLowerCase() === 'location'),
    [properties]
  );
  const flipProps = useMemo(
    () => properties.filter(p => (p.mode || '').toLowerCase() === 'achat_revente'),
    [properties]
  );

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

      {/* Properties Section — LOCATION */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Vos Biens (Location)</h2>
        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : rentalProps.length > 0 ? (
          <div className="grid gap-4">
            {rentalProps.map(prop => {
              const id = prop._id || prop.id;
              const tenant = tenantsMap[prop.owner || prop.tenantId];

              return (
                <div
                  key={id}
                  className={cardClass}
                  onClick={() => navigate(`/property/${id}`)}
                >
                  <button
                    onClick={e => handleDeleteProperty(id, e)}
                    className="absolute top-4 right-4 bg-checkred p-2 rounded-full hover:bg-checkred transition"
                    aria-label="Supprimer le bien"
                  >
                    <Trash className="w-5 h-5 text-white" />
                  </button>

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
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun bien de location enregistré.</p>
        )}
      </motion.div>

      {/* Properties Section — ACHAT/REVENTE */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Biens Achat / Revente</h2>
        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : flipProps.length > 0 ? (
          <div className="grid gap-4">
            {flipProps.map(prop => {
              const id = prop._id || prop.id;

              return (
                <div
                  key={id}
                  className={cardClass}
                  onClick={() => navigate(`/property/${id}`)}
                >
                  <button
                    onClick={e => handleDeleteProperty(id, e)}
                    className="absolute top-4 right-4 bg-checkred p-2 rounded-full hover:bg-checkred transition"
                    aria-label="Supprimer le bien"
                  >
                    <Trash className="w-5 h-5 text-white" />
                  </button>

                  <div>
                    <p className="text-gray-100 font-semibold text-lg">{prop.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{prop.city} — {prop.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun bien Achat/Revente enregistré.</p>
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
                  <button
                    onClick={e => handleDeleteTenant(id, e)}
                    className="absolute top-4 right-4 bg-checkred p-2 rounded-full hover:bg-checkred transition"
                    aria-label="Supprimer le locataire"
                  >
                    <Trash className="w-5 h-5 text-white" />
                  </button>

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
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun locataire enregistré.</p>
        )}
      </motion.div>

      {/* Floating Action Button (FAB) */}
<button
  onClick={handleNewProperty}
  className="
    fixed z-50
    right-4                         /* marge à droite */
    bottom-[88px]                   /* hauteur de ta bottom bar (~72px) + marge */
    sm:bottom-[96px]
    rounded-full shadow-2xl
    bg-greenLight text-white
    flex items-center justify-center
    w-16 h-16                       /* mobile: bouton circulaire */
    md:w-auto md:h-12 md:px-4 md:gap-2  /* desktop: icône + label */
    hover:bg-checkgreen active:translate-y-[1px] transition
  "
  style={{
    /* sécurité iOS (notch) : ajoute le safe area si présent */
    bottom: `calc(88px + env(safe-area-inset-bottom, 0px))`
  }}
  aria-label="Créer un bien"
>
  <Plus className="w-5 h-5" />
  <span className="hidden md:inline">Créer un bien</span>
</button>

    </div>
  );
}
