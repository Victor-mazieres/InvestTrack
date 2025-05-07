// src/components/Pages/ImmobilierPage/PropertyDetail/components/TaxSection.jsx
import React from 'react';
import { formatFrenchNumber, parseNumber, handleChange } from '../../utils/format';
import { Info } from 'lucide-react';

export default function TaxSection({ values, onChange, results, onOpenTmi }) {
  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  return (
    <section className={sectionClass}>
      <h2 className="text-xl font-bold text-white mb-6">Impôts</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Revenu annuel HC</span>
          <span className="font-medium">
            {formatFrenchNumber(parseNumber(results.entreeHc) * 12)}€ {/* renommé */}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Après 50% (base Micro-BIC)</span>
          <span className="font-medium">
            {formatFrenchNumber(parseNumber(results.entreeHc) * 12 * 0.5)}€ {/* renommé */}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Cotisations sociales</span>
          <span className="font-medium">
            {formatFrenchNumber((parseNumber(results.entreeHC) * 12 * 0.5) * (parseNumber(values.cotSocPct) / 100))}€
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>TMI (%)</span>
          <div className="flex items-center space-x-2">
            <input
              className="w-16 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl text-right"
              value={formatFrenchNumber(parseNumber(values.tmi))}
              onChange={handleChange(onChange.setTmi)}
            />
            <button onClick={onOpenTmi} className="p-1 rounded hover:bg-gray-700">
              <Info className="w-5 h-5 text-gray-200 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span>Impôt mensuel</span>
          <span className="font-medium text-greenLight">
            {formatFrenchNumber(parseNumber(results.impotMensuel))}€
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Impôt annuel total</span>
          <span className="font-medium text-greenLight">
            {formatFrenchNumber(parseNumber(results.impotAnnuel))}€
          </span>
        </div>
      </div>
    </section>
  );
}
