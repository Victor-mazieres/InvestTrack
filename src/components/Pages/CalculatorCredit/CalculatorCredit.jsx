// MortageSimulator.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PopupNotification from '../CalculatorCredit/PopupNotification/PopupNotification';

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      return typeof defaultValue === 'number'
        ? parseFloat(storedValue)
        : storedValue;
    }
    return defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, state);
  }, [key, state]);
  return [state, setState];
}

// Nouvelle fonction utilitaire pour récupérer un token CSRF frais
async function fetchCsrfToken() {
  const resp = await fetch('http://localhost:5000/csrf-token', {
    credentials: 'include'
  });
  const { csrfToken } = await resp.json();
  return csrfToken;
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

function formatNumberWithSpaces(value) {
  if (typeof value !== 'number' || isNaN(value)) return '';
  return value.toLocaleString('fr-FR');
}

function parseNumberFromString(value) {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function StepOne({ propertyPrice, setPropertyPrice, propertyPriceNet, setPropertyPriceNet, agencyFeesPercent, setAgencyFeesPercent, onNext }) {
  const handleChange = (setter) => (e) => {
    setter(parseNumberFromString(e.target.value));
  };
  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Étape 1 : Informations sur le bien</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix du bien (frais d'agence inclus)</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(propertyPrice)} onChange={handleChange(setPropertyPrice)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix net vendeur</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(roundToTwo(propertyPriceNet))} onChange={handleChange(setPropertyPriceNet)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">% frais d'agence</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(agencyFeesPercent)} onChange={handleChange(setAgencyFeesPercent)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">%</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onNext} className="px-6 py-3 bg-greenLight text-white font-semibold rounded-3xl">Suivant</button>
      </div>
    </section>
  );
}

function StepTwo({ 
  isFurnished, 
  setIsFurnished, 
  renovationCosts, 
  setRenovationCosts, 
  renovationPaidByPocket, 
  setRenovationPaidByPocket, 
  personalContribution, 
  setPersonalContribution, 
  useNotaryAsContribution, 
  setUseNotaryAsContribution, 
  notaryFees, 
  onPrev, 
  onNext, 
  computedDiscount, 
  useCustomFurnitureValue, 
  setUseCustomFurnitureValue, 
  customFurnitureValue, 
  setCustomFurnitureValue 
}) {
  const handleIntChange = (setter) => (e) => {
    setter(parseNumberFromString(e.target.value));
  };

  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Étape 2 : Configuration du bien</h2>
      <div className="space-y-4">
        <div>
          <div className="flex items-center">
            <input type="checkbox" id="isFurnished" checked={isFurnished} onChange={(e) => setIsFurnished(e.target.checked)} className="h-4 w-4 accent-greenLight" />
            <label htmlFor="isFurnished" className="ml-2 text-gray-300">Bien meublé (décote sur frais de notaire)</label>
          </div>
          {isFurnished && (
            <div className="pl-6 mt-2 space-y-3">
              <div className="flex items-center">
                <input type="radio" id="standardDiscount" name="furnitureDiscount" checked={!useCustomFurnitureValue} onChange={() => setUseCustomFurnitureValue(false)} />
                <label htmlFor="standardDiscount" className="ml-2 text-gray-300">Décote forfaitaire : {formatNumberWithSpaces(Math.round(computedDiscount))} €</label>
              </div>
              <div className="flex items-center">
                <input type="radio" id="customDiscount" name="furnitureDiscount" checked={useCustomFurnitureValue} onChange={() => setUseCustomFurnitureValue(true)} />
                <label htmlFor="customDiscount" className="ml-2 text-gray-300">Valeur personnalisée</label>
              </div>
              {useCustomFurnitureValue && (
                <div className="flex items-center ml-6">
                  <input type="text" value={formatNumberWithSpaces(customFurnitureValue)} onChange={handleIntChange(setCustomFurnitureValue)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
                  <span className="ml-2 text-gray-400">€</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Estimation des travaux</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(renovationCosts)} onChange={handleIntChange(setRenovationCosts)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">(Cochez si ces travaux sont payés de votre poche)</p>
          <div className="flex items-center mt-2">
            <input type="checkbox" id="renovationPaidByPocket" checked={renovationPaidByPocket} onChange={(e) => setRenovationPaidByPocket(e.target.checked)} className="h-4 w-4 accent-greenLight" />
            <label htmlFor="renovationPaidByPocket" className="ml-2 text-gray-300 text-sm">Payer les travaux de ma poche (non inclus dans l'emprunt)</label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Apport personnel</label>
          <div className="flex items-center">
            <input
              type="text"
              value={formatNumberWithSpaces(roundToTwo(personalContribution))}
              onChange={handleIntChange(setPersonalContribution)}
              className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100"
            />
            <span className="ml-2 text-gray-400">€</span>
          </div>
          {useNotaryAsContribution && (
            <p className="text-xs text-gray-400 mt-1">
              Frais de notaire total : {formatNumberWithSpaces(Math.round(notaryFees))} €
            </p>
          )}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="useNotary"
              checked={useNotaryAsContribution}
              onChange={(e) => setUseNotaryAsContribution(e.target.checked)}
              className="h-4 w-4 accent-greenLight"
            />
            <label htmlFor="useNotary" className="ml-2 text-gray-300 text-sm">
              Utiliser les frais de notaire comme apport personnel
            </label>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-6 py-3 bg-gray-600 text-gray-200 rounded-3xl">Précédent</button>
        <button onClick={onNext} className="px-6 py-3 bg-greenLight text-white rounded-3xl">Suivant</button>
      </div>
    </section>
  );
}

function StepThree({ 
  propertyTax, 
  setPropertyTax, 
  syndicPeriod, 
  syndicFees, 
  setSyndicFees, 
  ownerInsurancePeriod, 
  ownerInsuranceAmount, 
  setOwnerInsuranceAmount, 
  loanDuration, 
  setLoanDuration, 
  interestRate, 
  setInterestRate, 
  insuranceRate, 
  setInsuranceRate, 
  onPrev, 
  onNext, 
  handleSyndicPeriodChange, 
  handleOwnerInsurancePeriodChange 
}) {
  const handleIntChange = (setter) => (e) => {
    setter(parseNumberFromString(e.target.value));
  };
  const handleDecimalChange = (setter) => (e) => {
    setter(e.target.value);
  };
  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Étape 3 : Paramètres de financement</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Taxe foncière annuelle</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(propertyTax)} onChange={handleIntChange(setPropertyTax)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Syndic (part propriétaire)</label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer">
              <input type="radio" checked={syndicPeriod === 'annual'} onChange={() => handleSyndicPeriodChange('annual')} />
              <span className="text-gray-300 text-sm ml-1">Annuel</span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" checked={syndicPeriod === 'monthly'} onChange={() => handleSyndicPeriodChange('monthly')} />
              <span className="text-gray-300 text-sm ml-1">Mensuel</span>
            </label>
          </div>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(roundToTwo(parseFloat(syndicFees) || 0))} onChange={handleIntChange(setSyndicFees)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
          {syndicPeriod === 'annual' && (
            <p className="text-xs text-gray-400 mt-1">
              Mensualité syndic : {formatNumberWithSpaces(roundToTwo((parseFloat(syndicFees) || 0) / 12))} €
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Assurance propriétaire non occupant</label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer">
              <input type="radio" checked={ownerInsurancePeriod === 'annual'} onChange={() => handleOwnerInsurancePeriodChange('annual')} />
              <span className="text-gray-300 text-sm ml-1">Annuel</span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" checked={ownerInsurancePeriod === 'monthly'} onChange={() => handleOwnerInsurancePeriodChange('monthly')} />
              <span className="text-gray-300 text-sm ml-1">Mensuel</span>
            </label>
          </div>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(roundToTwo(parseFloat(ownerInsuranceAmount) || 0))} onChange={handleIntChange(setOwnerInsuranceAmount)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
          {ownerInsurancePeriod === 'annual' && (
            <p className="text-xs text-gray-400 mt-1">
              Mensualité assurance PNO : {formatNumberWithSpaces(roundToTwo((parseFloat(ownerInsuranceAmount) || 0) / 12))} €
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Durée du prêt</label>
          <input type="range" min="5" max="20" step="5" value={loanDuration} onChange={(e) => setLoanDuration(Number(e.target.value))} className="w-full accent-greenLight" />
          <p className="text-xs text-gray-400 mt-1">{loanDuration} ans</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Taux d'intérêt annuel</label>
          <div className="flex items-center">
            <input type="text" value={interestRate} onChange={handleDecimalChange(setInterestRate)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">%</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Assurance emprunteur (taux annuel)</label>
          <div className="flex items-center">
            <input type="text" value={insuranceRate} onChange={handleDecimalChange(setInsuranceRate)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">%</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-6 py-3 bg-gray-600 text-gray-200 rounded-3xl">Précédent</button>
        <button onClick={onNext} className="px-6 py-3 bg-greenLight text-white rounded-3xl">Suivant</button>
      </div>
    </section>
  );
}

function StepFour({ monthlyRent, setMonthlyRent, monthlyCharges, setMonthlyCharges, onPrev, onNext }) {
  const handleIntChange = (setter) => (e) => {
    setter(parseNumberFromString(e.target.value));
  };
  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Étape 4 : Paramètres de location</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Loyer mensuel (hors charges)</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(monthlyRent)} onChange={handleIntChange(setMonthlyRent)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Charges locatives récupérables (hors cash-flow)</label>
          <div className="flex items-center">
            <input type="text" value={formatNumberWithSpaces(monthlyCharges)} onChange={handleIntChange(setMonthlyCharges)} className="flex-1 p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-800 text-gray-100" />
            <span className="ml-2 text-gray-400">€</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-6 py-3 bg-gray-600 text-gray-200 rounded-3xl">Précédent</button>
        <button onClick={onNext} className="px-6 py-3 bg-greenLight text-white rounded-3xl">Suivant</button>
      </div>
    </section>
  );
}

function StepFive({ computedResults, onPrev, onShowModal }) {
  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Étape 5 : Résultats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Coûts d'acquisition</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-gray-400">Prix avec agence :</span><span className='text-greenLight'>{formatNumberWithSpaces(roundToTwo(computedResults.propertyPriceWithAgency))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Prix net vendeur :</span><span className='text-greenLight'>{formatNumberWithSpaces(roundToTwo(computedResults.propertyPriceNet))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Décote meublé :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.discount))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Prix net vendeur sans décote :</span><span className='text-greenLight'>{formatNumberWithSpaces(roundToTwo(computedResults.propertyPriceNetWithoutDiscount))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Frais de notaire :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.notaryFees))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Apport personnel :</span><span className='text-greenLight'>{formatNumberWithSpaces(roundToTwo(computedResults.personalContribution))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Reste à financer (notaire) :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.financedNotary))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Frais d'agence :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.agencyFees))} €</span></li>
            <li className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-200 font-medium">Total acquisition :</span>
              <span className="font-medium">{formatNumberWithSpaces(Math.round(computedResults.totalAcquisition))} €</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Rentabilité</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-gray-400">Rendement brut :</span><span className='text-greenLight'>{computedResults.grossYield.toFixed(2)}%</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Rendement net :</span><span className='text-greenLight'>{computedResults.netYield.toFixed(2)}%</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Mensualité du crédit :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.monthlyLoanPayment))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Mensualité avec charges :</span><span className='text-greenLight'>{formatNumberWithSpaces(Math.round(computedResults.totalMonthlyCost))} €</span></li>
            <li className="flex justify-between"><span className="text-gray-400">Cash-flow mensuel :</span><span className={computedResults.monthlyCashFlow >= 0 ? 'text-greenLight' : 'text-red-400'}>{formatNumberWithSpaces(Math.round(computedResults.monthlyCashFlow))} €</span></li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">(Mensualité de crédit ≈ 413 € + autres charges ≈ 141 € = Total charges ≈ 554 €)</p>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-6 py-3 bg-gray-600 text-gray-200 rounded-3xl">Précédent</button>
        <button onClick={onShowModal} className="px-6 py-3 bg-greenLight text-white rounded-3xl">Sauvegarder</button>
      </div>
    </section>
  );
}

const MortageSimulator = () => {
  const navigate = useNavigate();
  const [propertyPrice, setPropertyPrice] = usePersistedState('propertyPrice', 75000);
  const [propertyPriceNet, setPropertyPriceNet] = usePersistedState('propertyPriceNet', 68000);
  const [agencyFeesPercent, setAgencyFeesPercent] = usePersistedState('agencyFeesPercent', 9);
  const [renovationCosts, setRenovationCosts] = usePersistedState('renovationCosts', 0);
  const [renovationPaidByPocket, setRenovationPaidByPocket] = useState(false);
  const [personalContribution, setPersonalContribution] = usePersistedState('personalContribution', 3000);
  const [propertyTax, setPropertyTax] = usePersistedState('propertyTax', 778);
  const [syndicPeriod, setSyndicPeriod] = usePersistedState('syndicPeriod', 'monthly');
  const [syndicFees, setSyndicFees] = usePersistedState('syndicFees', 46);
  const [ownerInsurancePeriod, setOwnerInsurancePeriod] = usePersistedState('ownerInsurancePeriod', 'annual');
  const [ownerInsuranceAmount, setOwnerInsuranceAmount] = usePersistedState('ownerInsuranceAmount', 144);
  const [loanDuration, setLoanDuration] = usePersistedState('loanDuration', 20);
  const [interestRate, setInterestRate] = usePersistedState('interestRate', "4");
  const [insuranceRate, setInsuranceRate] = usePersistedState('insuranceRate', "0.36");
  const [monthlyRent, setMonthlyRent] = usePersistedState('monthlyRent', 580);
  const [monthlyCharges, setMonthlyCharges] = usePersistedState('monthlyCharges', 50);
  const [isFurnished, setIsFurnished] = useState(true);
  const [useCustomFurnitureValue, setUseCustomFurnitureValue] = useState(false);
  const [customFurnitureValue, setCustomFurnitureValue] = usePersistedState('customFurnitureValue', 0);
  const [useNotaryAsContribution, setUseNotaryAsContribution] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [popup, setPopup] = useState(null);
  const [saveName, setSaveName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const notaryRate = 0.08;
  
  useEffect(() => {
    // Calcul du % de frais d'agence si on saisit les deux prix
    if (propertyPrice && propertyPriceNet) {
      const newFees = roundToTwo(100 * ((propertyPrice / propertyPriceNet) - 1));
      if (newFees !== agencyFeesPercent) setAgencyFeesPercent(newFees);
    }
  }, [propertyPrice, propertyPriceNet]);

  const numPropertyPrice = parseFloat(propertyPrice) || 0;
  const numPropertyPriceNet = parseFloat(propertyPriceNet) || 0;
  const computedDiscount = numPropertyPriceNet * 0.05;
  const discount = isFurnished ? (useCustomFurnitureValue ? customFurnitureValue : computedDiscount) : 0;
  // Prix net vendeur sans décote
  const propertyPriceNetWithoutDiscount = roundToTwo(numPropertyPriceNet - discount);
  const notaryFees = roundToTwo(propertyPriceNetWithoutDiscount * notaryRate);
  // Financement des travaux
  const financedRenovation = renovationPaidByPocket ? 0 : parseFloat(renovationCosts) || 0;
  // L'apport personnel couvre une partie des frais de notaire
  const financedNotary = Math.max(0, notaryFees - (parseFloat(personalContribution) || 0));
  // Montant financé
  const netLoanAmount = roundToTwo(Math.max(0, propertyPriceNetWithoutDiscount + financedNotary + financedRenovation));
  const monthlyInterestRate = parseFloat(interestRate.replace(',', '.')) / 100 / 12 || 0;
  const numberOfMonths = loanDuration * 12;
  let monthlyLoanPayment = 0;
  if (netLoanAmount > 0 && monthlyInterestRate > 0 && numberOfMonths > 0) {
    monthlyLoanPayment = roundToTwo(netLoanAmount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfMonths))));
  }
  const monthlyInsurance = roundToTwo((netLoanAmount * (parseFloat(insuranceRate.replace(',', '.')) / 100)) / 12);
  const monthlyPropertyTax = roundToTwo(propertyTax / 12);
  const numSyndicFees = parseFloat(syndicFees) || 0;
  const monthlySyndicFees = syndicPeriod === 'annual' ? roundToTwo(numSyndicFees / 12) : roundToTwo(numSyndicFees);
  const numOwnerInsurance = parseFloat(ownerInsuranceAmount) || 0;
  const monthlyOwnerInsurance = ownerInsurancePeriod === 'annual' ? roundToTwo(numOwnerInsurance / 12) : roundToTwo(numOwnerInsurance);
  const totalMonthlyCost = roundToTwo(monthlyLoanPayment + monthlyInsurance + monthlyPropertyTax + monthlySyndicFees + monthlyOwnerInsurance);
  const totalPurchaseCost = roundToTwo(numPropertyPrice + notaryFees + (parseFloat(renovationCosts) || 0));
  const annualRent = monthlyRent * 12;
  const totalPaidLoan = roundToTwo(monthlyLoanPayment * numberOfMonths);
  const totalInterest = roundToTwo(Math.max(0, totalPaidLoan - netLoanAmount));
  const totalInsuranceCost = roundToTwo(monthlyInsurance * numberOfMonths);
  const financingCost = roundToTwo(totalInterest + totalInsuranceCost);
  const grossYield = totalPurchaseCost > 0 ? roundToTwo((annualRent / totalPurchaseCost) * 100) : 0;
  const netYield = (totalPurchaseCost + financingCost) > 0 ? roundToTwo((annualRent / (totalPurchaseCost + financingCost)) * 100) : 0;
  const monthlyCashFlow = roundToTwo(monthlyRent - totalMonthlyCost);

  // Frais d'agence = différence entre le prix avec agence et le prix net vendeur
  const agencyFees = roundToTwo(numPropertyPrice - numPropertyPriceNet);
  // Total acquisition = Prix net vendeur sans décote + frais d'agence + reste à financer (notaire)
  const totalAcquisition = roundToTwo(propertyPriceNetWithoutDiscount + agencyFees + financedNotary);

  const computedResults = {
    propertyPriceWithAgency: roundToTwo(numPropertyPrice),
    propertyPriceNet: roundToTwo(numPropertyPriceNet),
    discount: roundToTwo(discount),
    propertyPriceNetWithoutDiscount,
    notaryFees,
    personalContribution: roundToTwo(personalContribution),
    financedNotary: roundToTwo(financedNotary),
    agencyFees,
    totalAcquisition,
    grossYield,
    netYield,
    monthlyLoanPayment,
    totalMonthlyCost,
    monthlyCashFlow,
  };

  const handleSyndicPeriodChangeLocal = (newPeriod) => {
    if (newPeriod !== syndicPeriod) {
      if (newPeriod === 'annual') {
        setSyndicFees(roundToTwo((parseFloat(syndicFees) || 0) * 12));
      } else {
        setSyndicFees(roundToTwo((parseFloat(syndicFees) || 0) / 12));
      }
      setSyndicPeriod(newPeriod);
    }
  };

  const handleOwnerInsurancePeriodChangeLocal = (newPeriod) => {
    if (newPeriod !== ownerInsurancePeriod) {
      if (newPeriod === 'annual') {
        setOwnerInsuranceAmount(roundToTwo((parseFloat(ownerInsuranceAmount) || 0) * 12));
      } else {
        setOwnerInsuranceAmount(roundToTwo((parseFloat(ownerInsuranceAmount) || 0) / 12));
      }
      setOwnerInsurancePeriod(newPeriod);
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);
  const openSaveModal = () => {
    setShowModal(true);
  };
  const handleSubmit = () => {
    handleConfirmSave();
  };

  // Modifiez la fonction handleConfirmSave dans MortageSimulator.jsx

  const handleConfirmSave = async () => {
    if (!saveName.trim()) {
      setPopup({ message: "Veuillez entrer un nom pour la sauvegarde.", type: "error", duration: 3000 });
      return;
    }

    const simulationData = {
      name: saveName,
      propertyPrice,
      propertyPriceNet,
      agencyFeesPercent,
      renovationCosts,
      renovationPaidByPocket,
      personalContribution,
      propertyTax,
      syndicPeriod,
      syndicFees,
      ownerInsurancePeriod,
      ownerInsuranceAmount,
      loanDuration,
      interestRate,
      insuranceRate,
      monthlyRent,
      monthlyCharges,
      isFurnished,
      discount,
      results: computedResults,
    };

    try {
      const token = localStorage.getItem('token');
      // 1) on récupère un CSRF token fraîchement généré
      const csrfToken = await fetchCsrfToken();

      // 2) on envoie la requête avec le header X-XSRF-TOKEN
      const response = await fetch('http://localhost:5000/api/simulations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(simulationData),
      });
    
    const data = await response.json();
    if (response.ok) {
      setPopup({
        message: "Simulation sauvegardée !",
        type: "success",
        duration: 3000,
        onClose: () => {
          navigate(`/detailscalcul/${data.simulation.id}`);
          setPopup(null);
        },
      });
    } else {
      setPopup({ message: "Erreur : " + data.message, type: "error", duration: 3000 });
    }
  } catch (error) {
    console.error(error);
    setPopup({ message: "Erreur lors de la sauvegarde de la simulation.", type: "error", duration: 3000 });
  } finally {
    setShowModal(false);
    setSaveName("");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      {popup && (
        <PopupNotification
          message={popup.message}
          type={popup.type}
          duration={popup.duration}
          onClose={popup.onClose ? popup.onClose : () => setPopup(null)}
        />
      )}
      <header className="flex items-center mb-4">
      <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Simaltion d'investissement</h1>
      </header>
      {currentStep === 1 && (
        <StepOne
          propertyPrice={propertyPrice}
          setPropertyPrice={setPropertyPrice}
          propertyPriceNet={propertyPriceNet}
          setPropertyPriceNet={setPropertyPriceNet}
          agencyFeesPercent={agencyFeesPercent}
          setAgencyFeesPercent={setAgencyFeesPercent}
          onNext={nextStep}
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          isFurnished={isFurnished}
          setIsFurnished={setIsFurnished}
          renovationCosts={renovationCosts}
          setRenovationCosts={setRenovationCosts}
          renovationPaidByPocket={renovationPaidByPocket}
          setRenovationPaidByPocket={setRenovationPaidByPocket}
          personalContribution={personalContribution}
          setPersonalContribution={setPersonalContribution}
          useNotaryAsContribution={useNotaryAsContribution}
          setUseNotaryAsContribution={setUseNotaryAsContribution}
          notaryFees={notaryFees}
          onPrev={prevStep}
          onNext={nextStep}
          computedDiscount={computedDiscount}
          useCustomFurnitureValue={useCustomFurnitureValue}
          setUseCustomFurnitureValue={setUseCustomFurnitureValue}
          customFurnitureValue={customFurnitureValue}
          setCustomFurnitureValue={setCustomFurnitureValue}
        />
      )}
      {currentStep === 3 && (
        <StepThree
          propertyTax={propertyTax}
          setPropertyTax={setPropertyTax}
          syndicPeriod={syndicPeriod}
          syndicFees={syndicFees}
          setSyndicFees={setSyndicFees}
          handleSyndicPeriodChange={handleSyndicPeriodChangeLocal}
          ownerInsurancePeriod={ownerInsurancePeriod}
          ownerInsuranceAmount={ownerInsuranceAmount}
          setOwnerInsuranceAmount={setOwnerInsuranceAmount}
          handleOwnerInsurancePeriodChange={handleOwnerInsurancePeriodChangeLocal}
          loanDuration={loanDuration}
          setLoanDuration={setLoanDuration}
          interestRate={interestRate}
          setInterestRate={setInterestRate}
          insuranceRate={insuranceRate}
          setInsuranceRate={setInsuranceRate}
          onPrev={prevStep}
          onNext={nextStep}
        />
      )}
      {currentStep === 4 && (
        <StepFour
          monthlyRent={monthlyRent}
          setMonthlyRent={setMonthlyRent}
          monthlyCharges={monthlyCharges}
          setMonthlyCharges={setMonthlyCharges}
          onPrev={prevStep}
          onNext={nextStep}
        />
      )}
      {currentStep === 5 && (
        <StepFive computedResults={computedResults} onPrev={prevStep} onShowModal={openSaveModal} />
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-end justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>
          <div className="bg-gray-800 w-full h-1/3 rounded-t-lg p-4 z-50 animate-slideUp">
            <h3 className="text-lg font-semibold mb-2 mt-6 text-center text-gray-100">Nom de la sauvegarde</h3>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} className="w-full p-2 border border-gray-600 rounded-3xl pl-3 bg-gray-700 text-gray-100" />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-3xl transition">Annuler</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-greenLight text-white rounded-3xl transition">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MortageSimulator;
