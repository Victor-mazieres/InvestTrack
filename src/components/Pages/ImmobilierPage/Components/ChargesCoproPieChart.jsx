// src/components/ChargesCoproPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function ChargesCoproPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Charges de copropriété"
      valueAccessor={(info) => info?.chargesCopro ?? 0}
      placeholderLoading="Chargement charges de copro…"
      placeholderEmpty="Aucune charge de copropriété à afficher."
    />
  );
}
