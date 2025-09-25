// src/components/TaxeFoncierePieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function TaxeFoncierePieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Taxe foncière"
      valueAccessor={(info) => info?.taxeFonciere ?? 0}
      placeholderLoading="Chargement taxe foncière…"
      placeholderEmpty="Aucune taxe foncière à afficher."
    />
  );
}
