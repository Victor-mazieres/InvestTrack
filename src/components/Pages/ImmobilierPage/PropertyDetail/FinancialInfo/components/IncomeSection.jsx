// src/components/Pages/ImmobilierPage/PropertyDetail/components/IncomeSection.jsx
import React from 'react';
import { formatFrenchNumber, parseNumber, handleChange } from '../../utils/format';

export default function IncomeSection({ values, onChange, results }) {
  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  return (
    <section className={sectionClass}>
      <h2 className="text-xl font-bold text-white mb-6">Entrées</h2>
      <div className="space-y-4 mb-4">
        {[
          ['Loyer Hc',      'loyerHc',    onChange.setLoyerHc],   // déjà correct
          ['Charges locataire', 'chargesLoc', onChange.setChargesLoc],
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
      <div className="border-t border-gray-600 mt-6 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-white">Total HC</span>
          <span className="font-semibold text-xl text-greenLight">
            {formatFrenchNumber(parseNumber(results.entreeHc))}€    {/* renommé */}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">Total CC</span>
          <span className="font-semibold text-xl">
            {formatFrenchNumber(parseNumber(results.totalCc))}€    {/* renommé */}
          </span>
        </div>
      </div>
    </section>
  );
}
