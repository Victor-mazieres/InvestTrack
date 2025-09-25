// src/components/ImpotAnnuelPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function ImpotAnnuelPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Impôt annuel"
      valueAccessor={(info) => info?.impotAnnuel ?? 0}
      placeholderLoading="Chargement impôt annuel…"
      placeholderEmpty="Aucun impôt annuel à afficher."
    />
  );
}
