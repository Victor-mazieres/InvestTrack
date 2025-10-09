// src/pages/LeaseAndRents.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Loader } from './Loader';
import { useProperty } from '../hooks/useProperty';

export default function LeaseAndRents() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { property, loading, error } = useProperty(id);

  // Amorçage à partir de financialInfo si dispo
  const baseRentHC  = useMemo(() => Number(property?.financialInfo?.loyerHc ?? 0), [property]);
  const baseCharges = useMemo(() => Number(property?.financialInfo?.chargesLoc ?? 0), [property]);
  const baseRentCC  = baseRentHC + baseCharges;

  // État local (peut être branché à une API plus tard)
  const [rentPayments, setRentPayments] = useState(() => {
    const init = property?.financialInfo?.rentPayments;
    return Array.isArray(init) ? init : [];
  });

  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount]     = useState(baseRentCC || '');
  const [payDate, setPayDate]         = useState(() => new Date().toISOString().slice(0,10));
  const [payMethod, setPayMethod]     = useState('virement');

  const addLocalPayment = (e) => {
    e?.preventDefault?.();
    if (!payAmount) return;
    const newItem = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      date: payDate,
      amount: Number(payAmount),
      method: payMethod,
    };
    setRentPayments(prev => [newItem, ...prev]);
    setShowPayForm(false);
  };

  const totalPaidThisMonth = useMemo(() => {
    const m = new Date().toISOString().slice(0,7); // YYYY-MM
    return rentPayments
      .filter(p => (p.date || '').slice(0,7) === m)
      .reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [rentPayments]);

  const dueThisMonth = baseRentCC || 0;
  const remainingThisMonth = Math.max(0, dueThisMonth - totalPaidThisMonth);

  if (error) return <p className="p-4 sm:p-6 text-red-500">Erreur : {error}</p>;
  if (loading || !property) return <Loader />;

  return (
    <div className="min-h-screen bg-noir-780 text-gray-100 p-4 sm:p-6">
      {/* Header responsive */}
      <header className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 sm:p-2.5 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
          aria-label="Revenir en arrière"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Bail & Loyers — <span className="text-greenLight">{property?.name}</span>
        </h1>
      </header>

      {/* Grille mobile-first : 1 col → 3 cols en lg */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Résumé bail */}
        <GlassCard>
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 mb-2">Bail</p>

          <Row label="Locataire">
            <button
              onClick={() => navigate(`/locataire/${property?.owner ?? property?.tenantId}`)}
              className="text-greenLight hover:underline"
            >
              Ouvrir la fiche
            </button>
          </Row>

          <Row label="Loyer HC">{baseRentHC ? `${baseRentHC.toFixed(2)} €` : '—'}</Row>
          <Row label="Charges">{baseCharges ? `${baseCharges.toFixed(2)} €` : '—'}</Row>
          <Row label="Loyer CC">
            <span className="font-semibold">{baseRentCC ? `${baseRentCC.toFixed(2)} €` : '—'}</span>
          </Row>

          {/* Boutons : full width sur mobile */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <button
              onClick={() => navigate(`/bail/${id}`)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-100 transition"
            >
              Gérer le bail
            </button>
            <button
              onClick={() => navigate(`/quittances/${id}`)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-100 transition"
            >
              Quittances
            </button>
          </div>
        </GlassCard>

        {/* Suivi paiements */}
        <div className="lg:col-span-2">
          <GlassCard>
            {/* Pills réactives + wrap */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400">Suivi des paiements</p>
              <div className="flex flex-wrap gap-2">
                <GlassPill label="Dû ce mois" value={`${dueThisMonth.toFixed(2)} €`} />
                <GlassPill label="Payé ce mois" value={`${totalPaidThisMonth.toFixed(2)} €`} />
                <GlassPill label="Reste à payer" value={`${remainingThisMonth.toFixed(2)} €`} />
              </div>
            </div>

            {/* CTA “Enregistrer” : plein largeur sur mobile */}
            {!showPayForm ? (
              <div className="mb-3 sm:mb-4">
                <button
                  onClick={() => setShowPayForm(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition"
                >
                  Enregistrer un paiement
                </button>
              </div>
            ) : (
              <form onSubmit={addLocalPayment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm">Montant (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Mode</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                  >
                    <option value="virement">Virement</option>
                    <option value="cb">CB</option>
                    <option value="cheque">Chèque</option>
                    <option value="especes">Espèces</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                {/* Boutons : stack en mobile */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPayForm(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-100 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            )}

            {/* Liste paiements : limite de hauteur sur mobile pour éviter le scroll infini de la page */}
            {rentPayments.length > 0 ? (
              <div className="space-y-2 max-h-[50vh] sm:max-h-[55vh] overflow-auto pr-1">
                {rentPayments.map(p => (
                  <GlassRow key={p.id}>
                    <div className="min-w-0">
                      <p className="text-white font-medium">
                        {new Date(p.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {Number(p.amount).toFixed(2)} €
                      </p>
                    </div>
                  </GlassRow>
                ))}
              </div>
            ) : (
              <GlassCard className="text-gray-400">Aucun paiement enregistré.</GlassCard>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* === Petits composants UI réutilisables === */
function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 py-1.5">
      <span className="text-sm sm:text-[15px] text-gray-400">{label}</span>
      <span className="text-sm sm:text-[15px] text-white">{children}</span>
    </div>
  );
}
function GlassPill({ label, value }) {
  return (
    <div className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-[11px] sm:text-xs text-gray-200">
      <span className="text-gray-400 mr-1.5 sm:mr-2">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-2xl p-3 sm:p-4",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_22px_-12px_rgba(0,0,0,0.65)]",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/30",
        className
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_65%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
function GlassRow({ children }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      {children}
    </div>
  );
}
