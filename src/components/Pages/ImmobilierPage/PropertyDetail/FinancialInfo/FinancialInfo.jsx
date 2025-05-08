// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams }      from 'react-router-dom';
import useFinancialCalculations        from './components/useFinancialCalculations';
import CreditSection                   from './components/CreditSection';
import ExpensesSection                 from './components/ExpensesSection';
import IncomeSection                   from './components/IncomeSection';
import TaxSection                      from './components/TaxSection';
import ResultsSection                  from './components/ResultsSection';
import FinancialDataDisplay            from '../FinancialInfo/FinancialDataDisplay';
import TmiModal                        from './components/TmiModal';

export default function FinancialInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1) États de base
  const [property, setProperty]     = useState(null);
  const [error, setError]           = useState(null);
  const [showTmiModal, setShowTmiModal] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');

  // 2) Récupération de la propriété + financialInfo
  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Statut ${res.status}`);
        return res.json();
      })
      .then(data => setProperty(data))
      .catch(err => setError(err.message));
  }, [id]);

  // 3) Préparer "fin" même si la propriété n'est pas encore chargée
  const fin = property?.financialInfo ?? {
    prixAgence: '', fraisAgence: '', netVendeur: '', decoteMeuble: '',
    fraisNotairePct: '', travaux: '', travauxEstimes: '', travauxRestants: '',
    tauxPret: '', dureePretAnnees: '',
    taxeFonciere: '', taxeFoncierePeriod: 'annual',
    chargesCopro: '', chargesCoproPeriod: 'annual',
    assurancePno: '', assurancePnoPeriod: 'annual',
    assurEmprunteur: '', chargeRecup: '',
    elecGaz: '', autreSortie: '',
    loyerHc: '', chargesLoc: '',
    tmi: '', cotSocPct: '',
  };

  // 4) Hook de calculs, appelé inconditionnellement
  const results = useFinancialCalculations(fin);

  // 5) Gestion du rendu d’erreur / chargement
  if (error)     return <p className="text-red-500">Erreur : {error}</p>;
  if (!property) return <p>Chargement…</p>;

  // 6) Handlers pour mettre à jour property.financialInfo
  const updateFin = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialInfo: { ...prev.financialInfo, [key]: value }
    }));
  };

  const handleSave = () => {
    const payload = { propertyId: id, ...property.financialInfo, ...results };
    fetch(`/api/properties/${id}/financial`, {
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

  return (
    <div className="min-h-screen p-6 text-gray-100">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">
          ← Retour
        </button>
        <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
          Sauvegarder
        </button>
      </header>

      <CreditSection
        values={fin}
        onChange={{
          setPrixAgence:     v => updateFin('prixAgence', v),
          setFraisAgence:    v => updateFin('fraisAgence', v),
          setNetVendeur:     v => updateFin('netVendeur', v),
          setDecoteMeuble:   v => updateFin('decoteMeuble', v),
          setFraisNotairePct:v => updateFin('fraisNotairePct', v),
          setTravaux:        v => updateFin('travaux', v),
          setTravauxEstimes: v => updateFin('travauxEstimes', v),
          setTravauxRestants:v => updateFin('travauxRestants', v),
          setTauxPret:       v => updateFin('tauxPret', v),
          setDureePretAnnees:v => updateFin('dureePretAnnees', v),
        }}
        results={results}
      />

      <ExpensesSection
        values={fin}
        onChange={{
          setTaxeFonciere:       v => updateFin('taxeFonciere', v),
          setTaxeFoncierePeriod: v => updateFin('taxeFoncierePeriod', v),
          setChargesCopro:       v => updateFin('chargesCopro', v),
          setChargesCoproPeriod: v => updateFin('chargesCoproPeriod', v),
          setAssurancePno:       v => updateFin('assurancePno', v),
          setAssurancePnoPeriod: v => updateFin('assurancePnoPeriod', v),
          setAssurEmprunteur:    v => updateFin('assurEmprunteur', v),
          setChargeRecup:        v => updateFin('chargeRecup', v),
          setElecGaz:            v => updateFin('elecGaz', v),
          setAutreSortie:        v => updateFin('autreSortie', v),
        }}
        results={results}
      />

      <IncomeSection
        values={fin}
        onChange={{
          setLoyerHc:    v => updateFin('loyerHc', v),
          setChargesLoc: v => updateFin('chargesLoc', v),
        }}
        results={results}
      />

      <TaxSection
        values={fin}
        onChange={{
          setTmi:       v => updateFin('tmi', v),
          setCotSocPct: v => updateFin('cotSocPct', v),
        }}
        results={results}
        onOpenTmi={() => setShowTmiModal(true)}
      />

      <ResultsSection results={results} />

      {/* Ajout de FinancialDataDisplay pour le récapitulatif et le PDF */}
      <FinancialDataDisplay
        data={{
          taxeFonciere: fin.taxeFonciere,
          chargesCopro: fin.chargesCopro,
          assurancePno: fin.assurancePno,
          chargeRecup:  fin.chargeRecup,
          loyerHc:      fin.loyerHc,
          chargesLoc:   fin.chargesLoc,
        }}
        results={results}
      />

      <TmiModal
        isOpen={showTmiModal}
        annualIncome={annualIncome}
        onChangeIncome={setAnnualIncome}
        onClose={() => setShowTmiModal(false)}
        onApply={rate => {
          updateFin('tmi', rate.toFixed(2));
          setShowTmiModal(false);
        }}
      />
    </div>
  );
}
