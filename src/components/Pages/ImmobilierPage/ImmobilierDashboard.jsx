// src/pages/ImmobilierDashboard.jsx
import React, { useCallback, useEffect, useMemo, lazy, Suspense, useState } from 'react';
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

/** Détermine le type (LLD | LCD | AV) de façon robuste */
function resolveRentalKind(p = {}) {
  // Nouveau champ prioritaire
  const rk = (p.rentalKind || '').toString().trim().toUpperCase();
  if (rk === 'LLD' || rk === 'LCD' || rk === 'AV') return rk;

  // Fallback anciens champs pour compat
  const mode = (p.mode || '').toString().trim().toLowerCase();
  const rs   = (p.rentalStrategy || p.rental_type || p.rentalMode || '').toString().trim().toLowerCase();

  if (mode === 'achat_revente') return 'AV';
  if (mode === 'location') {
    if (['short_term', 'short-term', 'lcd', 'airbnb', 'courte duree', 'courte-duree'].includes(rs)) return 'LCD';
    return 'LLD';
  }
  // Si rien de clair : on tente de deviner
  if (['short_term', 'short-term', 'lcd', 'airbnb'].includes(rs)) return 'LCD';
  return 'LLD';
}

export default function ImmobilierDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/connexion', { replace: true });
      return;
    }
    if (userId) return;

    try {
      const [, payload = ''] = token.split('.');
      if (!payload) return;

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoder = typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function'
        ? globalThis.atob
        : null;

      if (!decoder) return;

      const decodedPayload = decodeURIComponent(
        decoder(base64)
          .split('')
          .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );

      const parsed = JSON.parse(decodedPayload);
      const resolvedId = parsed?.userId ?? parsed?.id ?? parsed?.sub;

      if (resolvedId) {
        const stringifiedId = String(resolvedId);
        localStorage.setItem('userId', stringifiedId);
        setUserId(stringifiedId);
      }
    } catch (error) {
      console.error('Impossible de récupérer le userId depuis le token.', error);
    }
  }, [navigate, userId]);

  const baseUrl   = 'http://localhost:5000/api';
  const propsUrl  = `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`;
  const tenantsUrl= `${baseUrl}/tenants?userId=${encodeURIComponent(userId)}`;

  const {
    data: propertiesRaw,
    isLoading: loadingP,
    error: errorP
  } = useQuery({
    queryKey: ['properties', userId],
    queryFn: async () => {
      const res = await fetch(propsUrl);
      // Si le backend renvoie une erreur JSON, on remonte l'erreur proprement
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : []; // robustesse
    },
    enabled: !!userId
  });

  const properties = propertiesRaw ?? [];

  const {
    data: tenantsRaw,
    isLoading: loadingT,
    error: errorT
  } = useQuery({
    queryKey: ['tenants', userId],
    queryFn: async () => {
      const res = await fetch(tenantsUrl);
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId
  });

  const tenants = tenantsRaw ?? [];

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

  // ========= Séparations =========
  const { lldProps, lcdProps, flipProps } = useMemo(() => {
    const lld = [];
    const lcd = [];
    const av  = [];
    for (const p of properties) {
      const kind = resolveRentalKind(p);
      if (kind === 'AV') av.push(p);
      else if (kind === 'LCD') lcd.push(p);
      else lld.push(p); // par défaut LLD
    }
    return { lldProps: lld, lcdProps: lcd, flipProps: av };
  }, [properties]);

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

      {/* ========== LLD ========== */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Biens — Location Longue Durée (LLD)</h2>
        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : lldProps.length > 0 ? (
          <div className="grid gap-4">
            {lldProps.map(prop => {
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
          <p className="text-gray-300">Aucun bien en LLD.</p>
        )}
      </motion.div>

      {/* ========== LCD ========== */}
      <motion.div
        className={wrapperClass}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Biens — Location Courte Durée (LCD)</h2>
        {loadingP ? (
          <p className="text-gray-300">Chargement…</p>
        ) : lcdProps.length > 0 ? (
          <div className="grid gap-4">
            {lcdProps.map(prop => {
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
                    <p className="text-green-400 text-sm mt-2">Stratégie : LCD / Airbnb</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-300">Aucun bien en LCD.</p>
        )}
      </motion.div>

      {/* ========== ACHAT / REVENTE ========== */}
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

      {/* ========== LOCATAIRES ========== */}
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
          right-4
          bottom-[88px]
          sm:bottom-[96px]
          rounded-full shadow-2xl
          bg-greenLight text-white
          flex items-center justify-center
          w-16 h-16
          md:w-auto md:h-12 md:px-4 md:gap-2
          hover:bg-checkgreen active:translate-y-[1px] transition
        "
        style={{ bottom: `calc(88px + env(safe-area-inset-bottom, 0px))` }}
        aria-label="Créer un bien"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden md:inline">Créer un bien</span>
      </button>
    </div>
  );
}
