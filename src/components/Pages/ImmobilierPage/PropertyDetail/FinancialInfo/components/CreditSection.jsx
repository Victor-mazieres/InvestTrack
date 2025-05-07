// src/components/Pages/ImmobilierPage/PropertyDetail/components/CreditSection.jsx
import React from 'react';
import { formatFrenchNumber, parseNumber, handleChange } from '../../utils/format';

export default function CreditSection({ values, onChange, results }) {
  const sectionClass = 'bg-gray-800 rounded-3xl shadow-md border border-gray-600 p-6 mb-6';
  const inputClass   = 'w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-3xl px-4 py-2';

  const fields = [
    ['Prix agence (€)', 'prixAgence', onChange.setPrixAgence],
    ['Frais agence (€)', 'fraisAgence', onChange.setFraisAgence],
    ['Prix net vendeur (€)', 'netVendeur', onChange.setNetVendeur],
    ['Décote meuble (€)', 'decoteMeuble', onChange.setDecoteMeuble],
    ['Frais notaire (%)', 'fraisNotairePct', onChange.setFraisNotairePct],
    ['Travaux (€)', 'travaux', onChange.setTravaux],
    ['Taux prêt (%)', 'tauxPret', onChange.setTauxPret],
    ['Durée prêt (ans)', 'dureePretAnnees', onChange.setDureePretAnnees],  // renommé
  ];

  return (
    <section className={sectionClass}>
      <h2 className="text-xl font-bold text-white mb-6">Mensualités de crédit</h2>
      <div className="grid grid-cols-2 gap-6">
        {fields.map(([label, key, setter]) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-2">{label}</label>
            <input
              className={inputClass}
              value={formatFrenchNumber(parseNumber(values[key]))}
              onChange={handleChange(setter)}
            />
          </div>
        ))}
      </div>
      <div className="border-t border-gray-600 mt-6 pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span>Montant emprunté</span>
          <span className="font-semibold text-xl text-greenLight">
            {formatFrenchNumber(parseNumber(results.emprunt))}€
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Mensualité</span>
          <span className="font-semibold text-xl text-greenLight">
            {formatFrenchNumber(parseNumber(results.mensualite))}€
          </span>
        </div>
      </div>
    </section>
  );
}
