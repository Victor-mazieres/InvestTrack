// src/pages/components/BillsSection.jsx
import React, { useState } from 'react';

const BillsSection = ({
  bills = [],
  loading = false,
  addBill,              // (FormData) => Promise
  deleteBill,           // (id) => Promise
  travauxEstimes,
  totalBills,
  budgetRestant,
  renderActions,        // (bill) => ReactNode — optionnel
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !file || !addBill) return;
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('title', title);
      form.append('amount', amount);
      form.append('file', file);
      await addBill(form);
      setTitle('');
      setAmount('');
      setFile(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Échec de l'ajout de la facture.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-300">Travaux estimés</p>
          <p className="text-lg font-bold">
            {Number(travauxEstimes || 0).toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-300">Total factures</p>
          <p className="text-lg font-bold">
            {Number(totalBills || 0).toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-300">Budget restant</p>
          <p className="text-lg font-bold">
            {Number(budgetRestant || 0).toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-gray-400">Chargement des factures…</p>
      ) : bills.length > 0 ? (
        <ul className="space-y-2">
          {bills.map((bill) => {
            const amountNumber = Number(bill.amount);
            const amountDisplay = isNaN(amountNumber)
              ? bill.amount
              : amountNumber.toLocaleString('fr-FR');

            return (
              <li
                key={bill.id}
                className="flex justify-between items-center bg-gray-700 p-2 rounded"
              >
                <div>
                  <div className="font-semibold">{bill.title || 'Sans titre'}</div>
                  <div className="text-sm text-gray-300">
                    {bill.date ? new Date(bill.date).toLocaleDateString() : '—'} — {amountDisplay} €
                  </div>
                </div>

                {/* Actions injectées par le parent ou fallback "Voir" */}
                {typeof renderActions === 'function' ? (
                  renderActions(bill)
                ) : (
                  <a
                    href={bill.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400"
                  >
                    Voir
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-400">Aucune facture pour le moment.</p>
      )}

      {/* Ajout de facture */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
        >
          <span>Ajouter une facture</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-700 p-4 rounded">
          <div>
            <label className="block text-gray-400">Titre de la facture</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 rounded text-white"
              placeholder="Ex. Travaux plomberie"
              required
            />
          </div>
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
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="mt-1 text-gray-200"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setAmount('');
                setFile(null);
              }}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BillsSection;
