// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfoShort.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

/* ================================
   Utils format
   ================================ */
const fmtMoney = n => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const fmtPct   = n => `${((Number(n) || 0)).toFixed(1)}%`;
const int      = n => Math.round(Number(n) || 0);

// Optionnel : si pas de proxy Vite, mets VITE_API_BASE="http://localhost:5000" dans ton .env front
const API_BASE = import.meta?.env?.VITE_API_BASE || "";

/* ================================
   HOOK DE CALCUL — COURTE DURÉE
   (Revenus simplifiés : prix/nuit 2p + taxe/pers./nuit)
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
    const monthlyInsurance  = num(fin.assurEmprunteur);
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

    // ---- Bloc LCD simplifié "type Airbnb"
    const lcd = {
      nightlyPrice2p: 85,
      avgStayLength: 3,
      taxeSejourPerNightPerPerson: 0,
      avgGuests: 2,
      platformFeePct: 3,
      managementPct: 0,
      cleaningCostPerStay: 35,
      laundryCostPerStay: 8,
      suppliesPerStay: 4,
      otherVarPerStay: 0,
      channelManagerMonthly: 0,
      availabilityRate: 100,
      avgOccupancyRate: 65,
      ...(fin?.lcd || {}),
    };

    // Revenus de référence
    const adr = num(lcd.nightlyPrice2p);
    const guests = Math.max(1, num(lcd.avgGuests));
    const stayLen = Math.max(1, num(lcd.avgStayLength));

    // Variables
    const varPerStay = num(lcd.cleaningCostPerStay) + num(lcd.laundryCostPerStay) + num(lcd.suppliesPerStay) + num(lcd.otherVarPerStay);
    const perNightVarFromStay = varPerStay / stayLen;
    const taxeSejourPerNight = num(lcd.taxeSejourPerNightPerPerson) * guests;

    const pctFees = (num(lcd.platformFeePct) + num(lcd.managementPct)) / 100;

    // ADR net
    const effectiveADR = adr * (1 - pctFees) - perNightVarFromStay - taxeSejourPerNight;

    // Seuil de rentabilité
    const tools  = num(lcd.channelManagerMonthly) * 12;
    const fixedLike    = annualFixed + tools;
    const annualTarget = fixedLike + annualDebtService;

    const nightsForBreakeven = effectiveADR > 0 ? Math.ceil(annualTarget / effectiveADR) : 0;

    // Scénario indicatif
    const availDays   = 365 * (num(lcd.availabilityRate) / 100);
    const nightsBooked = availDays * (num(lcd.avgOccupancyRate) / 100);
    const grossRent    = nightsBooked * adr;
    const grossRevenue = grossRent;

    const stays          = nightsBooked / stayLen;
    const variableCosts  = varPerStay * stays;
    const platformFees   = grossRevenue * (num(lcd.platformFeePct) / 100);
    const managementFee  = grossRevenue * (num(lcd.managementPct) / 100);
    const sejour         = taxeSejourPerNight * nightsBooked;

    const operatingExpenses = annualFixed + tools + platformFees + managementFee + variableCosts + sejour;
    const noi      = grossRevenue - operatingExpenses;
    const cashflow = noi - annualDebtService;

    const occ   = availDays > 0 ? (nightsBooked / availDays) * 100 : 0;
    const revpar = grossRent / 365;

    const cashInvested = apport + notaire + travauxTot;
    const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
    const coc     = cashInvested > 0 ? (cashflow / cashInvested) * 100 : 0;

    return {
      adr, nightsBooked, availDays, stays, occ, revpar, grossRent, grossRevenue,
      platformFees, managementFee, variableCosts, sejour, tools, annualFixed, operatingExpenses,
      mensualite, monthlyInsurance, annualDebtService, totalInvestment, cashInvested,
      noi, cashflow, capRate, coc,
      nightsForBreakeven,
      effectiveADR, perNightVarFromStay, taxeSejourPerNight,
    };
  }, [fin]);
}

/* ==============================
   UI de base
   ============================== */
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
   INPUTS LCD — REVENUS (SIMPLIFIÉS)
   =========================================== */
function STRIncomeSimpleSection({ values, onChange, results }) {
  const v = values || {};
  const set = key => val => onChange(key, val);

  return (
    <SectionCard
      title="Revenus — Prix/nuit & Taxe"
      sub="Saisissez le prix par nuit (pour 2 pers.) et la taxe de séjour par personne/nuit. Le nombre de nuits à l’équilibre est calculé automatiquement."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Field label="Prix par nuit (2 pers.)" value={v.nightlyPrice2p} onChange={set('nightlyPrice2p')} suffix="€" />
        <Field label="Durée moy. séjour" value={v.avgStayLength} onChange={set('avgStayLength')} suffix="nuits" />
        <Field label="Taxe séjour / pers. / nuit" value={v.taxeSejourPerNightPerPerson} onChange={set('taxeSejourPerNightPerPerson')} suffix="€" />
        <Field label="Nb moyen de personnes" value={v.avgGuests} onChange={set('avgGuests')} />
      </div>

      {results && (
        <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-sm text-gray-300">
            Avec un prix de <b className="text-white">{fmtMoney(results.adr)}</b> par nuit pour 2 personnes,
            il faut environ <b className="text-white">{int(results.nightsForBreakeven)}</b> nuits par an pour
            atteindre l’équilibre (cash-flow 0).
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ADR net après frais & variables : <b className="text-gray-200">{fmtMoney(results.effectiveADR)}</b> / nuit.
          </p>
        </div>
      )}
    </SectionCard>
  );
}

/* ===========================================
   COÛTS — PLATEFORMES & VARIABLES
   =========================================== */
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
    </SectionCard>
  );
}

/* ===========================================
   RÉSULTATS — KPIs & SEUIL
   =========================================== */
function STRResultsSection({ results }) {
  const r = results || {};
  return (
    <SectionCard title="Résultats — Courte durée" defaultOpen={false}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box title="Seuil de rentabilité">
          <KPI label="Nuits à l'équilibre" value={int(r.nightsForBreakeven)} />
          <KPI label="ADR net (après frais/variables)" value={fmtMoney(r.effectiveADR)} />
        </Box>

        <Box title="Performance (indicative)">
          <KPI label="ADR moyen" value={fmtMoney(r.adr)} />
          <KPI label="Occupation" value={fmtPct(r.occ)} />
          <KPI label="Nuits vendues (an)" value={int(r.nightsBooked)} />
          <KPI label="RevPAR (an)" value={fmtMoney(r.revpar)} />
          <KPI label="Chiffre d'affaires" value={fmtMoney(r.grossRevenue)} />
        </Box>

        <Box title="Dépenses & NOI (indicatifs)">
          <KPI label="Frais plateforme" value={fmtMoney(r.platformFees)} />
          <KPI label="Conciergerie" value={fmtMoney(r.managementFee)} />
          <KPI label="Variables (séjours)" value={fmtMoney(r.variableCosts)} />
          <KPI label="Fixes annuels" value={fmtMoney(r.annualFixed)} />
          <KPI label="NOI (avant dette)" value={fmtMoney(r.noi)} />
          <KPI label="Service de la dette (an)" value={fmtMoney(r.annualDebtService)} />
          <KPI label="Cash-flow annuel" value={fmtMoney(r.cashflow)} tone={r.cashflow >= 0 ? 'pos' : 'neg'} />
        </Box>

        <Box title="Investissement">
          <KPI label="Investissement total" value={fmtMoney(r.totalInvestment)} />
          <KPI label="Cash investi (apport+frais+travaux)" value={fmtMoney(r.cashInvested)} />
          <KPI label="Cap rate" value={fmtPct(r.capRate)} />
          <KPI label="Cash-on-cash" value={fmtPct(r.coc)} />
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

  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  // Charger le bien (avec financialCld)
  useEffect(() => {
    fetch(`${API_BASE}/api/properties/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`Statut ${r.status}`); return r.json(); })
      .then(data => setProperty(data))
      .catch(e => setError(String(e)));
  }, [id]);

  // Valeurs par défaut si aucune financialCld
  const fin = property?.financialCld ?? {
    // Achat & crédit
    prixAgence: '', fraisAgence: '', netVendeur: '', decoteMeuble: '',
    fraisNotairePct: 8, travaux: 0, travauxEstimes: 0, travauxRestants: 0,
    tauxPret: 0, dureePretAnnees: 20, apport: 0, assurEmprunteur: 0,

    // Charges fixes
    taxeFonciere: 0, chargesCopro: 0, assurancePno: 0,
    elecGaz: 0, internet: 0, entretien: 0, autreSortie: 0,

    rentalMode: 'LCD',

    // Bloc LCD simplifié
    lcd: {
      nightlyPrice2p: 85,
      avgStayLength: 3,
      taxeSejourPerNightPerPerson: 0,
      avgGuests: 2,

      platformFeePct: 3,
      managementPct: 0,
      cleaningCostPerStay: 35,
      laundryCostPerStay: 8,
      suppliesPerStay: 4,
      otherVarPerStay: 0,
      channelManagerMonthly: 0,

      availabilityRate: 100,
      avgOccupancyRate: 65,
    }
  };

  // Helpers update (ciblent financialCld)
  const updateFin = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialCld: { ...(prev?.financialCld ?? {}), [key]: value }
    }));
  };
  const updateLCD = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialCld: {
        ...(prev?.financialCld ?? {}),
        lcd: { ...((prev?.financialCld?.lcd) ?? fin.lcd), [key]: value }
      }
    }));
  };

  // Calculs
  const results = useShortTermCalculations(fin);

  // Sauvegarde -> route LCD dédiée + redirection vers la fiche bien
  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    setSaved(false);
    try {
      const {
        prixAgence = 0, fraisAgence = 0, netVendeur = 0, decoteMeuble = 0, fraisNotairePct = 0,
        travaux = 0, travauxEstimes = 0, travauxRestants = 0,
        tauxPret = 0, dureePretAnnees = 0, apport = 0, assurEmprunteur = 0,
        taxeFonciere = 0, chargesCopro = 0, assurancePno = 0,
        elecGaz = 0, internet = 0, entretien = 0, autreSortie = 0,
        lcd = {}
      } = property.financialCld || fin;

      const payload = {
        prixAgence, fraisAgence, netVendeur, decoteMeuble, fraisNotairePct,
        travaux, travauxEstimes, travauxRestants,
        tauxPret, dureePretAnnees, apport, assurEmprunteur,
        taxeFonciere, chargesCopro, assurancePno,
        elecGaz, internet, entretien, autreSortie,
        lcd,
        rentalMode: 'LCD',
      };

      const r = await fetch(`${API_BASE}/api/properties/${id}/financial/lcd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status} ${msg}`);
      }

      setSaved(true);
      // Redirection vers la fiche bien (même logique que LLD)
      navigate(`/property/${id}`);
    } catch (e) {
      alert(`Erreur : ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="text-red-500 p-4">Erreur : {error}</p>;
  if (!property) return <p className="p-4">Chargement…</p>;

  return (
    <div className="min-h-screen text-gray-100 pb-24">
      {/* Header sans bouton Sauvegarder (on laisse uniquement Retour) */}
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
          {/* plus de bouton sauvegarde ici */}
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* KPI rapides */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip label="NOI" value={fmtMoney(results.noi)} />
          <Chip label="Cash-flow" value={fmtMoney(results.cashflow)} tone={results.cashflow >= 0 ? 'pos' : 'neg'} />
          <Chip label="Cap rate" value={fmtPct(results.capRate)} />
          <Chip label="CoC" value={fmtPct(results.coc)} />
          <Chip label="Nuits à l’équilibre" value={int(results.nightsForBreakeven)} />
          <Chip label="ADR net" value={fmtMoney(results.effectiveADR)} />
        </div>

        {/* Sections */}
        <CreditSection
          values={fin}
          onChange={{
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
          }}
          results={results}
        />

        <ExpensesSection
          values={fin}
          onChange={{
            setTaxeFonciere:    v => updateFin('taxeFonciere', v),
            setChargesCopro:    v => updateFin('chargesCopro', v),
            setAssurancePno:    v => updateFin('assurancePno', v),
            setElecGaz:         v => updateFin('elecGaz', v),
            setInternet:        v => updateFin('internet', v),
            setEntretien:       v => updateFin('entretien', v),
            setAutreSortie:     v => updateFin('autreSortie', v),
          }}
          results={results}
        />

        <STRIncomeSimpleSection values={fin.lcd} onChange={updateLCD} results={results} />
        <STRCostsSection       values={fin.lcd} onChange={updateLCD} />
        <STRResultsSection     results={results} />

        {/* Bouton de sauvegarde bas de page (desktop & tablette) */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 px-4 py-2 rounded-xl bg-greenLight text-white font-semibold hover:bg-checkgreen disabled:opacity-60"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </main>

      {/* Barre de sauvegarde mobile */}
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
