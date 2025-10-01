// src/components/DonutChart.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = ['#2e8e97', '#ff6b6b', '#8e5ea2', '#3cba9f', '#e8c1a0'];

function DonutChart({
  data,
  title,                  // ex: "Répartition mensuelle des charges"
  height = 240,
  colors = COLORS,
  currency = true,        // true => format € ; false => nombre simple
  innerRadius = 55,
  outerRadius = 95,
  showLegend = true,
}) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const series = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map(d => ({ name: d?.name ?? '—', value: Number(d?.value) || 0 }))
      .filter(d => d.value !== 0);
  }, [data]);

  const fmt = useCallback(
    (n) =>
      currency
        ? n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }),
    [currency]
  );

  const onSliceClick = (_, idx) =>
    setActiveIndex((i) => (i === idx ? -1 : idx));

  const renderActiveShape = useCallback(
    ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload }) => (
      <>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}   // léger zoom, sans halo
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy} dy={4} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>
          {fmt(Math.abs(payload.value))}
        </text>
      </>
    ),
    [fmt]
  );

  if (!series.length) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4">
        {title && <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>}
        <div className="h-[140px] flex items-center justify-center text-gray-400 text-sm">
          Aucune donnée à afficher.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 mb-4">
      {title && <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={series}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onClick={onSliceClick}
              paddingAngle={1.5}
              stroke="none"
              isAnimationActive={false}
            >
              {series.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={colors[idx % colors.length]}
                  opacity={activeIndex === -1 || activeIndex === idx ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {series.map((d, idx) => (
            <div key={idx} className="flex items-center text-xs text-gray-200">
              <span
                className="inline-block w-3 h-3 rounded-sm mr-2"
                style={{ background: colors[idx % colors.length] }}
              />
              {d.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,
  title: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  currency: PropTypes.bool,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  showLegend: PropTypes.bool,
};

export default React.memo(DonutChart);
