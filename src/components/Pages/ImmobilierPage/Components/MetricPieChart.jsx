// src/components/MetricPieChart.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const COLORS = ['#2e8e97', '#ff6b6b', '#8e5ea2', '#3cba9f', '#e8c1a0'];
const OPTIONS = [
  { key: 'rent',      label: 'Loyers HC' },
  { key: 'interest',  label: 'Intérêts' },
  { key: 'payment',   label: 'Mensualités' },
  { key: 'cfMensuel', label: 'Cash-Flow Mensuel' },
];

export default function MetricPieChart({ userId }) {
  const [metric, setMetric] = useState('rent');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const baseUrl  = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;

  const { data: properties = [], loading, error } = useFetch(propsUrl);

  const data = useMemo(() => {
    return properties
      .map(p => {
        const info = p.financialInfo || {};
        let raw = 0;
        switch (metric) {
          case 'interest':
            raw = Number(info.interets) || 0;
            break;
          case 'payment':
            raw = Number(info.mensualite) || 0;
            break;
          case 'cfMensuel':
            raw = Number(info.cfMensuel) || 0;
            break;
          default:
            raw = Number(info.loyerHc) || 0;
        }
        return {
          name: p.name,
          value: Math.abs(raw),
          rawValue: raw
        };
      })
      .filter(d => d.rawValue !== 0);
  }, [properties, metric]);

  const onPieClick = useCallback((_, idx) => {
    setActiveIndex(i => (i === idx ? -1 : idx));
  }, []);

  const renderActiveShape = useCallback(
    ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload }) => (
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
          {payload.rawValue < 0 ? '-' : '+'}
          {Math.abs(payload.rawValue).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} €
        </text>
      </>
    ),
    []
  );

  if (loading) return <div className="text-gray-300 p-4">Chargement...</div>;
  if (error)   return <div className="text-red-500 p-4">Erreur : {error.message}</div>;
  if (!data.length) return <div className="text-gray-300 p-4">Aucune donnée à afficher.</div>;

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">
          {OPTIONS.find(o => o.key === metric).label}
        </h3>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="text-gray-300 hover:text-white"
          aria-label="Changer métrique"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-12 right-4 bg-gray-700 border border-gray-600 rounded-md z-10 overflow-hidden"
          >
            {OPTIONS.map(opt => (
              <li key={opt.key}>
                <button
                  onClick={() => {
                    setMetric(opt.key);
                    setMenuOpen(false);
                    setActiveIndex(-1);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

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
        {data.map((entry, index) => (
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
            <span className="text-white text-sm">
              {entry.name}: {entry.rawValue.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

MetricPieChart.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
