// src/components/MontantEmpruntePieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

export default function MontantEmpruntePieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Montant emprunté"
      valueAccessor={(info) => info?.montantEmprunte ?? 0}
      placeholderLoading="Chargement montants empruntés…"
      placeholderEmpty="Aucun montant emprunté à afficher."
    />
  );
}
