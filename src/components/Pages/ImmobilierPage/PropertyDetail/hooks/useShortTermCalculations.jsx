// Core formulas for Short-Term Rental (Airbnb) performance
export default function useShortTermCalculations(fin) {
  const {
    prixAgence = 0, fraisAgence = 0, netVendeur = 0, decoteMeuble = 0,
    fraisNotairePct = 8, travaux = 0, travauxEstimes = 0, travauxRestants = 0,
    tauxPret = 0, dureePretAnnees = 20, apport = 0,

    taxeFonciere = 0, chargesCopro = 0, assurancePno = 0, assurEmprunteur = 0,
    elecGaz = 0, internet = 0, entretien = 0, autreSortie = 0,

    lcd = {},
  } = fin || {};

  const N = v => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

  // --- Investment basis ---
  const priceAllIn = N(prixAgence || netVendeur) + N(fraisAgence);
  const notary = (N(fraisNotairePct) / 100) * Math.max(0, N(netVendeur) - N(decoteMeuble));
  const works = N(travaux) + N(travauxEstimes) + N(travauxRestants);
  const totalInvestment = priceAllIn + notary + works;
  const cashInvested = N(apport) + notary + works; // apport + frais + travaux

  // --- Credit ---
  const monthlyRate = N(tauxPret) / 100 / 12;
  const n = N(dureePretAnnees) * 12;
  const principal = Math.max(0, totalInvestment - N(apport));
  const monthlyPayment = monthlyRate > 0
    ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
    : (principal / (n || 1));
  const monthlyInsurance = N(assurEmprunteur) || 0;
  const annualDebtService = (monthlyPayment + monthlyInsurance) * 12;

  // --- Fixed annual costs ---
  const annualFixed =
    N(taxeFonciere) +
    N(chargesCopro) +
    N(assurancePno) +
    (N(elecGaz) * 12) +
    (N(internet) * 12) +
    (N(entretien) * 12) +
    N(autreSortie);

  // --- LCD defaults + merge ---
  const v = {
    availabilityRate: 100,
    avgOccupancyRate: 65,
    avgStayLength: 3,
    adr: 85,
    seasonalityEnabled: false,
    seasonality: new Array(12).fill(0).map(() => ({ adr: 85, occ: 65 })),
    platformFeePct: 3,
    managementPct: 0,
    cleaningCostPerStay: 35,
    laundryCostPerStay: 8,
    suppliesPerStay: 4,
    otherVarPerStay: 0,
    taxeSejourPerNight: 0,
    avgGuests: 2,
    channelManagerMonthly: 0,
    cleaningFeeChargedToGuest: 0,
    extraFeesPerStay: 0,
    ...lcd,
  };

  const availDays = 365 * (N(v.availabilityRate) / 100);

  // Seasonality or average model
  let nightsBooked = 0, grossRent = 0;
  if (v.seasonalityEnabled) {
    for (let m = 0; m < 12; m++) {
      const days = 365 / 12; // approx.
      const occM = N(v.seasonality[m]?.occ ?? v.avgOccupancyRate) / 100;
      const adrM = N(v.seasonality[m]?.adr ?? v.adr);
      nightsBooked += days * occM;
      grossRent    += days * occM * adrM;
    }
    const scale = availDays / 365;
    nightsBooked *= scale;
    grossRent    *= scale;
  } else {
    nightsBooked = availDays * (N(v.avgOccupancyRate) / 100);
    grossRent    = nightsBooked * N(v.adr);
  }

  // Stays & variable revenue
  const stays = nightsBooked / Math.max(1, N(v.avgStayLength));
  const revenueCleaning = N(v.cleaningFeeChargedToGuest) * stays;
  const revenueExtras   = N(v.extraFeesPerStay) * stays;
  const grossRevenue    = grossRent + revenueCleaning + revenueExtras;

  // Platform & management fees
  const platformFees  = grossRevenue * (N(v.platformFeePct) / 100);
  const managementFee = grossRevenue * (N(v.managementPct) / 100);

  // Variable operating costs
  const varPerStay     = N(v.cleaningCostPerStay) + N(v.laundryCostPerStay) + N(v.suppliesPerStay) + N(v.otherVarPerStay);
  const variableCosts  = varPerStay * stays;

  // Taxe de séjour (host-paid)
  const sejour = N(v.taxeSejourPerNight) * nightsBooked * Math.max(1, N(v.avgGuests));

  // Tools
  const tools = N(v.channelManagerMonthly) * 12;

  // NOI (pre-debt)
  const operatingExpenses = annualFixed + platformFees + managementFee + variableCosts + sejour + tools;
  const noi = grossRevenue - operatingExpenses;

  // Cashflow after debt
  const cashflow = noi - annualDebtService;

  // Metrics
  const adr     = grossRent / Math.max(1, nightsBooked);
  const occ     = (nightsBooked / Math.max(1, availDays)) * 100;
  const revpar  = adr * (nightsBooked / 365);
  const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
  const coc     = cashInvested > 0 ? (cashflow / cashInvested) * 100 : 0;

  // Breakeven approximations
  const fixedLike   = annualFixed + tools;
  const pctFees     = (N(v.platformFeePct) + N(v.managementPct)) / 100;
  const perNightVar = (varPerStay / Math.max(1, N(v.avgStayLength))) + (N(v.taxeSejourPerNight) * Math.max(1, N(v.avgGuests)));
  const effectiveADR = N(v.adr) * (1 - pctFees) - perNightVar;
  const annualTarget = fixedLike + annualDebtService;
  const nightsForBreakeven = effectiveADR > 0 ? Math.ceil(annualTarget / effectiveADR) : 0;
  const occBreakeven = availDays > 0 ? Math.min(100, (nightsForBreakeven / availDays) * 100) : 0;
  const adrBreakeven = (annualTarget / Math.max(1, nightsBooked)) / (1 - pctFees) + perNightVar;

  return {
    // Revenus
    grossRent: Math.max(0, grossRent),
    revenueCleaning,
    revenueExtras,
    grossRevenue,

    // Occupation & prix
    nightsBooked,
    availDays,
    stays,
    adr,
    occ,
    revpar,

    // Dépenses
    platformFees,
    managementFee,
    variableCosts,
    annualFixed,
    sejour,
    tools,
    operatingExpenses,

    // Invest & dette
    totalInvestment,
    cashInvested,
    monthlyPayment,
    monthlyInsurance,
    annualDebtService,

    // Résultats
    noi,
    cashflow,
    capRate,
    coc,

    // Seuils
    nightsForBreakeven,
    occBreakeven,
    adrBreakeven,
  };
}
