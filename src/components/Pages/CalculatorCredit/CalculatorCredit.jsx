// MortgageSimulator.js
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Hook personnalisé pour persister un état dans le localStorage (pour la saisie temporaire)
function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      return typeof defaultValue === 'number' ? parseFloat(storedValue) : storedValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, state);
  }, [key, state]);

  return [state, setState];
}

// Fonctions utilitaires pour formater et parser les nombres
function formatNumberWithSpaces(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  return value.toLocaleString('fr-FR');
}

function parseNumberFromString(value) {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

const MortgageSimulator = () => {
  // États avec persistance pour la saisie
  const [propertyPrice, setPropertyPrice] = usePersistedState('propertyPrice', 38500);
  const [personalContribution, setPersonalContribution] = usePersistedState('personalContribution', 3000);
  const [loanFees, setLoanFees] = usePersistedState('loanFees', 300);
  const [propertyTax, setPropertyTax] = usePersistedState('propertyTax', 1000);
  const [syndicFees, setSyndicFees] = usePersistedState('syndicFees', 60);
  const [ownerInsuranceAmount, setOwnerInsuranceAmount] = usePersistedState('ownerInsuranceAmount', 144);
  const [loanDuration, setLoanDuration] = usePersistedState('loanDuration', 20);
  const [interestRate, setInterestRate] = usePersistedState('interestRate', "4");
  const [insuranceRate, setInsuranceRate] = usePersistedState('insuranceRate', "0.3");
  const [monthlyRent, setMonthlyRent] = usePersistedState('monthlyRent', 1000);
  const [monthlyCharges, setMonthlyCharges] = usePersistedState('monthlyCharges', 100);

  const notaryRate = 8;
  const navigate = useNavigate();

  // --- Calculs ---
  const numPropertyPrice = parseFloat(propertyPrice) || 0;
  let capital = numPropertyPrice;
  const numInterestRate = parseFloat(interestRate.replace(',', '.')) || 0;
  const numInsuranceRate = parseFloat(insuranceRate.replace(',', '.')) || 0;
  const monthlyInterestRate = numInterestRate / 100 / 12;
  const numberOfMonths = loanDuration * 12;
  let monthlyLoanPayment = 0;
  if (capital > 0 && monthlyInterestRate > 0 && numberOfMonths > 0) {
    monthlyLoanPayment =
      capital * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfMonths)));
  }
  const monthlyInsurance = (capital * (numInsuranceRate / 100)) / 12;
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyOwnerInsurance = ownerInsuranceAmount / 12;
  const totalMonthlyCost =
    monthlyLoanPayment + monthlyInsurance + monthlyPropertyTax + syndicFees + monthlyOwnerInsurance;
  const totalPaidLoan = monthlyLoanPayment * numberOfMonths;
  const totalInterest = Math.max(0, totalPaidLoan - capital);
  const totalInsuranceCost = monthlyInsurance * numberOfMonths;
  const notaryFees = (numPropertyPrice * notaryRate) / 100;
  const totalPurchaseCost = numPropertyPrice + notaryFees;
  const annualRent = monthlyRent * 12;
  const annualCharges = monthlyCharges * 12;
  const financingCost = totalInterest + totalInsuranceCost;
  const grossYield = totalPurchaseCost > 0 ? (annualRent / totalPurchaseCost) * 100 : 0;
  const netYield =
    totalPurchaseCost + financingCost > 0
      ? ((annualRent - annualCharges) / (totalPurchaseCost + financingCost)) * 100
      : 0;
  const monthlyCashFlow = monthlyRent - (totalMonthlyCost + monthlyCharges);

  const handleIntChange = (setter) => (e) => {
    const numericValue = parseNumberFromString(e.target.value);
    setter(numericValue);
  };
  const handleDecimalChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // États pour la modal
  const [showModal, setShowModal] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Sauvegarde de la simulation via l'API avec le nom récupéré depuis la modal
  const handleConfirmSave = async () => {
    if (!saveName.trim()) {
      alert("Veuillez entrer un nom pour la sauvegarde.");
      return;
    }
    const simulationData = {
      name: saveName,
      propertyPrice,
      personalContribution,
      loanFees,
      propertyTax,
      syndicFees,
      ownerInsuranceAmount,
      loanDuration,
      interestRate,
      insuranceRate,
      monthlyRent,
      monthlyCharges,
      results: {
        totalMonthlyCost,
        totalInterest,
        totalInsuranceCost,
        grossYield,
        netYield,
        monthlyCashFlow,
        notaryFees,
      },
    };

    try {
      const token = localStorage.getItem('token'); // Le token doit être sauvegardé lors de la connexion
      const response = await fetch('http://localhost:5000/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(simulationData)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Simulation sauvegardée !");
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde de la simulation.");
    } finally {
      setShowModal(false);
      setSaveName("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Header */}
      <header className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Simulateur de prêt</h1>
      </header>

      {/* Carte Paramètres du prêt */}
      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Paramètres du prêt</h2>
        <div className="space-y-4">
          {/* Prix du bien */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Prix du bien</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(propertyPrice)}
                onChange={handleIntChange(setPropertyPrice)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>
          {/* Apport personnel */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Apport personnel</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(personalContribution)}
                onChange={handleIntChange(setPersonalContribution)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(Non utilisé dans le calcul du montant emprunté)</p>
          </div>
          {/* Frais de dossier */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Frais de dossier</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(loanFees)}
                onChange={handleIntChange(setLoanFees)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(Souvent entre 300€ et 1000€)</p>
          </div>
          {/* Taxe foncière */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Taxe foncière annuelle</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(propertyTax)}
                onChange={handleIntChange(setPropertyTax)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(sera divisé par 12 pour la mensualité)</p>
          </div>
          {/* Syndic */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Syndic (mensuel)</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(syndicFees)}
                onChange={handleIntChange(setSyndicFees)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>
          {/* Assurance propriétaire non occupant */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Assurance propriétaire non occupant (montant annuel)</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(ownerInsuranceAmount)}
                onChange={handleIntChange(setOwnerInsuranceAmount)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(Montant annuel)</p>
          </div>
          {/* Durée du prêt */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Durée du prêt</label>
            <input
              type="range"
              min="5"
              max="20"
              step="5"
              value={loanDuration}
              onChange={(e) => setLoanDuration(Number(e.target.value))}
              className="w-full accent-greenLight"
            />
            <p className="text-xs text-gray-600 mt-1">{loanDuration} ans</p>
          </div>
          {/* Taux d'intérêt */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Taux d'intérêt annuel</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={interestRate}
                onChange={handleDecimalChange(setInterestRate)}
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(Ex : 4% en moyenne)</p>
          </div>
          {/* Assurance emprunteur */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Assurance emprunteur (taux annuel)</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={insuranceRate}
                onChange={handleDecimalChange(setInsuranceRate)}
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">(Ex : 0.3% / an du capital emprunté)</p>
          </div>
        </div>
      </section>

      {/* Paramètres de location */}
      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Paramètres de location</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Loyer mensuel</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(monthlyRent)}
                onChange={handleIntChange(setMonthlyRent)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Charges mensuelles</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formatNumberWithSpaces(monthlyCharges)}
                onChange={handleIntChange(setMonthlyCharges)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Résultats</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Mensualités</h3>
            <p className="text-2xl font-bold text-greenLight">
              {Number.isFinite(totalMonthlyCost)
                ? `${Math.round(totalMonthlyCost).toLocaleString('fr-FR')} € / mois`
                : '—'}
            </p>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>
                <strong>Montant de l'emprunt :</strong> {Math.round(capital).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Coût des intérêts :</strong>{' '}
                {Number.isFinite(totalInterest)
                  ? `${Math.round(totalInterest).toLocaleString('fr-FR')} €`
                  : '—'}{' '}
                <span className="text-xs text-gray-400">(sur {loanDuration} ans)</span>
              </li>
              <li>
                <strong>Coût de l'assurance emprunteur :</strong>{' '}
                {Number.isFinite(totalInsuranceCost)
                  ? `${Math.round(totalInsuranceCost).toLocaleString('fr-FR')} €`
                  : '—'}{' '}
                <span className="text-xs text-gray-400">(simplifié)</span>
              </li>
              <li>
                <strong>Taxe foncière (mensuelle) :</strong>{' '}
                {Math.round(monthlyPropertyTax).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Syndic (mensuel) :</strong>{' '}
                {Math.round(syndicFees).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Assurance propriétaire non occupant (mensuelle) :</strong>{' '}
                {Math.round(monthlyOwnerInsurance).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Frais de notaire :</strong>{' '}
                {Math.round(notaryFees).toLocaleString('fr-FR')} €
                <span className="text-xs text-gray-400">(8 % du prix du bien)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Calcul de rentabilité</h3>
            <div className="mt-1 text-sm text-gray-700">
              <p>
                <strong>Rendement brut (%) :</strong>{' '}
                {Number.isFinite(grossYield)
                  ? `${grossYield.toFixed(2)} %`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">(Loyer annuel / Coût total d'achat) x 100</p>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                <strong>Rendement net (%) :</strong>{' '}
                {Number.isFinite(netYield)
                  ? `${netYield.toFixed(2)} %`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">
                [(Loyer annuel - Charges annuelles) / (Coût total d'achat + Coût du financement)] x 100
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                <strong>Cash-flow mensuel :</strong>{' '}
                {Number.isFinite(monthlyCashFlow)
                  ? `${Math.round(monthlyCashFlow).toLocaleString('fr-FR')} € / mois`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">
                Loyer mensuel - (Mensualité totale + Charges mensuelles)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bouton de sauvegarde */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-greenLight text-white font-semibold rounded-3xl shadow transition"
        >
          Sauvegarder
        </button>
      </div>

      {/* Modal qui s'ouvre depuis le bas avec animation */}
      {showModal && (
        <div className="fixed inset-0 flex items-end justify-center z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setShowModal(false)}
          ></div>
          {/* Contenu de la modal avec animation "slideUp" */}
          <div className="bg-white w-full h-1/3 rounded-t-lg p-4 z-50 animate-slideUp">
            <h3 className="text-lg font-semibold mb-2 mt-6 text-center">Nom de la sauvegarde</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-3xl"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-greenLight text-white rounded-3xl"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MortgageSimulator;
