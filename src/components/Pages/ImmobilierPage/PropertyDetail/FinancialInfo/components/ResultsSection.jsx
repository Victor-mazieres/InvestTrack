// src/components/Pages/ImmobilierPage/PropertyDetail/components/ResultsSection.jsx
import React from 'react';
import { formatFrenchNumber, parseNumber } from '../../utils/format';

export default function ResultsSection({ results }) {
  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  return (
    <section className={sectionClass}>
      <h2 className="text-xl font-bold text-white mb-6">Résultats</h2>
      <div className="space-y-4">
        {[
          ['Cash flow / mois', results.cfMensuel],
          ['Cash flow / an',   results.cfAnnuel],
          ['Cash flow total',  results.cfTotal],
        ].map(([label, val]) => {
          const num = parseNumber(val);
          const color = num >= 0 ? 'text-checkgreen' : 'text-checkred';
          return (
            <div key={label} className="flex justify-between items-center">
              <span>{label}</span>
              <span className={`font-medium ${color}`}>
                {formatFrenchNumber(num)}€
              </span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-600 mt-6 pt-4 space-y-4">
        {[
          ['Cash flow net net / mois', results.cfNetNetMensuel],
          ['Cash flow net net / an',   results.cfNetNetAnnuel],
          ['Cash flow net net total',  results.cfNetNetTotal],
        ].map(([label, val]) => {
          const num = parseNumber(val);
          const color = num >= 0 ? 'text-checkgreen' : 'text-checkred';
          return (
            <div key={label} className="flex justify-between items-center">
              <span>{label}</span>
              <span className={`font-medium ${color}`}>
                {formatFrenchNumber(num)}€
              </span>
            </div>
          );
        })}
        <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center">
          <span>Total intérêts</span>
          <span className="font-medium">
            {formatFrenchNumber(parseNumber(results.interets))}€
          </span>
        </div>
      </div>
    </section>
  );
}
