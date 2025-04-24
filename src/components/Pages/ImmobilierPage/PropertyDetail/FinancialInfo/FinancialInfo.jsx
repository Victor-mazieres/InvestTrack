import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Affiche un nombre avec des espaces (ex : "12 345")
function formatNumberWithSpaces(value) {
  if (typeof value !== 'number' || isNaN(value)) return '';
  return value.toLocaleString('fr-FR');
}

// Parse la saisie utilisateur en retirant espaces et remplaçant la virgule par un point
function parseNumberFromString(value) {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

const FinancialInfo = () => {
  const navigate = useNavigate();

  // Utilisation exclusive du mode "saisie manuelle"
  const [propertyPrice, setPropertyPrice] = useState(38500);
  const [renovationCosts, setRenovationCosts] = useState(0);
  const [renovationPaidByPocket, setRenovationPaidByPocket] = useState(false);
  const [personalContribution, setPersonalContribution] = useState(3000);
  const [loanFees, setLoanFees] = useState(300);
  const [propertyTax, setPropertyTax] = useState(1000);
  const [syndicPeriod, setSyndicPeriod] = useState('monthly');
  const [syndicFees, setSyndicFees] = useState(60);
  const [ownerInsurancePeriod, setOwnerInsurancePeriod] = useState('annual');
  const [ownerInsuranceAmount, setOwnerInsuranceAmount] = useState(144);
  const [loanDuration, setLoanDuration] = useState(20);
  const [interestRate, setInterestRate] = useState("4");
  const [insuranceRate, setInsuranceRate] = useState("0.3");
  const [monthlyRent, setMonthlyRent] = useState(580);
  const [monthlyCharges, setMonthlyCharges] = useState(50);

  // Taux de notaire fixé à 8%
  const notaryRate = 8;

  // Handlers de saisie pour les champs numériques
  const handleIntChange = (setter) => (e) => {
    const numericValue = parseNumberFromString(e.target.value);
    setter(numericValue);
  };
  const handleDecimalChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // Conversion automatique pour le syndic selon la période sélectionnée
  const handleSyndicPeriodChange = (newPeriod) => {
    setSyndicFees((prevFees) => {
      if (syndicPeriod === 'monthly' && newPeriod === 'annual') {
        return Math.round(prevFees * 12);
      }
      if (syndicPeriod === 'annual' && newPeriod === 'monthly') {
        return Math.round(prevFees / 12);
      }
      return prevFees;
    });
    setSyndicPeriod(newPeriod);
  };

  // Conversion automatique pour l'assurance non occupant selon la période sélectionnée
  const handleOwnerInsurancePeriodChange = (newPeriod) => {
    setOwnerInsuranceAmount((prevAmount) => {
      if (ownerInsurancePeriod === 'monthly' && newPeriod === 'annual') {
        return Math.round(prevAmount * 12);
      }
      if (ownerInsurancePeriod === 'annual' && newPeriod === 'monthly') {
        return Math.round(prevAmount / 12);
      }
      return prevAmount;
    });
    setOwnerInsurancePeriod(newPeriod);
  };

  // Calculs financiers
  const numPropertyPrice = parseFloat(propertyPrice) || 0;
  const numRenovationCosts = parseFloat(renovationCosts) || 0;
  const numPersonalContribution = parseFloat(personalContribution) || 0;
  const numInterestRate = parseFloat(interestRate.replace(',', '.')) || 0;
  const numInsuranceRate = parseFloat(insuranceRate.replace(',', '.')) || 0;

  const totalPurchaseBase = numPropertyPrice + (renovationPaidByPocket ? 0 : numRenovationCosts);
  const netLoanAmount = Math.max(0, totalPurchaseBase - numPersonalContribution);
  const monthlyInterestRate = numInterestRate / 100 / 12;
  const numberOfMonths = loanDuration * 12;

  let monthlyLoanPayment = 0;
  if (netLoanAmount > 0 && monthlyInterestRate > 0 && numberOfMonths > 0) {
    monthlyLoanPayment = netLoanAmount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfMonths)));
  }

  const monthlyInsurance = (netLoanAmount * (numInsuranceRate / 100)) / 12;
  const monthlyPropertyTax = propertyTax / 12;
  const parsedSyndicFees = parseFloat(syndicFees) || 0;
  const monthlySyndicFees = syndicPeriod === 'annual' ? parsedSyndicFees / 12 : parsedSyndicFees;
  const parsedOwnerInsurance = parseFloat(ownerInsuranceAmount) || 0;
  const monthlyOwnerInsurance = ownerInsurancePeriod === 'annual' ? parsedOwnerInsurance / 12 : parsedOwnerInsurance;

  const totalMonthlyCost = monthlyLoanPayment + monthlyInsurance + monthlyPropertyTax + monthlySyndicFees + monthlyOwnerInsurance;
  const totalPaidLoan = monthlyLoanPayment * numberOfMonths;
  const totalInterest = Math.max(0, totalPaidLoan - netLoanAmount);
  const totalInsuranceCost = monthlyInsurance * numberOfMonths;
  const notaryFees = (numPropertyPrice * notaryRate) / 100;
  const totalPurchaseCost = numPropertyPrice + numRenovationCosts + notaryFees;
  const annualRent = monthlyRent * 12;
  const annualCharges = monthlyCharges * 12;
  const financingCost = totalInterest + totalInsuranceCost;
  const grossYield = totalPurchaseCost > 0 ? (annualRent / totalPurchaseCost) * 100 : 0;
  const netYield = totalPurchaseCost + financingCost > 0 ? ((annualRent - annualCharges) / (totalPurchaseCost + financingCost)) * 100 : 0;
  const monthlyCashFlow = (monthlyRent + monthlyCharges) - totalMonthlyCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      {/* Header avec bouton "Retour" */}
      <header className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-2xl font-bold">Informations financières</h1>
      </header>

      {/* Section des paramètres du prêt */}
      <section className="bg-gray-800 rounded-xl shadow p-6 mb-6 border border-gray-600">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Paramètres du prêt</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prix du bien */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prix du bien</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(propertyPrice)}
              onChange={handleIntChange(setPropertyPrice)}
            />
          </div>
          {/* Travaux */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Travaux</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(renovationCosts)}
              onChange={handleIntChange(setRenovationCosts)}
            />
          </div>
          {/* Apport personnel */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Apport personnel</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(personalContribution)}
              onChange={handleIntChange(setPersonalContribution)}
            />
          </div>
          {/* Frais de dossier */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Frais de dossier</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(loanFees)}
              onChange={handleIntChange(setLoanFees)}
            />
          </div>
          {/* Taxe foncière */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Taxe foncière annuelle</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(propertyTax)}
              onChange={handleIntChange(setPropertyTax)}
            />
          </div>
          {/* Durée du prêt */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Durée du prêt (en années)</label>
            <input
              type="range"
              min="5"
              max="20"
              step="5"
              value={loanDuration}
              onChange={(e) => setLoanDuration(Number(e.target.value))}
              className="w-full accent-greenLight"
            />
            <p className="text-xs text-gray-400 mt-1">{loanDuration} ans</p>
          </div>
          {/* Taux d'intérêt */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Taux d'intérêt annuel</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={interestRate}
              onChange={handleDecimalChange(setInterestRate)}
            />
          </div>
          {/* Assurance emprunteur */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assurance emprunteur (taux annuel)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={insuranceRate}
              onChange={handleDecimalChange(setInsuranceRate)}
            />
          </div>
        </div>
      </section>

      {/* Section des paramètres de location */}
      <section className="bg-gray-800 rounded-xl shadow p-6 mb-6 border border-gray-600">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Paramètres de location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loyer mensuel */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Loyer mensuel (hors charges)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(monthlyRent)}
              onChange={handleIntChange(setMonthlyRent)}
            />
          </div>
          {/* Charges locatives */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Charges locatives mensuelles</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(monthlyCharges)}
              onChange={handleIntChange(setMonthlyCharges)}
            />
          </div>
          {/* Syndic */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Syndic</label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  checked={syndicPeriod === 'monthly'}
                  onChange={() => handleSyndicPeriodChange('monthly')}
                />
                <span className="text-gray-300 text-sm">Mensuel</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  checked={syndicPeriod === 'annual'}
                  onChange={() => handleSyndicPeriodChange('annual')}
                />
                <span className="text-gray-300 text-sm">Annuel</span>
              </label>
            </div>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(syndicFees)}
              onChange={handleIntChange(setSyndicFees)}
            />
          </div>
          {/* Assurance non occupant */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assurance non occupant</label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  checked={ownerInsurancePeriod === 'monthly'}
                  onChange={() => handleOwnerInsurancePeriodChange('monthly')}
                />
                <span className="text-gray-300 text-sm">Mensuel</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  checked={ownerInsurancePeriod === 'annual'}
                  onChange={() => handleOwnerInsurancePeriodChange('annual')}
                />
                <span className="text-gray-300 text-sm">Annuel</span>
              </label>
            </div>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100"
              value={formatNumberWithSpaces(ownerInsuranceAmount)}
              onChange={handleIntChange(setOwnerInsuranceAmount)}
            />
          </div>
        </div>
      </section>

      {/* Section des résultats */}
      <section className="bg-gray-800 rounded-xl shadow p-6 border border-gray-600">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Résultats</h2>
        <div className="space-y-4">
          {/* Calcul des mensualités */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Mensualités</h3>
            <p className="text-2xl font-bold text-greenLight">
              {Number.isFinite(totalMonthlyCost)
                ? `${Math.round(totalMonthlyCost).toLocaleString('fr-FR')} € / mois`
                : '—'}
            </p>
            <ul className="mt-2 text-sm text-gray-400 space-y-1">
              <li>
                <strong>Montant de l'emprunt :</strong> {Math.round(netLoanAmount).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Coût des intérêts :</strong>{' '}
                {Number.isFinite(totalInterest)
                  ? `${Math.round(totalInterest).toLocaleString('fr-FR')} €`
                  : '—'} <span className="text-xs">(sur {loanDuration} ans)</span>
              </li>
              <li>
                <strong>Coût de l'assurance :</strong>{' '}
                {Number.isFinite(totalInsuranceCost)
                  ? `${Math.round(totalInsuranceCost).toLocaleString('fr-FR')} €`
                  : '—'} <span className="text-xs">(simplifié)</span>
              </li>
              <li>
                <strong>Taxe foncière (mensuelle) :</strong> {Math.round(monthlyPropertyTax).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Syndic (mensuel) :</strong> {Math.round(monthlySyndicFees).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Assurance non occupant (mensuelle) :</strong> {Math.round(monthlyOwnerInsurance).toLocaleString('fr-FR')} €
              </li>
              <li>
                <strong>Frais de notaire :</strong> {Math.round(notaryFees).toLocaleString('fr-FR')} € <span className="text-xs">(8 % sur le prix du bien)</span>
              </li>
            </ul>
          </div>
          {/* Rentabilité et cash-flow */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Rentabilité</h3>
            <div className="mt-1 text-sm text-gray-200">
              <p>
                <strong>Rendement brut (%) :</strong>{' '}
                {Number.isFinite(grossYield) ? `${grossYield.toFixed(2)} %` : '—'}
              </p>
              <p className="text-xs text-gray-400">(Loyer annuel / [Prix + Travaux + Frais de notaire]) x 100</p>
            </div>
            <div className="mt-2 text-sm text-gray-200">
              <p>
                <strong>Rendement net (%) :</strong>{' '}
                {Number.isFinite(netYield) ? `${netYield.toFixed(2)} %` : '—'}
              </p>
              <p className="text-xs text-gray-400">(Loyer annuel - Charges) / (Coût d'achat + Financement)</p>
            </div>
            <div className="mt-2 text-sm text-gray-200">
              <p>
                <strong>Cash-flow mensuel :</strong>{' '}
                {Number.isFinite(monthlyCashFlow)
                  ? `${Math.round(monthlyCashFlow).toLocaleString('fr-FR')} € / mois`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">(Loyer + Charges) - (Mensualités + Autres frais)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinancialInfo;
