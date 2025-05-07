// src/components/Pages/ImmobilierPage/PropertyDetail/components/useFinancialCalculations.jsx
import { useMemo } from 'react';
import { parseNumber } from '../../utils/format';

export default function useFinancialCalculations(inputs) {
  const {
    netVendeur,
    fraisAgence,
    travaux,
    tauxPret,
    dureePretAnnees,
    taxeFonciere,
    taxeFoncierePeriod,
    chargesCopro,
    chargesCoproPeriod,
    assurancePno,
    assurancePnoPeriod,
    assurEmprunteur,
    chargeRecup,
    elecGaz,
    autreSortie,
    loyerHc,
    chargesLoc,
    tmi,
    cotSocPct,
  } = inputs;

  return useMemo(() => {
    // parsing
    const NV  = parseNumber(netVendeur);
    const FA  = parseNumber(fraisAgence);
    const TR  = parseNumber(travaux);
    const r   = parseNumber(tauxPret) / 100 / 12;
    const N   = parseNumber(dureePretAnnees) * 12;

    // sorties
    const TF  = parseNumber(taxeFonciere);
    const CP  = parseNumber(chargesCopro);
    const Pno = parseNumber(assurancePno);
    const AE  = parseNumber(assurEmprunteur);
    const CR  = parseNumber(chargeRecup);
    const EG  = parseNumber(elecGaz);
    const AS  = parseNumber(autreSortie);

    // entrées
    const LH  = parseNumber(loyerHc);
    const CL  = parseNumber(chargesLoc);

    // impôts
    const TMI = parseNumber(tmi) / 100;
    const COT = parseNumber(cotSocPct) / 100;

    // calculs
    const emprunt    = Math.max(0, NV + FA + TR);
    const mensualite = emprunt > 0 && r > 0
      ? emprunt * (r / (1 - Math.pow(1 + r, -N)))
      : 0;

    const mTF  = taxeFoncierePeriod === 'annual' ? TF / 12 : TF;
    const mCP  = chargesCoproPeriod   === 'annual' ? CP / 12 : CP;
    const mPno = assurancePnoPeriod   === 'annual' ? Pno / 12 : Pno;
    const mAE  = AE / 12;
    const mEG  = EG / 12;
    const mAS  = AS / 12;
    const totalSorties = mensualite + mTF + mCP + mPno + mAE - CR + mEG + mAS;

    const entreeHc = LH;
    const totalCc  = LH + CL;

    const baseMicro    = LH * 12 * 0.5;
    const cotSocCalc   = baseMicro * COT;
    const impotsCalc   = baseMicro * TMI;
    const impotAnnuel  = impotsCalc + cotSocCalc;
    const impotMensuel = impotAnnuel / 12;

    const cfMensuel       = entreeHc - totalSorties;
    const cfAnnuel        = cfMensuel * 12;
    const cfTotal         = cfMensuel * N;
    const interets        = mensualite * N - emprunt;
    const cfNetNetMensuel = cfMensuel - impotMensuel;
    const cfNetNetAnnuel  = cfAnnuel - impotAnnuel;
    const cfNetNetTotal   = cfTotal - impotMensuel * N;

    const to2 = x => parseFloat(x).toFixed(2);
    return {
      emprunt:           to2(emprunt),
      mensualite:        to2(mensualite),
      totalSorties:      to2(totalSorties),
      entreeHc:          to2(entreeHc),
      totalCc:           to2(totalCc),
      impotMensuel:      to2(impotMensuel),
      impotAnnuel:       to2(impotAnnuel),
      cfMensuel:         to2(cfMensuel),
      cfAnnuel:          to2(cfAnnuel),
      cfTotal:           to2(cfTotal),
      cfNetNetMensuel:   to2(cfNetNetMensuel),
      cfNetNetAnnuel:    to2(cfNetNetAnnuel),
      cfNetNetTotal:     to2(cfNetNetTotal),
      interets:          to2(interets),
    };
  }, [
    netVendeur,
    fraisAgence,
    travaux,
    tauxPret,
    dureePretAnnees,
    taxeFonciere,
    taxeFoncierePeriod,
    chargesCopro,
    chargesCoproPeriod,
    assurancePno,
    assurancePnoPeriod,
    assurEmprunteur,
    chargeRecup,
    elecGaz,
    autreSortie,
    loyerHc,
    chargesLoc,
    tmi,
    cotSocPct,
  ]);
}
