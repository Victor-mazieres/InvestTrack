// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfoShort.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

/* ================================
   HOOK DE CALCUL — COURTE DURÉE
   ================================ */
function useShortTermCalculations(fin) {
  const num = v => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

  return useMemo(() => {
    if (!fin) return {};

    // ---- Base investissement
    const prixAgence = num(fin.prixAgence || fin.netVendeur);
    const notaire    = (num(fin.fraisNotairePct || 8) / 100) * Math.max(0, num(fin.netVendeur) - num(fin.decoteMeuble));
    const travauxTot = num(fin.travaux) + num(fin.travauxEstimes) + num(fin.travauxRestants);
    const totalInvestment = prixAgence + num(fin.fraisAgence) + notaire + travauxTot;

    const apport          = num(fin.apport);
    const principal       = Math.max(0, totalInvestment - apport);

    // ---- Crédit (annuité simple)
    const mRate = num(fin.tauxPret) / 100 / 12;
    const n     = Math.max(1, num(fin.dureePretAnnees) * 12);
    const mensualite = mRate > 0 ? (principal * mRate) / (1 - Math.pow(1 + mRate, -n)) : principal / n;
    const monthlyInsurance = num(fin.assurEmprunteur);
    const annualDebtService = (mensualite + monthlyInsurance) * 12;

    // ---- Charges fixes annuelles
    const annualFixed =
      num(fin.taxeFonciere) +
      num(fin.chargesCopro) +
      num(fin.assurancePno) +
      num(fin.elecGaz) * 12 +
      num(fin.internet) * 12 +
      num(fin.entretien) * 12 +
      num(fin.autreSortie);

    // ---- LCD block
    const lcd = {
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
      ...(fin?.lcd || {}),
    };

    const availDays = 365 * (num(lcd.availabilityRate) / 100);

    // Revenus : saisonnalité ou moyen
    let nightsBooked = 0;
    let grossRent    = 0; // hébergement pur

    if (lcd.seasonalityEnabled) {
      for (let m = 0; m < 12; m++) {
        const days   = 365 / 12;
        const occPct = num(lcd.seasonality[m]?.occ ?? lcd.avgOccupancyRate) / 100;
        const adrm   = num(lcd.seasonality[m]?.adr ?? lcd.adr);
        const nm     = days * occPct;
        nightsBooked += nm;
        grossRent    += nm * adrm;
      }
      const scale = availDays / 365;
      nightsBooked *= scale;
      grossRent    *= scale;
    } else {
      nightsBooked = availDays * (num(lcd.avgOccupancyRate) / 100);
      grossRent    = nightsBooked * num(lcd.adr);
    }

    const stays            = nightsBooked / Math.max(1, num(lcd.avgStayLength));
    const revenueCleaning  = num(lcd.cleaningFeeChargedToGuest) * stays;
    const revenueExtras    = num(lcd.extraFeesPerStay) * stays;
    const grossRevenue     = grossRent + revenueCleaning + revenueExtras;

    const platformFees  = grossRevenue * (num(lcd.platformFeePct) / 100);
    const managementFee = grossRevenue * (num(lcd.managementPct) / 100);

    const varPerStay     = num(lcd.cleaningCostPerStay) + num(lcd.laundryCostPerStay) + num(lcd.suppliesPerStay) + num(lcd.otherVarPerStay);
    const variableCosts  = varPerStay * stays;

    const sejour = num(lcd.taxeSejourPerNight) * nightsBooked * Math.max(1, num(lcd.avgGuests));
    const tools  = num(lcd.channelManagerMonthly) * 12;

    const operatingExpenses = annualFixed + platformFees + managementFee + variableCosts + sejour + tools;
    const noi      = grossRevenue - operatingExpenses;
    const cashflow = noi - annualDebtService;

    const adr   = nightsBooked > 0 ? grossRent / nightsBooked : 0;
    const occ   = availDays > 0 ? (nightsBooked / availDays) * 100 : 0;
    const revpar = grossRent / 365; // CA hébergement / jour calendaire

    // Seuils
    const pctFees     = (num(lcd.platformFeePct) + num(lcd.managementPct)) / 100;
    const perNightVar = (varPerStay / Math.max(1, num(lcd.avgStayLength))) + (num(lcd.taxeSejourPerNight) * Math.max(1, num(lcd.avgGuests)));
    const effectiveADR = num(lcd.adr) * (1 - pctFees) - perNightVar;

    const fixedLike    = annualFixed + tools; // hors variables / %fees
    const annualTarget = fixedLike + annualDebtService; // pour CF=0
    const nightsForBreakeven = effectiveADR > 0 ? Math.ceil(annualTarget / effectiveADR) : 0;
    const occBreakeven       = availDays > 0 ? Math.min(100, (nightsForBreakeven / availDays) * 100) : 0;

    const adrBreakeven = (nightsBooked > 0)
      ? (annualTarget / nightsBooked) / (1 - pctFees) + perNightVar
      : 0;

    const cashInvested = apport + notaire + travauxTot;
    const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
    const coc     = cashInvested > 0 ? (cashflow / cashInvested) * 100 : 0;

    return {
      nightsBooked, availDays, stays, adr, occ, revpar,
      grossRent, grossRevenue, revenueCleaning, revenueExtras,
      platformFees, managementFee, variableCosts, sejour, tools, annualFixed, operatingExpenses,
      mensualite, monthlyInsurance, annualDebtService, totalInvestment, cashInvested,
      noi, cashflow, capRate, coc,
      nightsForBreakeven, occBreakeven, adrBreakeven,
    };
  }, [fin]);
}

/* ==============================
   COMPOSANTS UTILITAIRES (UI)
   ============================== */
const fmtMoney = n => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const fmtPct   = n => `${((Number(n) || 0)).toFixed(1)}%`;
const int      = n => Math.round(Number(n) || 0);

function SectionCard({ title, children, defaultOpen = true, sub }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-gray-800/70 border border-gray-700 rounded-2xl p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
      </button>
      <div className={`overflow-hidden transition-all ${open ? 'mt-4' : 'h-0 mt-0'}`}>
        {open && children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, suffix, min, step = 'any' }) {
  return (
    <label className="flex flex-col text-sm">
      <span className="text-gray-300 mb-1">{label}</span>
      <div className="relative">
        <input
          className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-white/10 text-white pr-12"
          type="number"
          step={step}
          min={min}
          inputMode="decimal"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 select-none">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Box({ title, children }) {
  return (
    <div className="bg-gray-900/40 rounded-xl border border-gray-700 p-4">
      <h3 className="font-medium mb-3 text-white">{title}</h3>
      <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">{children}</ul>
    </div>
  );
}

function KPI({ label, value, tone }) {
  const cls = tone === 'pos' ? 'text-green-400' : tone === 'neg' ? 'text-red-400' : 'text-white';
  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <strong className={`ml-4 ${cls}`}>{value}</strong>
    </li>
  );
}

/* =======================================
   INPUTS COMMUNS — ACHAT / CRÉDIT / FIXES
   ======================================= */
function CreditSection({ values, onChange, results }) {
  const v = values || {};
  return (
    <SectionCard title="Achat & Crédit" sub="Hypothèses d’acquisition et financement">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Field label="Prix (agence)" value={v.prixAgence} onChange={val => onChange.setPrixAgence(val)} suffix="€" />
        <Field label="Frais d'agence" value={v.fraisAgence} onChange={val => onChange.setFraisAgence(val)} suffix="€" />
        <Field label="Net vendeur" value={v.netVendeur} onChange={val => onChange.setNetVendeur(val)} suffix="€" />
        <Field label="Décote mobilier" value={v.decoteMeuble} onChange={val => onChange.setDecoteMeuble(val)} suffix="€" />
        <Field label="Frais de notaire" value={v.fraisNotairePct} onChange={val => onChange.setFraisNotairePct(val)} suffix="%" />
        <Field label="Travaux" value={v.travaux} onChange={val => onChange.setTravaux(val)} suffix="€" />
        <Field label="Travaux estimés" value={v.travauxEstimes} onChange={val => onChange.setTravauxEstimes(val)} suffix="€" />
        <Field label="Travaux restants" value={v.travauxRestants} onChange={val => onChange.setTravauxRestants(val)} suffix="€" />
        <Field label="Taux prêt" value={v.tauxPret} onChange={val => onChange.setTauxPret(val)} suffix="%" />
        <Field label="Durée prêt" value={v.dureePretAnnees} onChange={val => onChange.setDureePretAnnees(val)} suffix="ans" step="1" min="1" />
        <Field label="Apport" value={v.apport} onChange={val => onChange.setApport(val)} suffix="€" />
        <Field label="Assurance (mois)" value={v.assurEmprunteur} onChange={val => onChange.setAssurEmprunteur(val)} suffix="€" />
      </div>

      {results && (
        <div className="mt-3 text-sm text-gray-300">
          Mensualité estimée (hors ass.) : <b>{fmtMoney(results.mensualite)}</b> / mois
        </div>
      )}
    </SectionCard>
  );
}

function ExpensesSection({ values, onChange, results }) {
  const v = values || {};
  return (
    <SectionCard title="Charges fixes annuelles" sub="Taxe foncière, copro, PNO, abonnements…">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Field label="Taxe foncière" value={v.taxeFonciere} onChange={val => onChange.setTaxeFonciere(val)} suffix="€" />
        <Field label="Charges copro" value={v.chargesCopro} onChange={val => onChange.setChargesCopro(val)} suffix="€" />
        <Field label="Assurance PNO" value={v.assurancePno} onChange={val => onChange.setAssurancePno(val)} suffix="€" />
        <Field label="Élec/Gaz (mois)" value={v.elecGaz} onChange={val => onChange.setElecGaz(val)} suffix="€" />
        <Field label="Internet (mois)" value={v.internet} onChange={val => onChange.setInternet(val)} suffix="€" />
        <Field label="Entretien (mois)" value={v.entretien} onChange={val => onChange.setEntretien(val)} suffix="€" />
        <Field label="Autre (an)" value={v.autreSortie} onChange={val => onChange.setAutreSortie(val)} suffix="€" />
      </div>

      {results && (
        <div className="mt-3 text-sm text-gray-300">
          Charges fixes totales : <b>{fmtMoney(results.annualFixed)}</b> / an
        </div>
      )}
    </SectionCard>
  );
}

/* ===========================================
   INPUTS LCD — REVENUS & COÛTS VARIABLES
   =========================================== */
function STRIncomeSection({ values, onChange }) {
  const v = values || {};
  const set = key => val => onChange(key, val);

  return (
    <SectionCard title="Revenus — Courte durée" sub="Disponibilité, occupation, ADR et saisonnalité">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Field label="Taux de dispo." value={v.availabilityRate} onChange={set('availabilityRate')} suffix="%" />
        <Field label="Taux d'occupation" value={v.avgOccupancyRate} onChange={set('avgOccupancyRate')} suffix="%" />
        <Field label="Durée moy. séjour" value={v.avgStayLength} onChange={set('avgStayLength')} suffix="nuits" />
        <Field label="ADR (€/nuit)" value={v.adr} onChange={set('adr')} suffix="€" />
      </div>

      <label className="inline-flex items-center gap-2 mt-4 text-sm">
        <input
          type="checkbox"
          checked={!!v.seasonalityEnabled}
          onChange={e => onChange('seasonalityEnabled', e.target.checked)}
        />
        <span>Activer la saisonnalité mensuelle</span>
      </label>
    </SectionCard>
  );
}

function STRCostsSection({ values, onChange }) {
  const v = values || {};
  const set = key => val => onChange(key, val);

  return (
    <SectionCard title="Coûts & Plateformes" sub="Frais plateformes, conciergerie et variables par séjour">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Field label="Frais plateforme" value={v.platformFeePct} onChange={set('platformFeePct')} suffix="%" />
        <Field label="Conciergerie" value={v.managementPct} onChange={set('managementPct')} suffix="%" />
        <Field label="Channel manager (mois)" value={v.channelManagerMonthly} onChange={set('channelManagerMonthly')} suffix="€" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-3">
        <Field label="Ménage / séjour" value={v.cleaningCostPerStay} onChange={set('cleaningCostPerStay')} suffix="€" />
        <Field label="Blanchisserie / séjour" value={v.laundryCostPerStay} onChange={set('laundryCostPerStay')} suffix="€" />
        <Field label="Consommables / séjour" value={v.suppliesPerStay} onChange={set('suppliesPerStay')} suffix="€" />
        <Field label="Autres variables / séjour" value={v.otherVarPerStay} onChange={set('otherVarPerStay')} suffix="€" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-3">
        <Field label="Taxe séjour / nuit / pers." value={v.taxeSejourPerNight} onChange={set('taxeSejourPerNight')} suffix="€" />
        <Field label="Nb moyen de voyageurs" value={v.avgGuests} onChange={set('avgGuests')} />
        <Field label="Frais ménage facturés (séjour)" value={v.cleaningFeeChargedToGuest} onChange={set('cleaningFeeChargedToGuest')} suffix="€" />
        <Field label="Frais annexes (séjour)" value={v.extraFeesPerStay} onChange={set('extraFeesPerStay')} suffix="€" />
      </div>
    </SectionCard>
  );
}

/* ===========================================
   RÉSULTATS LCD — KPIs & SEUILS
   =========================================== */
function STRResultsSection({ results }) {
  const r = results || {};
  return (
    <SectionCard title="Résultats — Courte durée" defaultOpen={false}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box title="Performance">
          <KPI label="ADR moyen" value={fmtMoney(r.adr)} />
          <KPI label="Occupation" value={fmtPct(r.occ)} />
          <KPI label="Nuits vendues (an)" value={int(r.nightsBooked)} />
          <KPI label="RevPAR (an)" value={fmtMoney(r.revpar)} />
          <KPI label="Chiffre d'affaires" value={fmtMoney(r.grossRevenue)} />
        </Box>

        <Box title="Dépenses & NOI">
          <KPI label="Frais plateforme" value={fmtMoney(r.platformFees)} />
          <KPI label="Conciergerie" value={fmtMoney(r.managementFee)} />
          <KPI label="Variables (séjours)" value={fmtMoney(r.variableCosts)} />
          <KPI label="Fixes annuels" value={fmtMoney(r.annualFixed)} />
          <KPI label="NOI (avant dette)" value={fmtMoney(r.noi)} />
          <KPI label="Service de la dette (an)" value={fmtMoney(r.annualDebtService)} />
          <KPI label="Cash-flow annuel" value={fmtMoney(r.cashflow)} tone={r.cashflow >= 0 ? 'pos' : 'neg'} />
        </Box>

        <Box title="Investissement & Seuils">
          <KPI label="Investissement total" value={fmtMoney(r.totalInvestment)} />
          <KPI label="Cash investi (apport+frais+travaux)" value={fmtMoney(r.cashInvested)} />
          <KPI label="Cap rate" value={fmtPct(r.capRate)} />
          <KPI label="Cash-on-cash" value={fmtPct(r.coc)} />
          <KPI label="Nuits à l'équilibre" value={int(r.nightsForBreakeven)} />
          <KPI label="Occupation à l'équilibre" value={fmtPct(r.occBreakeven)} />
          <KPI label="ADR à l'équilibre" value={fmtMoney(r.adrBreakeven)} />
        </Box>
      </div>
    </SectionCard>
  );
}

/* ==============================
   PAGE PRINCIPALE — LCD
   ============================== */
export default function FinancialInfoShort() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // Charger le bien + financialInfo
  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(r => { if (!r.ok) throw new Error(`Statut ${r.status}`); return r.json(); })
      .then(data => setProperty(data))
      .catch(e => setError(String(e)));
  }, [id]);

  // Valeurs par défaut
  const fin = property?.financialInfo ?? {
    prixAgence: '', fraisAgence: '', netVendeur: '', decoteMeuble: '',
    fraisNotairePct: 8, travaux: 0, travauxEstimes: 0, travauxRestants: 0,
    tauxPret: 0, dureePretAnnees: 20, apport: 0, assurEmprunteur: 0,
    taxeFonciere: 0, chargesCopro: 0, assurancePno: 0,
    elecGaz: 0, internet: 0, entretien: 0, autreSortie: 0,
    rentalMode: 'LCD',
    lcd: {
      availabilityRate: 100,
      avgOccupancyRate: 65,
      avgStayLength: 3,
      adr: 85,
      seasonalityEnabled: false,
      seasonality: [
        { adr: 70, occ: 45 }, { adr: 72, occ: 45 }, { adr: 80, occ: 55 }, { adr: 85, occ: 60 },
        { adr: 90, occ: 65 }, { adr: 95, occ: 70 }, { adr: 110, occ: 80 }, { adr: 105, occ: 78 },
        { adr: 95, occ: 70 }, { adr: 85, occ: 60 }, { adr: 80, occ: 55 }, { adr: 75, occ: 50 },
      ],
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
    }
  };

  // Helpers update
  const updateFin = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialInfo: { ...(prev?.financialInfo ?? {}), [key]: value }
    }));
  };
  const updateLCD = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialInfo: {
        ...(prev?.financialInfo ?? {}),
        lcd: { ...((prev?.financialInfo?.lcd) ?? fin.lcd), [key]: value }
      }
    }));
  };

  // Calculs
  const results = useShortTermCalculations(fin);

  // Sauvegarde
  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = { propertyId: id, rentalMode: 'LCD', ...property.financialInfo, ...results };
      const r = await fetch(`/api/properties/${id}/financial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`Statut ${r.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      alert(`Erreur : ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="text-red-500 p-4">Erreur : {error}</p>;
  if (!property) return <p className="p-4">Chargement…</p>;

  return (
    <div className="min-h-screen text-gray-100">
      {/* Header compact + primary action */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-greenLight" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-white">
            Analyse financière — Courte durée
          </h1>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            {saved && <span className="text-green-300 text-sm">Enregistré ✔</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-greenLight text-white rounded-lg hover:bg-checkgreen disabled:opacity-60"
            >
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Bandeau KPI rapides (scrollable en mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip label="NOI" value={fmtMoney(results.noi)} />
          <Chip label="Cash-flow" value={fmtMoney(results.cashflow)} tone={results.cashflow >= 0 ? 'pos' : 'neg'} />
          <Chip label="Cap rate" value={fmtPct(results.capRate)} />
          <Chip label="CoC" value={fmtPct(results.coc)} />
          <Chip label="Occupation" value={fmtPct(results.occ)} />
          <Chip label="ADR" value={fmtMoney(results.adr)} />
        </div>

        {/* Sections */}
        <CreditSection values={fin} onChange={{
          setPrixAgence:      v => updateFin('prixAgence', v),
          setFraisAgence:     v => updateFin('fraisAgence', v),
          setNetVendeur:      v => updateFin('netVendeur', v),
          setDecoteMeuble:    v => updateFin('decoteMeuble', v),
          setFraisNotairePct: v => updateFin('fraisNotairePct', v),
          setTravaux:         v => updateFin('travaux', v),
          setTravauxEstimes:  v => updateFin('travauxEstimes', v),
          setTravauxRestants: v => updateFin('travauxRestants', v),
          setTauxPret:        v => updateFin('tauxPret', v),
          setDureePretAnnees: v => updateFin('dureePretAnnees', v),
          setApport:          v => updateFin('apport', v),
          setAssurEmprunteur: v => updateFin('assurEmprunteur', v),
        }} results={results} />

        <ExpensesSection values={fin} onChange={{
          setTaxeFonciere:    v => updateFin('taxeFonciere', v),
          setChargesCopro:    v => updateFin('chargesCopro', v),
          setAssurancePno:    v => updateFin('assurancePno', v),
          setElecGaz:         v => updateFin('elecGaz', v),
          setInternet:        v => updateFin('internet', v),
          setEntretien:       v => updateFin('entretien', v),
          setAutreSortie:     v => updateFin('autreSortie', v),
        }} results={results} />

        <STRIncomeSection values={fin.lcd} onChange={updateLCD} />
        <STRCostsSection  values={fin.lcd} onChange={updateLCD} />
        <STRResultsSection results={results} />
      </main>

      {/* Save bar mobile (collée en bas) */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-20 p-3">
        <div className="mx-3 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur px-3 py-2 flex items-center gap-3 shadow-lg">
          {saved && <span className="text-green-300 text-sm">Enregistré ✔</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-4 py-2 rounded-xl bg-greenLight text-white font-medium hover:bg-checkgreen disabled:opacity-60"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value, tone }) {
  const toneCls = tone === 'pos' ? 'bg-green-500/15 border-green-500/30 text-green-200'
    : tone === 'neg' ? 'bg-red-500/15 border-red-500/30 text-red-200'
    : 'bg-white/5 border-white/10 text-gray-100';
  return (
    <div className={`whitespace-nowrap px-3 py-2 rounded-xl text-sm border ${toneCls}`}>
      <span className="text-gray-300">{label}:</span> <b className="ml-1">{value}</b>
    </div>
  );
}
