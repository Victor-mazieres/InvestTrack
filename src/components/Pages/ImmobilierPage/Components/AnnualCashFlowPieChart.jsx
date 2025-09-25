// src/components/AnnualCashFlowPieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function AnnualCashFlowPieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Cash-Flow Annuel"
      valueAccessor={(info) => (Number(info?.cfAnnuel) || (Number(info?.cfMensuel) || 0) * 12)}
      placeholderLoading="Chargement cash-flow annuel…"
      placeholderEmpty="Aucun cash-flow annuel à afficher."
    />
  );
}
