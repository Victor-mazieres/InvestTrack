import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* Fonctions utilitaires pour formater et parser les nombres */
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
  // --- Champs du prêt (entiers) ---
  const [propertyPrice, setPropertyPrice] = useState(38500); // Prix du bien
  const [personalContribution, setPersonalContribution] = useState(3000); // Apport
  const [loanFees, setLoanFees] = useState(500); // Frais de dossier

  // --- Nouvel état pour la taxe foncière ---
  const [propertyTax, setPropertyTax] = useState(1000); // Taxe foncière annuelle

  // --- Nouvel état pour le syndic ---
  const [syndicFees, setSyndicFees] = useState(100); // Frais de syndic mensuels

  // --- Nouvel état pour l'assurance propriétaire non occupant ---
  // On saisit directement un montant annuel (en euros)
  const [ownerInsuranceAmount, setOwnerInsuranceAmount] = useState(200);

  // --- Champs du prêt (décimaux ou range) ---
  const [loanDuration, setLoanDuration] = useState(20); // Durée (ans)
  const [interestRate, setInterestRate] = useState("4"); // Taux annuel nominal
  const [insuranceRate, setInsuranceRate] = useState("0.3"); // Assurance emprunteur (% annuel)

  // --- Champs pour l'investissement locatif (entiers) ---
  const [monthlyRent, setMonthlyRent] = useState(1000); // Loyer mensuel
  const [monthlyCharges, setMonthlyCharges] = useState(100); // Charges mensuelles

  // Taux de notaire (8% par défaut pour l'ancien)
  const notaryRate = 8;

  // --- Gestion des changements pour les champs entiers ---
  const handleIntChange = (setter) => (e) => {
    const inputVal = e.target.value;
    const numericValue = parseNumberFromString(inputVal);
    setter(numericValue);
  };

  // --- Gestion des changements pour les champs décimaux (taux) ---
  const handleDecimalChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // --- Conversion des valeurs ---
  const numPropertyPrice = parseFloat(propertyPrice) || 0;
  let capital = numPropertyPrice;

  // --- Conversion des taux ---
  const numInterestRate = parseFloat(interestRate.replace(',', '.')) || 0;
  const numInsuranceRate = parseFloat(insuranceRate.replace(',', '.')) || 0;

  // Taux mensuel et nombre de mensualités
  const monthlyInterestRate = numInterestRate / 100 / 12;
  const numberOfMonths = loanDuration * 12;

  // --- Calcul de la mensualité hors assurance ---
  let monthlyLoanPayment = 0;
  if (capital > 0 && monthlyInterestRate > 0 && numberOfMonths > 0) {
    monthlyLoanPayment =
      capital *
      (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfMonths)));
  }

  // --- Assurance emprunteur mensuelle (calculée à partir d'un taux en % annuel) ---
  const monthlyInsurance = (capital * (numInsuranceRate / 100)) / 12;

  // --- Calcul de la taxe foncière mensuelle ---
  const monthlyPropertyTax = propertyTax / 12;

  // --- Calcul de l'assurance propriétaire non occupant mensuelle ---
  // Ici, on prend directement le montant annuel saisi et on le divise par 12
  const monthlyOwnerInsurance = ownerInsuranceAmount / 12;

  // --- Mensualité totale (prêt + assurance emprunteur + taxe foncière + syndic + assurance propriétaire) ---
  const totalMonthlyCost =
    monthlyLoanPayment +
    monthlyInsurance +
    monthlyPropertyTax +
    syndicFees +
    monthlyOwnerInsurance;

  // --- Coût total du prêt ---
  const totalPaidLoan = monthlyLoanPayment * numberOfMonths;
  const totalInterest = Math.max(0, totalPaidLoan - capital);

  // --- Coût total de l'assurance emprunteur ---
  const totalInsuranceCost = monthlyInsurance * numberOfMonths;

  // Frais de notaire (pour information)
  const notaryFees = (numPropertyPrice * notaryRate) / 100;

  // --- Calculs pour la rentabilité ---
  const totalPurchaseCost = numPropertyPrice + notaryFees;
  const annualRent = monthlyRent * 12;
  const annualCharges = monthlyCharges * 12;
  const financingCost = totalInterest + totalInsuranceCost;
  const grossYield =
    totalPurchaseCost > 0 ? (annualRent / totalPurchaseCost) * 100 : 0;
  const netYield =
    totalPurchaseCost + financingCost > 0
      ? ((annualRent - annualCharges) / (totalPurchaseCost + financingCost)) * 100
      : 0;
  const monthlyCashFlow = monthlyRent - (totalMonthlyCost + monthlyCharges);

  const navigate = useNavigate();

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
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Paramètres du prêt
        </h2>
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
            <label className="block text-sm text-gray-600 mb-1">
              Assurance propriétaire non occupant (montant annuel)
            </label>
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
              className="w-full accent-primary"
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

      {/* Carte Paramètres de location */}
      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Paramètres de location
        </h2>
        <div className="space-y-4">
          {/* Loyer mensuel */}
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
          {/* Charges mensuelles */}
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

      {/* Carte Résultats */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Résultats
        </h2>
        <div className="space-y-4">
          {/* Mensualités */}
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
                <strong>Coût des intérêts :</strong> {Number.isFinite(totalInterest)
                  ? `${Math.round(totalInterest).toLocaleString('fr-FR')} €`
                  : '—'} <span className="text-xs text-gray-400">(sur {loanDuration} ans)</span>
              </li>
              <li>
                <strong>Coût de l'assurance emprunteur :</strong> {Number.isFinite(totalInsuranceCost)
                  ? `${Math.round(totalInsuranceCost).toLocaleString('fr-FR')} €`
                  : '—'} <span className="text-xs text-gray-400">(simplifié)</span>
              </li>
              <li>
                <strong>Taxe foncière (mensuelle) :</strong> {Math.round(monthlyPropertyTax).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Syndic (mensuel) :</strong> {Math.round(syndicFees).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Assurance propriétaire non occupant (mensuelle) :</strong> {Math.round(monthlyOwnerInsurance).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Frais de notaire :</strong> {Math.round(notaryFees).toLocaleString('fr-FR')} € <span className="text-xs text-gray-400">(8 % du prix du bien)</span>
              </li>
            </ul>
          </div>
          {/* Rentabilité & Cash-flow */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Calcul de rentabilité</h3>
            <div className="mt-1 text-sm text-gray-700">
              <p>
                <strong>Rendement brut (%) :</strong> {Number.isFinite(grossYield)
                  ? `${grossYield.toFixed(2)} %`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">(Loyer annuel / Coût total d'achat) x 100</p>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                <strong>Rendement net (%) :</strong> {Number.isFinite(netYield)
                  ? `${netYield.toFixed(2)} %`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">
                [(Loyer annuel - Charges annuelles) / (Coût total d'achat + Coût du financement)] x 100
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                <strong>Cash-flow mensuel :</strong> {Number.isFinite(monthlyCashFlow)
                  ? `${Math.round(monthlyCashFlow).toLocaleString('fr-FR')} € / mois`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">Loyer mensuel - (Mensualité totale + Charges mensuelles)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MortgageSimulator;
