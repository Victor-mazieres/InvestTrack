// src/components/ImpotMensuelPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function ImpotMensuelPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Impôt mensuel"
      valueAccessor={(info) => info?.impotMensuel ?? 0}
      placeholderLoading="Chargement impôt mensuel…"
      placeholderEmpty="Aucun impôt mensuel à afficher."
    />
  );
}
