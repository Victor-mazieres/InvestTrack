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
  const [propertyPrice, setPropertyPrice] = useState(38500);       // Prix du bien
  const [personalContribution, setPersonalContribution] = useState(3000); // Apport (affiché pour info)
  const [loanFees, setLoanFees] = useState(500);                    // Frais de dossier (affichés pour info)

  // --- Champs du prêt (décimaux ou range) ---
  const [loanDuration, setLoanDuration] = useState(20);             // Durée (ans) -> slider
  const [interestRate, setInterestRate] = useState("4");            // Taux annuel nominal (string)
  const [insuranceRate, setInsuranceRate] = useState("0.3");        // Assurance (% annuel, string)

  // --- Champs pour l'investissement locatif (entiers) ---
  const [monthlyRent, setMonthlyRent] = useState(1000);             // Loyer mensuel
  const [monthlyCharges, setMonthlyCharges] = useState(100);        // Charges mensuelles

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
  // Pour le calcul du prêt, le montant emprunté correspond au prix du bien.
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

  // --- Assurance emprunteur mensuelle (simplifiée) ---
  const monthlyInsurance = (capital * (numInsuranceRate / 100)) / 12;

  // --- Mensualité totale (prêt + assurance) ---
  const totalMonthlyPayment = monthlyLoanPayment + monthlyInsurance;

  // --- Coût total du prêt ---
  const totalPaidLoan = monthlyLoanPayment * numberOfMonths;
  const totalInterest = Math.max(0, totalPaidLoan - capital);

  // --- Coût total de l'assurance ---
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
  const monthlyCashFlow = monthlyRent - (totalMonthlyPayment + monthlyCharges);

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-light">
      {/* Overlay dégradé en haut */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-10" />
      {/* Barre "poignée" centrée en haut */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full z-20" />
      
      {/* Barre de navigation avec Retour et titre en colonne */}
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-greenLight text-2xl font-semibold hover:text-secondary transition"
        >
          <ArrowLeft className="w-6 h-6 mr-2" /> Retour
        </button>
        <h1 className="mt-2 text-3xl font-bold text-center">Simulateur de prêt</h1>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col items-center justify-center px-6 pb-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-xl w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Calculer mes mensualités
          </h2>

          {/* Prix du bien */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="propertyPrice">
              Prix du bien
            </label>
            <div className="flex items-center">
              <input
                id="propertyPrice"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={formatNumberWithSpaces(propertyPrice)}
                onChange={handleIntChange(setPropertyPrice)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>

          {/* Apport personnel (affiché pour information) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="personalContribution">
              Apport personnel
            </label>
            <div className="flex items-center">
              <input
                id="personalContribution"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={formatNumberWithSpaces(personalContribution)}
                onChange={handleIntChange(setPersonalContribution)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">(Non utilisé dans le calcul du montant emprunté)</p>
          </div>

          {/* Durée du prêt */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loanDuration">
              Durée du prêt
            </label>
            <input
              id="loanDuration"
              type="range"
              min="5"
              max="25"
              step="5"
              value={loanDuration}
              onChange={(e) => setLoanDuration(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-gray-600 text-sm mt-1">{loanDuration} ans</div>
          </div>

          {/* Taux d'intérêt annuel */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="interestRate">
              Taux d'intérêt annuel
            </label>
            <div className="flex items-center">
              <input
                id="interestRate"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={interestRate}
                onChange={handleDecimalChange(setInterestRate)}
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">(Ex : 4% en moyenne)</p>
          </div>

          {/* Frais de dossier */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loanFees">
              Frais de dossier
            </label>
            <div className="flex items-center">
              <input
                id="loanFees"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={formatNumberWithSpaces(loanFees)}
                onChange={handleIntChange(setLoanFees)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">(Souvent entre 300€ et 1000€)</p>
          </div>

          {/* Assurance emprunteur */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="insuranceRate">
              Assurance emprunteur (taux annuel)
            </label>
            <div className="flex items-center">
              <input
                id="insuranceRate"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={insuranceRate}
                onChange={handleDecimalChange(setInsuranceRate)}
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">(Ex : 0.3% / an du capital emprunté)</p>
          </div>

          {/* Résultat : Mensualité */}
          <div className="mt-6 bg-blue-50 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Mensualités</h3>
            <p className="text-gray-800 text-2xl font-bold mb-2">
              {Number.isFinite(totalMonthlyPayment)
                ? `${Math.round(totalMonthlyPayment).toLocaleString('fr-FR')} € / mois`
                : '—'}
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Montant de l'emprunt :</strong>{' '}
                {Math.round(capital).toLocaleString('fr-FR')} €
              </p>
              <p>
                <strong>Coût des intérêts :</strong>{' '}
                {Number.isFinite(totalInterest)
                  ? `${Math.round(totalInterest).toLocaleString('fr-FR')} €`
                  : '—'}{' '}
                <span className="text-xs text-gray-500">(sur {loanDuration} ans)</span>
              </p>
              <p>
                <strong>Coût de l'assurance :</strong>{' '}
                {Number.isFinite(totalInsuranceCost)
                  ? `${Math.round(totalInsuranceCost).toLocaleString('fr-FR')} €`
                  : '—'}{' '}
                <span className="text-xs text-gray-500">(simplifié)</span>
              </p>
              <p>
                <strong>Frais de notaire :</strong>{' '}
                {Math.round(notaryFees).toLocaleString('fr-FR')} €
                <span className="text-xs text-gray-500">(8 % du prix du bien)</span>
              </p>
            </div>
          </div>

          {/* Paramètres de location */}
          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800">Paramètres de location</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="monthlyRent">
              Loyer mensuel
            </label>
            <div className="flex items-center">
              <input
                id="monthlyRent"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={formatNumberWithSpaces(monthlyRent)}
                onChange={handleIntChange(setMonthlyRent)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="monthlyCharges">
              Charges mensuelles
            </label>
            <div className="flex items-center">
              <input
                id="monthlyCharges"
                type="text"
                className="border border-gray-300 rounded w-full p-2"
                value={formatNumberWithSpaces(monthlyCharges)}
                onChange={handleIntChange(setMonthlyCharges)}
              />
              <span className="ml-2 text-gray-600">€</span>
            </div>
          </div>

          {/* Résultat : Rentabilité & Cash-flow */}
          <div className="mt-6 bg-green-50 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Calcul de rentabilité</h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Rendement brut (%) :</strong><br />(Loyer annuel / Coût total d'achat) x 100
            </p>
            <p className="text-gray-800 font-bold mb-4">
              {Number.isFinite(grossYield)
                ? `${grossYield.toFixed(2)} %`
                : '—'}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Rendement net (%) :</strong><br />
              [(Loyer annuel - Charges annuelles) / (Coût total d'achat + Coût du financement)] x 100
            </p>
            <p className="text-gray-800 font-bold mb-4">
              {Number.isFinite(netYield)
                ? `${netYield.toFixed(2)} %`
                : '—'}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Cash-flow mensuel :</strong><br />
              Loyer mensuel - (Mensualité totale + Charges mensuelles)
            </p>
            <p className="text-gray-800 font-bold">
              {Number.isFinite(monthlyCashFlow)
                ? `${Math.round(monthlyCashFlow).toLocaleString('fr-FR')} € / mois`
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageSimulator;
