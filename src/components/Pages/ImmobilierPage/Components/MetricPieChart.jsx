// src/components/MetricPieChart.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'dashboardImmobilierSelection:v1';

// Palette
const COLORS = ['#2e8e97', '#ff6b6b', '#8e5ea2', '#3cba9f', '#e8c1a0', '#f39c12', '#3498db', '#1abc9c'];

// util: conversion robuste nombre
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Normalisation par période déclarée dans FinancialInfo (monthly/annual)
function normalizeByPeriod(value, period, target = 'monthly') {
  const v = toNum(value);
  if (!period) return v;
  if (target === 'monthly' && period === 'annual') return v / 12;
  if (target === 'annual' && period === 'monthly') return v * 12;
  return v;
}

const METRICS = {
  loyerHC:         { label: 'Loyers HC',                         accessor: (info) => toNum(info.loyerHc) },
  interets:        { label: 'Intérêts',                           accessor: (info) => toNum(info.interets) },
  mensualites:     { label: 'Mensualités',                        accessor: (info) => toNum(info.mensualite) },
  cashflowMensuel: { label: 'Cash-Flow Mensuel',                  accessor: (info) => toNum(info.cfMensuel) },
  cashflowAnnuel:  { label: 'Cash-Flow Annuel',                   accessor: (info) => toNum(info.cfAnnuel ?? (toNum(info.cfMensuel) * 12)) },

  taxeFonciere:    { label: 'Taxe foncière (mensuelle)',          accessor: (info) => normalizeByPeriod(info.taxeFonciere, info.taxeFoncierePeriod, 'monthly') },
  assurancePNO:    { label: 'Assurance PNO (mensuelle)',          accessor: (info) => normalizeByPeriod(info.assurancePno, info.assurancePnoPeriod, 'monthly') },
  chargesCopro:    { label: 'Charges de copro (mensuelles)',      accessor: (info) => normalizeByPeriod(info.chargesCopro, info.chargesCoproPeriod, 'monthly') },

  surface:         { label: 'Surface (m²)',                       accessor: (_info, p) => toNum(p?.surface), format: 'number' },
  montantEmprunte: { label: 'Montant emprunté',                   accessor: (info) => toNum(info.emprunt) },

  totalSorties:    { label: 'Total sorties',                      accessor: (info) => toNum(info.totalSorties) },
  impotMensuel:    { label: 'Impôt mensuel',                      accessor: (info) => toNum(info.impotMensuel) },
  impotAnnuel:     { label: 'Impôt annuel',                       accessor: (info) => toNum(info.impotAnnuel) },
};

export default function MetricPieChart({ userId }) {
  // Sélection lue depuis localStorage
  const [selectedIds, setSelectedIds] = useState(() => readSelection());

  // Options affichées dans le menu (ordre = celui de la sélection)
  const options = useMemo(() => {
    const ids = selectedIds.length ? selectedIds : Object.keys(METRICS);
    return ids.filter((id) => METRICS[id]).map((id) => ({ key: id, label: METRICS[id].label }));
  }, [selectedIds]);

  // métrique active
  const [metricId, setMetricId] = useState(() => (readSelection().find((id) => METRICS[id]) || 'loyerHC'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Si la sélection change (depuis la modale), on met à jour
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const ids = readSelection();
        setSelectedIds(ids);
        // si la métrique active n'est plus sélectionnée, bascule sur la première dispo
        if (!ids.includes(metricId)) {
          const next = ids.find((id) => METRICS[id]) || Object.keys(METRICS)[0];
          setMetricId(next);
          setActiveIndex(-1);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [metricId]);

  // Sécurise metricId si options se vident
  useEffect(() => {
    if (!METRICS[metricId]) {
      const next = (options[0]?.key) || Object.keys(METRICS)[0];
      setMetricId(next);
      setActiveIndex(-1);
    }
  }, [options, metricId]);

  // Fetch des propriétés
  const baseUrl  = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;

  const { data: properties = [], loading, error } = useFetch(propsUrl);

  // Données graphe pour la métrique active
  const data = useMemo(() => {
    const acc = METRICS[metricId]?.accessor ?? (() => 0);
    return properties
      .map((p) => {
        const info = p.financialInfo || {};
        const raw = acc(info, p); // <— important: on passe aussi la Property pour surface
        return {
          name: p.name ?? p.title ?? `Bien ${p.id ?? ''}`,
          value: Math.abs(raw),
          rawValue: raw,
        };
      })
      .filter((d) => d.rawValue !== 0);
  }, [properties, metricId]);

  // Formatter selon le type de métrique
  const formatValue = useCallback((n) => {
    const type = METRICS[metricId]?.format ?? 'currency';
    if (type === 'number') {
      return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    }
    return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [metricId]);

  const onPieClick = useCallback((_, idx) => {
    setActiveIndex((i) => (i === idx ? -1 : idx));
  }, []);

  const renderActiveShape = useCallback(
    ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload }) => {
      const type = METRICS[metricId]?.format ?? 'currency';
      const centerText = type === 'number'
        ? `${formatValue(Math.abs(payload.rawValue))}`
        : `${payload.rawValue < 0 ? '-' : '+'}${formatValue(Math.abs(payload.rawValue))}`;

      return (
        <>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            stroke="#fff"
            strokeWidth={2}
          />
          <text
            x={cx}
            y={cy}
            dy={4}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight={600}
          >
            {centerText}{type === 'number' ? ' m²' : ''}
          </text>
        </>
      );
    },
    [metricId, formatValue]
  );

  if (loading) return <div className="text-gray-300 p-4">Chargement...</div>;
  if (error)   return <div className="text-red-500 p-4">Erreur : {error.message}</div>;
  if (!data.length) return <div className="text-gray-300 p-4">Aucune donnée à afficher.</div>;

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">
          {METRICS[metricId]?.label ?? 'Métrique'}
        </h3>

        {/* Menu métriques limité aux éléments sélectionnés */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-gray-300 hover:text-white"
            aria-label="Changer métrique"
          >
            <Settings className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 mt-2 bg-gray-700 border border-gray-600 rounded-md z-10 overflow-hidden min-w-56"
              >
                {options.map((opt) => (
                  <li key={opt.key}>
                    <button
                      onClick={() => {
                        setMetricId(opt.key);
                        setMenuOpen(false);
                        setActiveIndex(-1);
                      }}
                      className={`block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 ${opt.key === metricId ? 'bg-gray-600/50' : ''}`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
                {!options.length && (
                  <li className="px-4 py-2 text-gray-300">Aucune métrique sélectionnée</li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="80%"
              paddingAngle={2}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onClick={onPieClick}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#1a1a1a"
                  strokeWidth={1}
                  opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {data.map((entry, index) => {
          const type = METRICS[metricId]?.format ?? 'currency';
          const text = type === 'number'
            ? `${entry.name}: ${formatValue(entry.rawValue)} m²`
            : `${entry.name}: ${formatValue(entry.rawValue)}`;
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center cursor-pointer px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
              onClick={() => onPieClick(null, index)}
            >
              <div
                className="w-3 h-3 mr-2 rounded-sm"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                  opacity: activeIndex === -1 || activeIndex === index ? 1 : 0.6
                }}
              />
              <span className="text-white text-sm">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

MetricPieChart.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

// ---- helpers ----
function readSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
