// src/components/TotalSortiesPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function TotalSortiesPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Total des sorties"
      valueAccessor={(info) => info?.totalSorties ?? 0}
      placeholderLoading="Chargement total sorties…"
      placeholderEmpty="Aucune sortie à afficher."
    />
  );
}
