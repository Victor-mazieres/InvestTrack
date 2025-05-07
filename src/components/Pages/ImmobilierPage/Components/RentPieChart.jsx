// src/components/RentPieChart.jsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';

const COLORS = ['#2e8e97', '#bdced3', '#d2dde1'];

export default function RentPieChart({ userId }) {
  // 1️⃣ on fetch toutes les propriétés + leurs financialInfo
  const baseUrl  = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;
  const { data: properties = [], loading, error } = useFetch(propsUrl);

  // 2️⃣ on extrait loyerHc pour chaque bien
  const data = useMemo(() => {
    return properties
      .map(p => ({
        name: p.name,
        value: parseFloat(p.financialInfo?.loyerHc) || 0
      }))
      .filter(d => d.value > 0);
  }, [properties]);

  if (loading)      return <p className="text-gray-300">Chargement loyers…</p>;
  if (error)        return <p className="text-red-500">Erreur : {error}</p>;
  if (!data.length) return <p className="text-gray-300">Aucun loyer HC à afficher.</p>;

  return (
    <div className="w-full h-64 bg-gray-800 p-4 rounded-2xl shadow-lg">
      <h3 className="text-white font-semibold mb-2">Loyers HC des biens</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={60}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
