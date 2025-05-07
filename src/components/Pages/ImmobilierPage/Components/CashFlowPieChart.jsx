// src/components/CashFlowPieChart.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import { useFetch } from '../PropertyDetail/hooks/useFetch';
import PropTypes from 'prop-types';

const COLORS = ['#2e8e97', '#ff6b6b', '#d2dde1']; // Couleurs distinctes

export default function CashFlowPieChart({ userId }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const baseUrl = 'http://localhost:5000/api';
  const propsUrl = userId
    ? `${baseUrl}/properties?userId=${encodeURIComponent(userId)}`
    : `${baseUrl}/properties`;

  const { data: properties = [], loading, error } = useFetch(propsUrl);

  // Transforme les données de manière robuste
  const data = useMemo(() => {
    const result = properties
      .map(p => {
        const raw = Number(p.financialInfo?.cfMensuel) || 0;
        
        return {
          name: p.name,
          value: Math.abs(raw),
          rawValue: raw,
          sign: raw < 0 ? 'negative' : 'positive'
        };
      })
      .filter(d => d.rawValue !== 0);

    console.log('Données transformées:', result); // Debug
    return result;
  }, [properties]);

  // Gestionnaire de clic amélioré
  const onPieClick = useCallback((_, index) => {
    setActiveIndex(prev => (prev === index ? -1 : index));
  }, []);

  // Style actif/désactivé cohérent
  const renderActiveShape = useCallback(
    ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload }) => (
      <g>
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
          {payload.rawValue.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </text>
      </g>
    ),
    []
  );

  if (loading) return <p className="text-gray-300">Chargement...</p>;
  if (error) return <p className="text-red-500">Erreur : {error.message}</p>;
  if (!data.length) return <p className="text-gray-300">Aucune donnée à afficher</p>;

  return (
    <div className="w-full mb-6 bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Répartition du Cash-Flow</h3>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="45%"
              outerRadius="80%"
              paddingAngle={2} // Espace entre les tranches
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
                  opacity={
                    activeIndex === -1 || activeIndex === index 
                      ? 1 
                      : 0.65
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center cursor-pointer"
            onClick={() => onPieClick(null, index)}
          >
            <div 
              className="w-4 h-4 mr-2 rounded-sm"
              style={{ 
                backgroundColor: COLORS[index % COLORS.length],
                opacity: activeIndex === -1 || activeIndex === index ? 1 : 0.65
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

CashFlowPieChart.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};