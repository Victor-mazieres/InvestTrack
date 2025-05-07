// src/components/Pages/ImmobilierPage/PropertyDetail/components/ExpensesSection.jsx
import React from 'react';
import { formatFrenchNumber, parseNumber, convert, handleChange } from '../../utils/format';

export default function ExpensesSection({ values, onChange, results }) {
  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  const inputClass   = 'bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl px-4 py-2';

  return (
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
                checked={values.taxeFoncierePeriod === p}
                onChange={() => {
                  onChange.setTaxeFonciere(
                    convert(values.taxeFonciere, values.taxeFoncierePeriod, p)
                  );
                  onChange.setTaxeFoncierePeriod(p);
                }}
              />
              <span className="capitalize">{p === 'annual' ? 'Annuel' : 'Mensuel'}</span>
            </label>
          ))}
        </div>
        <input
          className={`${inputClass} md:w-32`}
          value={formatFrenchNumber(parseNumber(values.taxeFonciere))}
          onChange={handleChange(onChange.setTaxeFonciere)}
        />
      </div>

      {/* Charges copropriété & PNO */}
      {[
        ['Charges copropriété', 'chargesCopro', 'chargesCoproPeriod', onChange.setChargesCopro, onChange.setChargesCoproPeriod],
        ['Assurance PNO',       'assurancePno', 'assurancePnoPeriod', onChange.setAssurancePno, onChange.setAssurancePnoPeriod],
      ].map(([label, key, perKey, setter, setPeriod]) => (
        <div key={key} className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">{label}</label>
          <div className="flex flex-wrap items-center space-x-4 mb-4">
            {['monthly','annual'].map(p => (
              <label key={p} className="flex items-center space-x-2 text-gray-200">
                <input
                  type="radio"
                  checked={values[perKey] === p}
                  onChange={() => {
                    setter(convert(values[key], values[perKey], p));
                    setPeriod(p);
                  }}
                />
                <span className="capitalize">{p === 'annual' ? 'Annuel' : 'Mensuel'}</span>
              </label>
            ))}
          </div>
          <input
            className={`${inputClass} md:w-32`}
            value={formatFrenchNumber(parseNumber(values[key]))}
            onChange={handleChange(setter)}
          />
        </div>
      ))}

      {/* Autres sorties */}
      <div className="space-y-4 mb-4">
        {[
          ['Assur. emprunteur', 'assurEmprunteur', onChange.setAssurEmprunteur],
          ['Charge récupérable', 'chargeRecup', onChange.setChargeRecup],
          ['Élec / Gaz',        'elecGaz', onChange.setElecGaz],
          ['Autre sortie',      'autreSortie', onChange.setAutreSortie],
        ].map(([label, key, setter]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-200">{label}</span>
            <input
              className="w-24 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl text-right"
              value={formatFrenchNumber(parseNumber(values[key]))}
              onChange={handleChange(setter)}
            />
          </div>
        ))}
      </div>

      {/* Récapitulatif */}
      <div className="border-t border-gray-600 mt-6 pt-4 flex justify-between">
        <span className="font-semibold text-white">Total sorties</span>
        <span className="font-semibold text-xl text-greenLight">
          {formatFrenchNumber(parseNumber(results.totalSorties))}€
        </span>
      </div>
    </section>
  );
}
