// src/components/GenericMetricPieChart.jsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';
import PropTypes from 'prop-types';

const COLORS = ['#2e8e97', '#ff6b6b', '#8e5ea2', '#3cba9f', '#e8c1a0', '#f39c12', '#3498db', '#1abc9c'];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function GenericMetricPieChart({
  userId,
  title,
  valueAccessor,
  placeholderLoading = 'Chargement…',
  placeholderEmpty = 'Aucune donnée à afficher.',
  format = 'currency',
}) {
  const baseUrl  = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;

  const { data: properties = [], loading, error } = useFetch(propsUrl);

  const data = useMemo(() => {
    const items = properties
      .map((p) => {
        const info = p.financialInfo || {};
        const val = Number(valueAccessor(info, p)) || 0;
        return { name: p.name ?? p.title ?? `Bien ${p.id ?? ''}`, value: Math.abs(val), rawValue: val };
      })
      .filter((d) => d.value > 0);
    return items;
  }, [properties, valueAccessor]);

  const fmt = (n) => {
    if (typeof format === 'function') return format(n);
    if (format === 'number') {
      return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    }
    // currency par défaut
    return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  if (loading)      return <p className="text-gray-300">{placeholderLoading}</p>;
  if (error)        return <p className="text-red-500">Erreur : {error.message || String(error)}</p>;
  if (!data.length) return <p className="text-gray-300">{placeholderEmpty}</p>;

  return (
    <div className="w-full h-64 bg-gray-800 p-4 rounded-2xl shadow-lg">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius="75%">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#1a1a1a" strokeWidth={1} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Légende simple */}
      <div className="mt-3 flex flex-wrap gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center">
            <span
              className="inline-block w-3 h-3 mr-2 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-gray-100 text-sm">
              {d.name}: {fmt(d.rawValue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

GenericMetricPieChart.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string.isRequired,
  valueAccessor: PropTypes.func.isRequired,
  placeholderLoading: PropTypes.string,
  placeholderEmpty: PropTypes.string,
  format: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};
