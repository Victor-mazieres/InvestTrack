// src/hooks/useFinancials.js
import { useMemo } from 'react';

/**
 * Calculs financiers pour un bien
 * @param {object|null|undefined} finParam  Objet financialInfo (peut être null/undefined)
 * @param {Array}                bills     Liste des factures
 * @returns {{
 *   totalBills: number,
 *   travauxEstimes: number,
 *   travauxRestants: number,
 *   budgetRestant: number,
 *   pieData: Array<{name: string, value: number}>
 * }}
 */
export function useFinancials(finParam, bills = []) {
  // 1. Neutralise finParam falsy
  const fin = finParam || {};

  // 2. Déstructuration avec valeurs par défaut
  const {
    initialBudget         = 0,
    travaux               = 0,
    travauxEstimes: altTravauxEstimes = 0,
    loyerHc               = 0,
    taxeFonciere          = 0,
    taxeFoncierePeriod    = 'monthly',
    chargesCopro          = 0,
    chargesCoproPeriod    = 'monthly',
    assurancePno          = 0,
    assurancePnoPeriod    = 'monthly',
    chargeRecup           = 0,
  } = fin;

  // 3. Total des factures
  const totalBills = useMemo(
    () => bills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0),
    [bills]
  );

  // 4. Estimation initiale des travaux
  const travauxEstimes = useMemo(
    () => parseFloat(travaux ?? altTravauxEstimes) || 0,
    [travaux, altTravauxEstimes]
  );

  // 5. Travaux restants = estimation – factures (jamais négatif)
  const travauxRestants = useMemo(
    () => Math.max(0, travauxEstimes - totalBills),
    [travauxEstimes, totalBills]
  );

  // 6. Budget restant = travaux estimés – total factures (jamais négatif)
  const budgetRestant = useMemo(
    () => Math.max(0, travauxEstimes - totalBills),
    [travauxEstimes, totalBills]
  );

  // 7. Données pour le camembert (hors factures/travaux)
  const pieData = useMemo(() => {
    const toMonthly = v => parseFloat(v || 0) / 12;
    return [
      { name: 'Loyer HC',      value: parseFloat(loyerHc) },
      {
        name: 'Taxe foncière',
        value:
          taxeFoncierePeriod === 'annual'
            ? toMonthly(taxeFonciere)
            : parseFloat(taxeFonciere),
      },
      {
        name: 'Charges copro',
        value:
          chargesCoproPeriod === 'annual'
            ? toMonthly(chargesCopro)
            : parseFloat(chargesCopro),
      },
      {
        name: 'Assurance PNO',
        value:
          assurancePnoPeriod === 'annual'
            ? toMonthly(assurancePno)
            : parseFloat(assurancePno),
      },
      {
        name: 'Charges récupérables',
        value: parseFloat(chargeRecup),
      },
    ];
  }, [
    loyerHc,
    taxeFonciere, taxeFoncierePeriod,
    chargesCopro, chargesCoproPeriod,
    assurancePno, assurancePnoPeriod,
    chargeRecup,
  ]);

  return { totalBills, travauxEstimes, travauxRestants, budgetRestant, pieData };
}
