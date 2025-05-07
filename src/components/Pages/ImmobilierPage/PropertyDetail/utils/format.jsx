// src/utils/format.js

/**
 * Formatte un nombre en euros avec deux décimales en fr-FR.
 * Ex : 1234.5 → "1 234,50 €"
 */
export function formatAmount(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });
}

/**
 * Formatte un nombre en français, sans zéros inutiles.
 * Ex : 1234.567 → "1 234,57"
 */
export function formatFrenchNumber(v) {
  if (typeof v !== 'number' || isNaN(v)) return '';
  return v.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse une chaîne en nombre (supporte espace, virgule, et tolère undefined/null).
 * Ex : "1 234,56" → 1234.56
 */
export function parseNumber(str) {
  if (str == null) return 0;
  const cleaned = String(str).replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Conversion entre valeurs annuelles et mensuelles.
 * from/to : 'annual' ou 'monthly'
 */
export function convert(str, from, to) {
  const n = parseNumber(str);
  if (from === 'annual' && to === 'monthly') return (n / 12).toFixed(2);
  if (from === 'monthly' && to === 'annual') return (n * 12).toFixed(2);
  return n.toFixed(2);
}

/**
 * Calcule le taux marginal d'imposition en fonction du revenu imposable annuel.
 */
export function getTmiRate(income) {
  const brackets = [
    { up: 11497,    rate: 0 },
    { up: 29315,    rate: 11 },
    { up: 83823,    rate: 30 },
    { up: 180294,   rate: 41 },
    { up: Infinity, rate: 45 },
  ];
  for (let b of brackets) {
    if (income <= b.up) return b.rate;
  }
  return 0;
}

/**
 * Helper pour gérer la saisie décimale et forcer 2 décimales dans un input.
 * Usage :
 *   <input onChange={handleChange(setter)} />
 */
export function handleChange(setter) {
  return e => {
    const n = parseNumber(e.target.value);
    setter(n.toFixed(2));
  };
}

/**
 * Formatte une date ISO ou JS Date en "JJ/MM/AAAA".
 * Ex : "2025-05-04" → "04/05/2025"
 */
export function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString('fr-FR');
}
