// src/components/SurfacePieChart.jsx
import React from 'react';
import GenericMetricPieChart from './GenericMetricPieChart';

// parse robuste: supporte "32,5", "45 m²", etc.
function toNumLoose(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^\d.,-]/g, '').replace(',', '.'); // garde chiffres, . , -
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// prend le 1er nombre non nul d'une liste de chemins possibles
function firstNumber(vals) {
  for (const v of vals) {
    const n = toNumLoose(v);
    if (n !== 0) return n;
  }
  // si tout est 0, retourne le premier parsé (peut être 0 si c'est vraiment 0)
  return toNumLoose(vals[0]);
}

export default function SurfacePieChart({ userId }) {
  return (
    <GenericMetricPieChart
      userId={userId}
      title="Surface (m²)"
      // Cherche la surface à plusieurs endroits possibles
      valueAccessor={(info, p) =>
        firstNumber([
          info?.surface,                   // ton schéma initial
          p?.surface,                      // surface au niveau propriété
          p?.surfaceHabitable,             // cas fréquent
          p?.details?.surface,             // details.surface
          p?.caracteristiques?.surface,    // variantes FR
          p?.characteristics?.surface,     // variantes EN
          p?.metrics?.area,                // area en m²
          p?.area,
          p?.m2,
        ])
      }
      placeholderLoading="Chargement surfaces…"
      placeholderEmpty="Aucune surface à afficher."
      format="number" // pas en €
    />
  );
}
