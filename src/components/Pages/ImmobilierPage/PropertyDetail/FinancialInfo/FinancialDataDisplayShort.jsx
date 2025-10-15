// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialDataDisplayShort.jsx
import React from "react";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";

/* ---------- Format / parsing ---------- */
const toNum = (n) => {
  if (typeof n === 'number') return Number.isFinite(n) ? n : NaN;
  if (typeof n === 'string' && n.trim() !== '') {
    const x = Number(n);
    return Number.isFinite(x) ? x : NaN;
  }
  return NaN;
};

function fmtMoney(n) {
  const v = toNum(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function fmtPct(n) {
  const v = toNum(n);
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(1)}%`;
}
function fmtInt(n) {
  const v = toNum(n);
  if (!Number.isFinite(v)) return "—";
  return Math.round(v).toLocaleString("fr-FR");
}

/* ---------- Recalcul local des KPI si results est absent ---------- */
function computeResultsFromData(data = {}) {
  const num = (v, fallback = 0) => {
    const x = toNum(v);
    return Number.isFinite(x) ? x : fallback;
  };

  // Base investissement
  const prixAgence = num(data.prixAgence ?? data.netVendeur);
  const fraisAgence = num(data.fraisAgence);
  const decoteMeuble = num(data.decoteMeuble);
  const fraisNotairePct = num(data.fraisNotairePct, 8);
  const netVendeur = num(data.netVendeur);
  const travaux = num(data.travaux);
  const travauxEstimes = num(data.travauxEstimes);
  const travauxRestants = num(data.travauxRestants);
  const travauxTot = travaux + travauxEstimes + travauxRestants;

  const notaire = (fraisNotairePct / 100) * Math.max(0, netVendeur - decoteMeuble);
  const totalInvestment = prixAgence + fraisAgence + notaire + travauxTot;

  const apport = num(data.apport);
  const principal = Math.max(0, totalInvestment - apport);

  // Crédit
  const tauxPret = num(data.tauxPret);
  const dureePretAnnees = num(data.dureePretAnnees, 20);
  const assurEmprunteur = num(data.assurEmprunteur);

  const mRate = tauxPret / 100 / 12;
  const n = Math.max(1, dureePretAnnees * 12);
  const mensualite = mRate > 0 ? (principal * mRate) / (1 - Math.pow(1 + mRate, -n)) : principal / n;
  const monthlyInsurance = assurEmprunteur;
  const annualDebtService = (mensualite + monthlyInsurance) * 12;

  // Fixes annuels (attention: certaines colonnes sont mensuelles)
  const taxeFonciere = num(data.taxeFonciere);
  const chargesCopro = num(data.chargesCopro);
  const assurancePno = num(data.assurancePno);
  const elecGaz = num(data.elecGaz) * 12;     // mois -> an
  const internet = num(data.internet) * 12;   // mois -> an
  const entretien = num(data.entretien) * 12; // mois -> an
  const autreSortie = num(data.autreSortie);
  const annualFixed = taxeFonciere + chargesCopro + assurancePno + elecGaz + internet + entretien + autreSortie;

  // Bloc LCD
  const lcd = data.lcd ?? {};
  const nightlyPrice2p = num(lcd.nightlyPrice2p ?? data.nightlyPrice ?? 85);
  const avgStayLength = Math.max(1, num(lcd.avgStayLength ?? data.avgStayLength ?? 3, 3));
  const taxeSejourPerNightPerPerson = num(lcd.taxeSejourPerNightPerPerson ?? data.taxeSejourPerNightPerPerson);
  const avgGuests = Math.max(1, num(lcd.avgGuests ?? data.avgGuests ?? 2, 2));

  const platformFeePct = num(lcd.platformFeePct ?? data.platformFeePct ?? 3);
  const managementPct = num(lcd.managementPct ?? data.managementPct ?? 0);
  const channelManagerMonthly = num(lcd.channelManagerMonthly ?? data.channelManagerMonthly ?? 0);

  const cleaningCostPerStay = num(lcd.cleaningCostPerStay ?? data.cleaningCostPerStay ?? 0);
  const laundryCostPerStay = num(lcd.laundryCostPerStay ?? data.laundryCostPerStay ?? 0);
  const suppliesPerStay = num(lcd.suppliesPerStay ?? data.suppliesPerStay ?? 0);
  const otherVarPerStay = num(lcd.otherVarPerStay ?? data.otherVarPerStay ?? 0);

  const availabilityRate = num(lcd.availabilityRate ?? data.availabilityRate ?? 100);
  const avgOccupancyRate = num(lcd.avgOccupancyRate ?? data.avgOccupancyRate ?? 65);

  // Revenus / coûts variables
  const adr = nightlyPrice2p;
  const varPerStay = cleaningCostPerStay + laundryCostPerStay + suppliesPerStay + otherVarPerStay;
  const perNightVarFromStay = varPerStay / avgStayLength;
  const taxeSejourPerNight = taxeSejourPerNightPerPerson * avgGuests;
  const pctFees = (platformFeePct + managementPct) / 100;

  const effectiveADR = adr * (1 - pctFees) - perNightVarFromStay - taxeSejourPerNight;

  // Seuil annuel
  const tools = channelManagerMonthly * 12;
  const fixedLike = annualFixed + tools;
  const annualTarget = fixedLike + annualDebtService;
  const nightsForBreakeven = effectiveADR > 0 ? Math.ceil(annualTarget / effectiveADR) : 0;

  // Scénario indicatif
  const availDays = 365 * (availabilityRate / 100);
  const nightsBooked = availDays * (avgOccupancyRate / 100);
  const grossRent = nightsBooked * adr;
  const grossRevenue = grossRent;

  const stays = nightsBooked / avgStayLength;
  const variableCosts = varPerStay * stays;
  const platformFees = grossRevenue * (platformFeePct / 100);
  const managementFee = grossRevenue * (managementPct / 100);
  const sejour = taxeSejourPerNight * nightsBooked;

  const operatingExpenses = annualFixed + tools + platformFees + managementFee + variableCosts + sejour;
  const noi = grossRevenue - operatingExpenses;
  const cashflow = noi - annualDebtService;

  const occ = availDays > 0 ? (nightsBooked / availDays) * 100 : 0;
  const revpar = grossRent / 365;

  const cashInvested = apport + notaire + travauxTot;
  const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
  const coc = cashInvested > 0 ? (cashflow / cashInvested) * 100 : 0;

  return {
    // revenus/occupation indicatifs
    adr, nightsBooked, availDays, stays, occ, revpar, grossRent, grossRevenue,
    // dépenses (scénario indicatif)
    platformFees, managementFee, variableCosts, sejour, tools, annualFixed, operatingExpenses,
    // dette & investissement
    mensualite, monthlyInsurance, annualDebtService, totalInvestment, cashInvested,
    // résultats
    noi, cashflow, capRate, coc,
    // seuils
    nightsForBreakeven,
    // éléments utiles pour l'UI
    effectiveADR, perNightVarFromStay, taxeSejourPerNight,
  };
}

/* ---------- Cartes UI ---------- */
function GlassCard({ title, children }) {
  return (
    <div
      className={[
        "rounded-2xl p-5",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-12px_rgba(0,0,0,0.6)]",
        "transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-greenLight border-b border-white/10 pb-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function StatLine({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100">{value}</span>
    </div>
  );
}

/* ---------- Composant principal ---------- */
export default function FinancialDataDisplayShort({ data = {}, results = {} }) {
  // Si results est vide/incomplet, on recalcule à partir de data
  const computed = computeResultsFromData(data);
  const r = { ...computed, ...results }; // results (si fourni) override le calcul local

  const lcd = data?.lcd || {};
  const view = {
    nightlyPrice2p: lcd.nightlyPrice2p ?? data.nightlyPrice,
    avgStayLength: lcd.avgStayLength ?? data.avgStayLength,
    taxeSejourPerNightPerPerson: lcd.taxeSejourPerNightPerPerson ?? data.taxeSejourPerNightPerPerson,
    avgGuests: lcd.avgGuests ?? data.avgGuests,

    platformFeePct: lcd.platformFeePct ?? data.platformFeePct,
    managementPct: lcd.managementPct ?? data.managementPct,
    cleaningCostPerStay: lcd.cleaningCostPerStay ?? data.cleaningCostPerStay,
    laundryCostPerStay: lcd.laundryCostPerStay ?? data.laundryCostPerStay,
    suppliesPerStay: lcd.suppliesPerStay ?? data.suppliesPerStay,
    otherVarPerStay: lcd.otherVarPerStay ?? data.otherVarPerStay,
    channelManagerMonthly: lcd.channelManagerMonthly ?? data.channelManagerMonthly,

    // KPIs (issus de r)
    annualFixed: r.annualFixed,
    annualDebtService: r.annualDebtService,
    effectiveADR: r.effectiveADR,
    nightsForBreakeven: r.nightsForBreakeven,
    availabilityRate: lcd.availabilityRate ?? data.availabilityRate,
    avgOccupancyRate: lcd.avgOccupancyRate ?? data.avgOccupancyRate,
    nightsBooked: r.nightsBooked,
    grossRevenue: r.grossRevenue,
    platformFees: r.platformFees,
    managementFee: r.managementFee,
    variableCosts: r.variableCosts,
    sejour: r.sejour,
    tools: r.tools,
    noi: r.noi,
    cashflow: r.cashflow,
    capRate: r.capRate,
    coc: r.coc,
    totalInvestment: r.totalInvestment,
    cashInvested: r.cashInvested,
  };

  const sections = [
    {
      title: "Paramètres Revenus (type Airbnb)",
      rows: [
        ["Prix par nuit (2 pers.)", fmtMoney(view.nightlyPrice2p)],
        ["Durée moyenne du séjour", view.avgStayLength ? `${fmtInt(view.avgStayLength)} nuits` : "—"],
        ["Taxe séjour / pers. / nuit", fmtMoney(view.taxeSejourPerNightPerPerson)],
        ["Nb moyen de personnes", view.avgGuests ?? "—"],
      ],
    },
    {
      title: "Coûts & Plateformes",
      rows: [
        ["Frais plateforme", view.platformFeePct != null ? fmtPct(view.platformFeePct) : "—"],
        ["Conciergerie", view.managementPct != null ? fmtPct(view.managementPct) : "—"],
        ["Channel manager (mois)", fmtMoney(view.channelManagerMonthly)],
        ["Ménage / séjour", fmtMoney(view.cleaningCostPerStay)],
        ["Blanchisserie / séjour", fmtMoney(view.laundryCostPerStay)],
        ["Consommables / séjour", fmtMoney(view.suppliesPerStay)],
        ["Autres variables / séjour", fmtMoney(view.otherVarPerStay)],
      ],
    },
    {
      title: "Fixes & Dette",
      rows: [
        ["Charges fixes annuelles", fmtMoney(view.annualFixed)],
        ["Service de la dette (an)", fmtMoney(view.annualDebtService)],
      ],
    },
    {
      title: "Seuil de rentabilité",
      rows: [
        ["ADR net (après frais & variables)", fmtMoney(view.effectiveADR)],
        ["Nuits à l’équilibre (cash-flow 0)", fmtInt(view.nightsForBreakeven)],
      ],
    },
    {
      title: "Performance (indicative)",
      rows: [
        ["Nuits vendues (an)", fmtInt(view.nightsBooked)],
        ["Chiffre d'affaires (an)", fmtMoney(view.grossRevenue)],
        ["Frais plateforme (an)", fmtMoney(view.platformFees)],
        ["Conciergerie (an)", fmtMoney(view.managementFee)],
        ["Variables (séjours/an)", fmtMoney(view.variableCosts)],
        ["Taxe de séjour (an)", fmtMoney(view.sejour)],
        ["Outils (channel manager / an)", fmtMoney(view.tools)],
        ["NOI (avant dette)", fmtMoney(view.noi)],
        ["Cash-flow (après dette)", fmtMoney(view.cashflow)],
      ],
    },
    {
      title: "Investissement",
      rows: [
        ["Investissement total", fmtMoney(view.totalInvestment)],
        ["Cash investi (apport + frais + travaux)", fmtMoney(view.cashInvested)],
        ["Cap rate", view.capRate != null ? fmtPct(view.capRate) : "—"],
        ["Cash-on-cash", view.coc != null ? fmtPct(view.coc) : "—"],
      ],
    },
  ];

  /* ---------- Export PDF ---------- */
  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rapport — Location Courte Durée", pageW / 2, y, { align: "center" });
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    sections.forEach((sec) => {
      y += 18;
      if (y > 760) { doc.addPage(); y = 56; }
      doc.setFont("helvetica", "bold");
      doc.text(sec.title, 40, y);
      y += 8;
      doc.setFont("helvetica", "normal");

      sec.rows.forEach(([label, value]) => {
        if (y > 780) { doc.addPage(); y = 56; }
        doc.text(`${label}: ${String(value ?? "—")}`, 56, y + 16);
        y += 16;
      });
    });

    doc.save("rapport_LCD.pdf");
  };

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => (
          <GlassCard key={i} title={sec.title}>
            <div className="space-y-2">
              {sec.rows.map(([label, value], j) => (
                <StatLine key={j} label={label} value={value} />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Bouton Export PDF */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleExportPdf}
          className="group flex items-center gap-2 px-6 py-3 rounded-3xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
        >
          <FileDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Exporter le rapport PDF (LCD)</span>
        </button>
      </div>
    </div>
  );
}
