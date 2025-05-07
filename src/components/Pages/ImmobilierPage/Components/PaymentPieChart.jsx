// src/components/PaymentPieChart.jsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';

const COLORS = ['#2e8e97', '#bdced3', '#d2dde1'];

export default function PaymentPieChart({ userId }) {
  const baseUrl = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;
  const { data: properties = [], loading, error } = useFetch(propsUrl);

  const data = useMemo(() => {
    return properties
      .map(p => {
        const val = parseFloat(p.financialInfo?.mensualite) || 0;
        return { name: p.name, value: val };
      })
      .filter(d => d.value > 0);
  }, [properties]);

  if (loading)              return <p className="text-gray-300">Chargement mensualités…</p>;
  if (error)                return <p className="text-red-500">Erreur : {error}</p>;
  if (!data.length)         return <p className="text-gray-300">Aucune mensualité.</p>;

  return (
    <div className="w-full h-64 bg-gray-800 p-4 rounded-2xl shadow-lg">
      <h3 className="text-white font-semibold mb-2">Mensualités</h3>
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
