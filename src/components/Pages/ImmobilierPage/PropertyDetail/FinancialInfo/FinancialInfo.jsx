// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialInfo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams }      from 'react-router-dom';
import { ArrowLeft }                   from 'lucide-react';

import useFinancialCalculations        from './components/useFinancialCalculations';
import CreditSection                   from './components/CreditSection';
import ExpensesSection                 from './components/ExpensesSection';
import IncomeSection                   from './components/IncomeSection';
import TaxSection                      from './components/TaxSection';
import ResultsSection                  from './components/ResultsSection';
import TmiModal                        from './components/TmiModal';

// Optionnel : si pas de proxy Vite, mets VITE_API_BASE="http://localhost:5000" dans ton .env front
const API_BASE = import.meta?.env?.VITE_API_BASE || "";

export default function FinancialInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  // États
  const [property, setProperty]     = useState(null);
  const [error, setError]           = useState(null);
  const [showTmiModal, setShowTmiModal] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');

  // Récupération de la propriété (retourne financialLld / financialCld)
  useEffect(() => {
    fetch(`${API_BASE}/api/properties/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Statut ${res.status}`);
        return res.json();
      })
      .then(data => setProperty(data))
      .catch(err => setError(err.message));
  }, [id]);

  // Valeurs LLD par défaut si rien en base
  const fin = property?.financialLld ?? {
    // Achat & crédit
    prixAgence: '', fraisAgence: '', netVendeur: '', decoteMeuble: '',
    fraisNotairePct: '', travaux: '', travauxEstimes: '', travauxRestants: '',
    tauxPret: '', dureePretAnnees: '',
    apport: '', assurEmprunteur: '',
    // Charges / périodes
    taxeFonciere: '', taxeFoncierePeriod: 'annual',
    chargesCopro: '', chargesCoproPeriod: 'annual',
    assurancePno: '', assurancePnoPeriod: 'annual',
    chargeRecup: '',
    // Abonnements / autres
    elecGaz: '', internet: '', entretien: '', autreSortie: '',
    // Revenus locatifs
    loyerHc: '', chargesLoc: '',
    // Fiscalité / sociaux
    tmi: '', cotSocPct: '',
    // Champs calculés éventuels (si tu les utilises côté front)
    emprunt: '', mensualite: '', totalSorties: '', entreeHc: '', totalCc: '',
    impotMensuel: '', impotAnnuel: '', cfMensuel: '', cfAnnuel: '', cfTotal: '',
    cfNetNetMensuel: '', cfNetNetAnnuel: '', cfNetNetTotal: '', interets: '', roi: '',
    rentalMode: 'LLD',
  };

  // Calculs
  const results = useFinancialCalculations(fin);

  // Gestion rendu
  if (error)     return <p className="text-red-500 p-4">Erreur : {error}</p>;
  if (!property) return <p className="p-4">Chargement…</p>;

  // Mise à jour locale
  const updateFin = (key, value) => {
    setProperty(prev => ({
      ...prev,
      financialLld: { ...(prev?.financialLld ?? {}), [key]: value }
    }));
  };

  // Sauvegarde + redirection vers la fiche bien
  const handleSave = async () => {
    try {
      const payload = {
        propertyId: Number(id),
        ...fin,        // entrées LLD
        ...results,    // résultats calculés
        rentalMode: 'LLD',
      };

      const r = await fetch(`${API_BASE}/api/properties/${id}/financial/lld`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify(payload),
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status} ${msg}`);
      }

      navigate(`/property/${id}`);
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 p-6 text-gray-100">
      {/* Header : uniquement Retour (plus de bouton sauvegarde en haut) */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-2 text-2xl font-bold text-white">Analyse financière — LLD</h1>
      </header>

      {/* Sections */}
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
          setApport:         v => updateFin('apport', v),
          setAssurEmprunteur:v => updateFin('assurEmprunteur', v),
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
          setInternet:           v => updateFin('internet', v),
          setEntretien:          v => updateFin('entretien', v),
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

      {/* Bouton Sauvegarder EN BAS (desktop & tablette) */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-greenLight text-white rounded-lg hover:bg-checkgreen"
        >
          Sauvegarder
        </button>
      </div>

      {/* Barre fixe en bas pour mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-3">
        <div className="mx-3 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur px-3 py-2 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleSave}
            className="ml-auto px-4 py-2 rounded-xl bg-greenLight text-white font-medium hover:bg-checkgreen"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Modal TMI */}
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
