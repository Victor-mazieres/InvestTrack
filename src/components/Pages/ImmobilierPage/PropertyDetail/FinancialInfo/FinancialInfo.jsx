// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfo.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CreditSection     from './components/CreditSection';
import ExpensesSection   from './components/ExpensesSection';
import IncomeSection     from './components/IncomeSection';
import TaxSection        from './components/TaxSection';
import ResultsSection    from './components/ResultsSection';
import TmiModal          from './components/TmiModal';
import FinancialDataDisplay from './FinancialDataDisplay';
import useFinancialCalculations from './components/useFinancialCalculations';
import { parseNumber }   from '../utils/format';

export default function FinancialInfo() {
  const navigate = useNavigate();
  const { id }   = useParams();

  // — états pour tous les champs
  const [prixAgence, setPrixAgence]           = useState('');
  const [fraisAgence, setFraisAgence]         = useState('');
  const [netVendeur, setNetVendeur]           = useState('');
  const [decoteMeuble, setDecoteMeuble]       = useState('');
  const [fraisNotairePct, setFraisNotairePct] = useState('');
  const [travaux, setTravaux]                 = useState('');
  const [travauxEstimes, setTravauxEstimes]   = useState('');
  const [travauxRestants, setTravauxRestants] = useState('');
  const [tauxPret, setTauxPret]               = useState('');
  const [dureePretAnnees, setDureePretAnnees] = useState('');

  const [taxeFonciere, setTaxeFonciere]             = useState('');
  const [taxeFoncierePeriod, setTaxeFoncierePeriod] = useState('annual');
  const [chargesCopro, setChargesCopro]             = useState('');
  const [chargesCoproPeriod, setChargesCoproPeriod] = useState('annual');
  const [assurancePno, setAssurancePno]             = useState('');
  const [assurancePnoPeriod, setAssurancePnoPeriod] = useState('annual');
  const [assurEmprunteur, setAssurEmprunteur]       = useState('');
  const [chargeRecup, setChargeRecup]               = useState('');
  const [elecGaz, setElecGaz]                       = useState('');
  const [autreSortie, setAutreSortie]               = useState('');

  const [loyerHc, setLoyerHc]       = useState('');
  const [chargesLoc, setChargesLoc] = useState('');

  const [tmi, setTmi]             = useState('');
  const [cotSocPct, setCotSocPct] = useState('');

  const [showTmiModal, setShowTmiModal] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // — fetch initial data sans transformation
  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}/financial`)
      .then(async res => {
        if (!res.ok) throw new Error(`Statut ${res.status}`);
        const txt = await res.text();
        return txt ? JSON.parse(txt) : {};
      })
      .then(data => {
        // on set chaque état directement
        setPrixAgence(data.prixAgence ?? '');
        setFraisAgence(data.fraisAgence ?? '');
        setNetVendeur(data.netVendeur ?? '');
        setDecoteMeuble(data.decoteMeuble ?? '');
        setFraisNotairePct(data.fraisNotairePct ?? '');
        setTravaux(data.travaux ?? '');
        setTravauxEstimes(data.travauxEstimes ?? '');
        setTravauxRestants(data.travauxRestants ?? '');
        setTauxPret(data.tauxPret ?? '');
        setDureePretAnnees(data.dureePretAnnees ?? '');

        setTaxeFonciere(data.taxeFonciere ?? '');
        setTaxeFoncierePeriod(data.taxeFoncierePeriod ?? 'annual');
        setChargesCopro(data.chargesCopro ?? '');
        setChargesCoproPeriod(data.chargesCoproPeriod ?? 'annual');
        setAssurancePno(data.assurancePno ?? '');
        setAssurancePnoPeriod(data.assurancePnoPeriod ?? 'annual');
        setAssurEmprunteur(data.assurEmprunteur ?? '');
        setChargeRecup(data.chargeRecup ?? '');
        setElecGaz(data.elecGaz ?? '');
        setAutreSortie(data.autreSortie ?? '');

        setLoyerHc(data.loyerHc ?? '');
        setChargesLoc(data.chargesLoc ?? '');

        setTmi(data.tmi ?? '');
        setCotSocPct(data.cotSocPct ?? '');

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // — calculs
  const results = useFinancialCalculations({
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
  });

  // — sauvegarde avec sanitization
  const handleSave = () => {
    // 1) on construit le raw payload
    const raw = {
      prixAgence:      parseNumber(prixAgence),
      fraisAgence:     parseNumber(fraisAgence),
      netVendeur:      parseNumber(netVendeur),
      decoteMeuble:    parseNumber(decoteMeuble),
      fraisNotairePct: parseNumber(fraisNotairePct),
      travaux:         parseNumber(travaux),
      travauxEstimes:  parseNumber(travauxEstimes),
      travauxRestants: parseNumber(travauxRestants),
      tauxPret:        parseNumber(tauxPret),
      dureePretAnnees: parseNumber(dureePretAnnees),

      taxeFonciere:      parseNumber(taxeFonciere),
      taxeFoncierePeriod,
      chargesCopro:      parseNumber(chargesCopro),
      chargesCoproPeriod,
      assurancePno:      parseNumber(assurancePno),
      assurancePnoPeriod,
      assurEmprunteur:   parseNumber(assurEmprunteur),
      chargeRecup:       parseNumber(chargeRecup),
      elecGaz:           parseNumber(elecGaz),
      autreSortie:       parseNumber(autreSortie),

      loyerHc:          parseNumber(loyerHc),
      chargesLoc:       parseNumber(chargesLoc),

      tmi:              parseNumber(tmi),
      cotSocPct:        parseNumber(cotSocPct),

      emprunt:         parseNumber(results.emprunt),
      mensualite:      parseNumber(results.mensualite),
      totalSorties:    parseNumber(results.totalSorties),
      entreeHc:        parseNumber(results.entreeHc),
      totalCc:         parseNumber(results.totalCc),
      impotMensuel:    parseNumber(results.impotMensuel),
      impotAnnuel:     parseNumber(results.impotAnnuel),
      cfMensuel:       parseNumber(results.cfMensuel),
      cfAnnuel:        parseNumber(results.cfAnnuel),
      cfTotal:         parseNumber(results.cfTotal),
      cfNetNetMensuel: parseNumber(results.cfNetNetMensuel),
      cfNetNetAnnuel:  parseNumber(results.cfNetNetAnnuel),
      cfNetNetTotal:   parseNumber(results.cfNetNetTotal),
      interets:        parseNumber(results.interets),
    };

    // 2) on sanitize : on remplace toutes les valeurs invalides par 0
    const payload = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => {
        let val = v;
        if (val === '' || Number.isNaN(val)) val = 0;
        return [k, val];
      })
    );

    // 3) envoi
    fetch(`http://localhost:5000/api/properties/${id}/financial`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Statut ${res.status}`);
        return res.json();
      })
      .then(() => navigate(-1))
      .catch(err => alert(`Erreur : ${err.message}`));
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-500">Erreur : {error}</p>;

  return (
    <div className="min-h-screen p-6 text-gray-100">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">← Retour</button>
        <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Sauvegarder</button>
      </header>

      <CreditSection
        values={{ prixAgence, fraisAgence, netVendeur, decoteMeuble, fraisNotairePct, travaux, travauxEstimes, travauxRestants, tauxPret, dureePretAnnees }}
        onChange={{ setPrixAgence, setFraisAgence, setNetVendeur, setDecoteMeuble, setFraisNotairePct, setTravaux, setTravauxEstimes, setTravauxRestants, setTauxPret, setDureePretAnnees }}
        results={results}
      />

      <ExpensesSection
        values={{ taxeFonciere, taxeFoncierePeriod, chargesCopro, chargesCoproPeriod, assurancePno, assurancePnoPeriod, assurEmprunteur, chargeRecup, elecGaz, autreSortie }}
        onChange={{ setTaxeFonciere, setTaxeFoncierePeriod, setChargesCopro, setChargesCoproPeriod, setAssurancePno, setAssurancePnoPeriod, setAssurEmprunteur, setChargeRecup, setElecGaz, setAutreSortie }}
        results={results}
      />

      <IncomeSection
        values={{ loyerHc, chargesLoc }}
        onChange={{ setLoyerHc, setChargesLoc }}
        results={results}
      />

      <TaxSection
        values={{ tmi, cotSocPct }}
        onChange={{ setTmi, setCotSocPct }}
        results={results}
        onOpenTmi={() => setShowTmiModal(true)}
      />

      <ResultsSection results={results} />

      <FinancialDataDisplay
        data={{ taxeFonciere, chargesCopro, assurancePno, loyerHc, chargesLoc }}
        results={results}
      />

      <TmiModal
        isOpen={showTmiModal}
        annualIncome={annualIncome}
        onChangeIncome={setAnnualIncome}
        onClose={() => setShowTmiModal(false)}
        onApply={rate => {
          setTmi(rate.toFixed(2));
          setShowTmiModal(false);
        }}
      />
    </div>
  );
}
