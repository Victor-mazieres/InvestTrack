// src/components/PnoPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function PnoPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Assurance PNO"
      valueAccessor={(info) => info?.pno ?? 0}
      placeholderLoading="Chargement PNO…"
      placeholderEmpty="Aucune prime PNO à afficher."
    />
  );
}
