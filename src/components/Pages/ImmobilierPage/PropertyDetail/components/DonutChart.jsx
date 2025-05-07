// src/components/DonutChart.jsx
import React, { useState, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FF5722'];

function DonutChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieClick = useCallback((_, idx) => {
    setActiveIndex(i => (i === idx ? -1 : idx));
  }, []);

  const renderActiveShape = useCallback(({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload }) => (
    <>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
      />
      <text x={cx} y={cy} dy={4} textAnchor="middle" fill="#fff" className="font-bold text-lg">
        {payload.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </text>
    </>
  ), []);

  return (
    <div className="w-full mb-6 bg-gray-800 rounded-lg p-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={100}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onClick={onPieClick}
              stroke="none"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-white text-lg font-semibold">
        {activeIndex >= 0 ? data[activeIndex].name : 'Répartition mensuelle des charges'}
      </div>
    </div>
  );
}

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,
};

export default React.memo(DonutChart);
