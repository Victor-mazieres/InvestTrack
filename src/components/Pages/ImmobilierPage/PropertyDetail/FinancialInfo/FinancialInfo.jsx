// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfo.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Info, X } from 'lucide-react';

// Formate un nombre en français, sans zéros inutiles
function formatFrenchNumber(v) {
  if (typeof v !== 'number' || isNaN(v)) return '';
  return v.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Parse une chaîne en nombre (supporte espace, virgule, et tolère undefined/null)
function parseNumber(str) {
  if (str == null) return 0;
  const cleaned = String(str).replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function FinancialInfo() {
  const navigate = useNavigate();
  const { id } = useParams();

  // États de saisie pour les coûts d'achat et de crédit
  const [prixAgence, setPrixAgence]                 = useState('40000.00');
  const [fraisAgence, setFraisAgence]               = useState('5000.00');
  const [netVendeur, setNetVendeur]                 = useState('35000.00');
  const [decoteMeuble, setDecoteMeuble]             = useState('1750.00');
  const [fraisNotairePct, setFraisNotairePct]       = useState('8.00');
  const [travaux, setTravaux]                       = useState('1500.00');
  const [tauxPret, setTauxPret]                     = useState('3.50');
  const [dureePret, setDureePret]                   = useState('20.00');

  // États de saisie pour les charges et taxes
  const [taxeFonciere, setTaxeFonciere]             = useState('500.00');
  const [taxeFoncierePeriod, setTaxeFoncierePeriod] = useState('annual');
  const [chargesCopro, setChargesCopro]             = useState('420.00');
  const [chargesCoproPeriod, setChargesCoproPeriod] = useState('annual');
  const [assurancePNO, setAssurancePNO]             = useState('144.00');
  const [assurancePNOPeriod, setAssurancePNOPeriod] = useState('annual');
  const [assurEmprunteur, setAssurEmprunteur]       = useState('0.00');
  const [chargeRecup, setChargeRecup]               = useState('0.00');
  const [autreSortie, setAutreSortie]               = useState('0.00');
  const [elecGaz, setElecGaz]                       = useState('0.00');

  // États de saisie pour les loyers
  const [loyerHC, setLoyerHC]       = useState('314.00');
  const [chargesLoc, setChargesLoc] = useState('35.00');

  // États de saisie pour la fiscalité
  const [tmi, setTmi]             = useState('0.00');
  const [cotSocPct, setCotSocPct] = useState('17.20');

  // Modal TMI
  const [showTmiModal, setShowTmiModal] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');

  // Helper : gère la saisie décimale et force 2 décimales
  const handleChange = setter => e => {
    const n = parseNumber(e.target.value);
    setter(n.toFixed(2));
  };

  // Conversion annual ↔ monthly
  function convert(str, from, to) {
    const n = parseNumber(str);
    let res = n;
    if (from === 'annual' && to === 'monthly') res = n / 12;
    if (from === 'monthly' && to === 'annual') res = n * 12;
    return res.toFixed(2);
  }

  // Calcul du taux marginal d'imposition
  function getTmiRate(income) {
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

  // Calculs financiers principaux
  const results = useMemo(() => {
    // Parsing
    const NV  = parseNumber(netVendeur);
    const FA  = parseNumber(fraisAgence);
    const TR  = parseNumber(travaux);
    const r   = parseNumber(tauxPret) / 100 / 12;
    const N   = parseNumber(dureePret) * 12;

    const TF  = parseNumber(taxeFonciere);
    const CP  = parseNumber(chargesCopro);
    const PNO = parseNumber(assurancePNO);
    const AE  = parseNumber(assurEmprunteur);
    const CR  = parseNumber(chargeRecup);
    const AS  = parseNumber(autreSortie);
    const EG  = parseNumber(elecGaz);

    const LH  = parseNumber(loyerHC);
    const CL  = parseNumber(chargesLoc);

    const TMI = parseNumber(tmi) / 100;
    const COT = parseNumber(cotSocPct) / 100;

    // 1. Emprunt et mensualité
    const emprunt    = Math.max(0, NV + FA + TR);
    const mensualite = emprunt > 0 && r > 0
      ? emprunt * (r / (1 - Math.pow(1 + r, -N)))
      : 0;

    // 2. Sorties mensuelles
    const mTF  = taxeFoncierePeriod === 'annual' ? TF / 12 : TF;
    const mCP  = chargesCoproPeriod   === 'annual' ? CP / 12 : CP;
    const mPNO = assurancePNOPeriod   === 'annual' ? PNO / 12 : PNO;
    const mAE  = AE / 12;
    const mEG  = EG / 12;
    const mAS  = AS / 12;
    const totalSorties = mensualite + mTF + mCP + mPNO + mAE - CR + mEG + mAS;

    // 3. Entrées
    const entreeHC = LH;
    const totalCC  = LH + CL;

    // 4. Impôts
    const baseMicro    = LH * 12 * 0.5;
    const cotSocCalc   = baseMicro * COT;
    const impotsCalc   = baseMicro * TMI;
    const impotAnnuel  = impotsCalc + cotSocCalc;
    const impotMensuel = impotAnnuel / 12;

    // 5. Cash flow
    const cfMensuel       = entreeHC - totalSorties;
    const cfAnnuel        = cfMensuel * 12;
    const cfTotal         = cfMensuel * N;
    const interets        = mensualite * N - emprunt;
    const cfNetNetMensuel = cfMensuel - impotMensuel;
    const cfNetNetAnnuel  = cfAnnuel - impotAnnuel;
    const cfNetNetTotal   = cfTotal - impotMensuel * N;

    // Formatage
    const to2 = x => parseFloat(x).toFixed(2);
    return {
      emprunt:           to2(emprunt),
      mensualite:        to2(mensualite),
      totalSorties:      to2(totalSorties),
      entreeHC:          to2(entreeHC),
      totalCC:           to2(totalCC),
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
    prixAgence, fraisAgence, netVendeur, decoteMeuble, fraisNotairePct, travaux,
    tauxPret, dureePret,
    taxeFonciere, taxeFoncierePeriod,
    chargesCopro, chargesCoproPeriod,
    assurancePNO, assurancePNOPeriod,
    assurEmprunteur, chargeRecup, autreSortie, elecGaz,
    loyerHC, chargesLoc,
    tmi, cotSocPct,
  ]);

  // Envoi des données au serveur et retour à la page détail
  const handleSave = () => {
    // Fusionne les inputs manquants avec les résultats calculés
    const payload = {
      taxeFonciere,
      taxeFoncierePeriod,
      chargesCopro,
      chargesCoproPeriod,
      assurancePNO,
      assurancePNOPeriod,
      chargeRecup,
      loyerHC,
      chargesLoc,
      ...results
    };

    fetch(`http://localhost:5000/api/properties/${id}/financial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) return Promise.reject(res);
        return res.json();
      })
      .then(() => {
        navigate(-1);
      })
      .catch(err => {
        console.error(err);
        alert('Erreur lors de la sauvegarde');
      });
  };

  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  const inputClass   = 'w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl px-4 py-2';

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-gray-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* En-tête */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-700 rounded-full shadow hover:bg-gray-600 transition"
          >
            <ArrowLeft className="w-6 h-6 text-greenLight" />
          </button>
          <h1 className="text-2xl font-bold text-white">Calculateur Immobilier</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-greenLight text-gray-900 rounded-3xl shadow hover:bg-green-400 transition"
        >
          <Save className="mr-2" /> Sauvegarder
        </button>
      </header>

      {/* Bloc 1 – Mensualités de crédit */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-white mb-6">Mensualités de crédit</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            ['Prix agence (€)', prixAgence, setPrixAgence],
            ['Frais agence (€)', fraisAgence, setFraisAgence],
            ['Prix net vendeur (€)', netVendeur, setNetVendeur],
            ['Décote meuble (€)', decoteMeuble, setDecoteMeuble],
            ['Frais notaire (%)', fraisNotairePct, setFraisNotairePct],
            ['Travaux (€)', travaux, setTravaux],
            ['Taux prêt (%)', tauxPret, setTauxPret],
            ['Durée prêt (ans)', dureePret, setDureePret],
          ].map(([label, val, setter], i) => (
            <div key={i}>
              <label className="block text-sm text-gray-400 mb-2">{label}</label>
              <input
                className={inputClass}
                value={formatFrenchNumber(parseNumber(val))}
                onChange={handleChange(setter)}
              />
            </div>
          ))}
        </div>

        {/* Récapitulatif crédit */}
        <div className="border-t border-gray-600 mt-6 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span>Montant emprunté</span>
            <span className="font-semibold text-xl text-greenLight">
              {formatFrenchNumber(parseNumber(results.emprunt))}€
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mensualité</span>
            <span className="font-semibold text-xl text-greenLight">
              {formatFrenchNumber(parseNumber(results.mensualite))}€
            </span>
          </div>
        </div>
      </section>

      {/* Bloc 2 – Sorties mensuelles */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-white mb-6">Sorties mensuelles</h2>

        {/* Taxe foncière */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Taxe foncière</label>
          <div className="flex flex-wrap items-center space-x-4 mb-4">
            {['monthly','annual'].map(p => (
              <label key={p} className="flex items-center space-x-2 text-gray-200">
                <input
                  type="radio"
                  checked={taxeFoncierePeriod === p}
                  onChange={() => {
                    setTaxeFonciere(convert(taxeFonciere, taxeFoncierePeriod, p));
                    setTaxeFoncierePeriod(p);
                  }}
                />
                <span className="capitalize">{p === 'annual' ? 'Annuel' : 'Mensuel'}</span>
              </label>
            ))}
          </div>
          <input
            className={inputClass + ' md:w-32'}
            value={formatFrenchNumber(parseNumber(taxeFonciere))}
            onChange={handleChange(setTaxeFonciere)}
          />
        </div>

        {/* Charges copropriété et Assurance PNO */}
        {[
          ['Charges copropriété', chargesCopro, setChargesCopro, chargesCoproPeriod, setChargesCoproPeriod],
          ['Assurance PNO',      assurancePNO, setAssurancePNO, assurancePNOPeriod, setAssurancePNOPeriod],
        ].map(([label, val, setter, period, setPeriod], i) => (
          <div key={i} className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">{label}</label>
            <div className="flex flex-wrap items-center space-x-4 mb-4">
              {['monthly','annual'].map(p => (
                <label key={p} className="flex items-center space-x-2 text-gray-200">
                  <input
                    type="radio"
                    checked={period === p}
                    onChange={() => {
                      setter(convert(val, period, p));
                      setPeriod(p);
                    }}
                  />
                  <span className="capitalize">{p === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                </label>
              ))}
            </div>
            <input
              className={inputClass + ' md:w-32'}
              value={formatFrenchNumber(parseNumber(val))}
              onChange={handleChange(setter)}
            />
          </div>
        ))}

        {/* Autres sorties */}
        <div className="space-y-4 mb-4">
          {[
            ['Assur. emprunteur', assurEmprunteur, setAssurEmprunteur],
            ['Charge récupérable', chargeRecup, setChargeRecup],
            ['Élec / Gaz', elecGaz, setElecGaz],
            ['Autre sortie', autreSortie, setAutreSortie],
          ].map(([label, val, setter], i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-200">{label}</span>
              <input
                className="w-24 flex-shrink-0 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl text-right"
                value={formatFrenchNumber(parseNumber(val))}
                onChange={handleChange(setter)}
              />
            </div>
          ))}
        </div>

        {/* Récapitulatif sorties */}
        <div className="border-t border-gray-600 mt-6 pt-4 flex justify-between">
          <span className="font-semibold text-white">Total sorties</span>
          <span className="font-semibold text-xl text-greenLight">
            {formatFrenchNumber(parseNumber(results.totalSorties))}€
          </span>
        </div>
      </section>

      {/* Bloc 3 – Entrées */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-white mb-6">Entrées</h2>
        <div className="space-y-4 mb-4">
          {[
            ['Loyer HC', loyerHC, setLoyerHC],
            ['Charges locataire', chargesLoc, setChargesLoc],
          ].map(([label, val, setter], i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-200">{label}</span>
              <input
                className="w-24 flex-shrink-0 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl text-right"
                value={formatFrenchNumber(parseNumber(val))}
                onChange={handleChange(setter)}
              />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-600 mt-6 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-white">Total HC</span>
            <span className="font-semibold text-xl text-greenLight">
              {formatFrenchNumber(parseNumber(results.entreeHC))}€
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Total CC</span>
            <span className="font-semibold text-xl">
              {formatFrenchNumber(parseNumber(results.totalCC))}€
            </span>
          </div>
        </div>
      </section>

      {/* Bloc 4 – Impôts */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-white mb-6">Impôts</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Revenu annuel HC</span>
            <span className="font-medium">
              {formatFrenchNumber(parseNumber(results.entreeHC) * 12)}€
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Après 50% (base Micro-BIC)</span>
            <span className="font-medium">
              {formatFrenchNumber(parseNumber(results.entreeHC) * 12 * 0.5)}€
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Cotisations sociales</span>
            <span className="font-medium">
              {formatFrenchNumber(parseNumber(results.entreeHC) * 12 * 0.5 * parseNumber(cotSocPct) / 100)}€
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>TMI (%)</span>
            <div className="flex items-center space-x-2">
              <input
                className="w-16 flex-shrink-0 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl text-right"
                value={formatFrenchNumber(parseNumber(tmi))} 
                onChange={handleChange(setTmi)}
              />
              <button
                onClick={() => setShowTmiModal(true)}
                className="p-1 rounded hover:bg-gray-700 transition"
              >
                <Info className="w-5 h-5 text-gray-200 hover:text-white" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Impôt mensuel</span>
            <span className="font-medium text-greenLight">
              {formatFrenchNumber(parseNumber(results.impotMensuel))}€
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Impôt annuel total</span>
            <span className="font-medium text-greenLight">
              {formatFrenchNumber(parseNumber(results.impotAnnuel))}€
            </span>
          </div>
        </div>
      </section>

      {/* Bloc 5 – Résultats */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-white mb-6">Résultats</h2>
        <div className="space-y-4">
          {[
            ['Cash flow / mois', results.cfMensuel],
            ['Cash flow / an',   results.cfAnnuel],
            ['Cash flow total',  results.cfTotal],
          ].map(([label, val], i) => {
            const num = parseNumber(val);
            const colorClass = num >= 0 ? 'text-checkgreen' : 'text-checkred';
            return (
              <div key={i} className="flex justify-between items-center">
                <span>{label}</span>
                <span className={`font-medium ${colorClass}`}>
                  {formatFrenchNumber(num)}€
                </span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-600 mt-6 pt-4 space-y-4">
          {[
            ['Cash flow net net / mois', results.cfNetNetMensuel],
            ['Cash flow net net / an',   results.cfNetNetAnnuel],
            ['Cash flow net net total',  results.cfNetNetTotal],
          ].map(([label, val], i) => {
            const num = parseNumber(val);
            const colorClass = num >= 0 ? 'text-checkgreen' : 'text-checkred';
            return (
              <div key={i} className="flex justify-between items-center">
                <span>{label}</span>
                <span className={`font-medium ${colorClass}`}>
                  {formatFrenchNumber(num)}€
                </span>
              </div>
            );
          })}
          <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center">
            <span>Total intérêts</span>
            <span className="font-medium">
              {formatFrenchNumber(parseNumber(results.interets))}€
            </span>
          </div>
        </div>
      </section>

      {/* Modal de calcul de TMI */}
      <AnimatePresence>
        {showTmiModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-gray-700 text-gray-100 rounded-3xl p-6 w-11/12 max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setShowTmiModal(false)}
                className="absolute top-4 right-4 p-1 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold mb-4 text-white">Calculateur de TMI</h3>
              <label className="block text-sm text-gray-300 mb-2">
                Revenu imposable annuel (€)
              </label>
              <input
                type="number"
                className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-3xl px-4 py-2 mb-4"
                placeholder="ex. 35000"
                value={annualIncome}
                onChange={e => setAnnualIncome(e.target.value)}
              />
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    const rate = getTmiRate(parseNumber(annualIncome));
                    setTmi(rate.toFixed(2));
                    setShowTmiModal(false);
                  }}
                  className="bg-greenLight text-gray-900 px-4 py-2 rounded-3xl shadow hover:bg-green-400 transition"
                >
                  Appliquer
                </button>
                <span className="font-semibold">
                  Votre TMI :{' '}
                  <span className="text-greenLight">
                    {getTmiRate(parseNumber(annualIncome))}%
                  </span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
