// src/components/InterestPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function InterestPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Intérêts d’emprunt"
      valueAccessor={(info) => info?.interets ?? 0}
      placeholderLoading="Chargement intérêts…"
      placeholderEmpty="Aucun intérêt à afficher."
    />
  );
}
