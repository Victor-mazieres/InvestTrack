// src/components/BillsTab.jsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

const BillsTab = ({ propertyId }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/properties/${propertyId}/bills`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setBills(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!amount || !file) return;
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('file', file);

    fetch(`http://localhost:5000/api/properties/${propertyId}/bills`, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then(newBill => {
        setBills([newBill, ...bills]);
        setShowForm(false);
        setAmount('');
        setFile(null);
      })
      .catch(console.error);
  };

  return (
    <div className="p-4 border-t border-gray-700 space-y-4">
      {loading ? (
        <p className="text-gray-400">Chargement des factures…</p>
      ) : (
        <>
          {bills.length > 0 ? (
            <ul className="space-y-2">
              {bills.map(b => (
                <li key={b.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span>
                    {new Date(b.date).toLocaleDateString()} — {b.amount.toLocaleString('fr-FR')} €
                  </span>
                  <a
                    href={b.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400"
                  >
                    Voir
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Aucune facture pour le moment.</p>
          )}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 bg-gray-700 p-4 rounded">
              <div>
                <label className="block text-gray-400">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400">Document</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => setFile(e.target.files[0])}
                  className="mt-1 text-gray-200"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setAmount('');
                    setFile(null);
                  }}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-greenLight rounded hover:bg-green-500 transition text-white"
                >
                  Envoyer
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default BillsTab;
