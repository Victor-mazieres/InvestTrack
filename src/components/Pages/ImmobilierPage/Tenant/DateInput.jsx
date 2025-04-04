// src/PeaPage/Modules/Reutilisable/DateInput.jsx
import React from 'react';
import { IMaskInput } from 'react-imask';

const DateInput = ({ value, onChange, error }) => {
  return (
    <div className="w-full">
      <label className="block mb-2 text-gray-300">Date de Naissance</label>
      <IMaskInput
        mask="00/00/0000"
        placeholder="JJ/MM/AAAA"
        value={value}
        onAccept={(val) => onChange({ target: { value: val } })}
        className="w-full p-3 border border-gray-600 rounded-3xl bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DateInput;
