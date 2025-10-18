// src/pages/LeaseAndRents.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Loader } from './Loader';
import { useProperty } from '../hooks/useProperty';
import PrimaryButton from '../../Reutilisable/PrimaryButton';

// Store synchronisé (localStorage + backend)
import {
  definirConfigBien,
  enregistrerDateEcheanceServeur,
  enregistrerPaiementServeur,
} from '../../utils/rentCalendarStore';

export default function LeaseAndRents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const { property, loading, error } = useProperty(id);

  // Montants de base
  const baseRentHC  = useMemo(() => Number(property?.financialInfo?.loyerHc ?? 0), [property]);
  const baseCharges = useMemo(() => Number(property?.financialInfo?.chargesLoc ?? 0), [property]);
  const baseRentCC  = baseRentHC + baseCharges;

  // Échéance (date) — champ local + bouton “Confirmer”
  const initialDueDate = useMemo(() => {
    // Si tu as déjà une date côté API, mappe-la ici (ex: property?.rentConfig?.startDate)
    const fromApi = property?.financialInfo?.nextDueDate || property?.rentConfig?.startDate;
    return fromApi || new Date().toISOString().slice(0, 10);
  }, [property]);

  const [unsavedDueDate, setUnsavedDueDate] = useState(initialDueDate);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null); // "success" | "error" | null

  // Paiements (UI locale)
  const [rentPayments, setRentPayments] = useState(() => {
    // Si tu reçois des paiements du back dans property.financialInfo, amorce ici
    const init = property?.financialInfo?.rentPayments || property?.rentPayments;
    return Array.isArray(init) ? init : [];
  });
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount]     = useState(baseRentCC || '');
  const [payDate, setPayDate]         = useState(() => new Date().toISOString().slice(0,10));
  const [payMethod, setPayMethod]     = useState('virement');
  const [payLoading, setPayLoading]   = useState(false);
  const [payError, setPayError]       = useState(null);

  // Enrichit le store local (titre utilisé dans le calendrier)
  useEffect(() => {
    if (property?.name) {
      definirConfigBien(id, { title: property.name });
    }
  }, [id, property?.name]);

  // Confirme la date d’échéance -> backend + store + calendrier
  const handleConfirmDueDate = async () => {
    setConfirmStatus(null);
    setConfirmLoading(true);
    try {
      if (!unsavedDueDate) throw new Error('Aucune date');
      await enregistrerDateEcheanceServeur({
        token,
        propertyId: id,
        startDate: unsavedDueDate,
      });
      setConfirmStatus('success');
    } catch (e) {
      console.error(e);
      setConfirmStatus('error');
    } finally {
      setConfirmLoading(false);
      setTimeout(() => setConfirmStatus(null), 2500);
    }
  };

  // Enregistrement d’un paiement -> backend + store + calendrier
  const submitPayment = async (e) => {
    e?.preventDefault?.();
    setPayError(null);
    if (!payAmount) return;

    setPayLoading(true);
    try {
      await enregistrerPaiementServeur({
        token,
        propertyId: id,
        date: payDate,
        amount: Number(payAmount),
        method: payMethod,
      });
      // UI locale : on empile le nouveau paiement
      setRentPayments(prev => [
        {
          id: crypto?.randomUUID?.() || String(Date.now()),
          date: payDate,
          amount: Number(payAmount),
          method: payMethod,
        },
        ...prev,
      ]);
      setShowPayForm(false);
    } catch (err) {
      console.error(err);
      setPayError("Erreur lors de l'enregistrement du paiement");
    } finally {
      setPayLoading(false);
    }
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
      {/* Header */}
      <header className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Bail & Loyers — <span className="text-greenLight">{property?.name}</span>
        </h1>
      </header>

      {/* Grille */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Carte Bail */}
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

          {/* Échéance — date + bouton de confirmation */}
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Prochaine échéance (date)</label>
              <input
                type="date"
                value={unsavedDueDate}
                onChange={(e) => setUnsavedDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Cliquez sur <span className="text-gray-300 font-medium">“Confirmer la date”</span> pour mettre à jour le calendrier du Dashboard (et sauvegarder côté serveur).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmDueDate}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {confirmLoading ? 'Enregistrement…' : 'Confirmer la date'}
              </button>

              {confirmStatus === 'success' && (
                <span className="text-xs text-emerald-400">Date mise à jour ✅</span>
              )}
              {confirmStatus === 'error' && (
                <span className="text-xs text-red-400">Échec de l’enregistrement ❌</span>
              )}
            </div>
          </div>

          {/* Raccourcis */}
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

        {/* Carte Paiements */}
        <div className="lg:col-span-2">
          <GlassCard>
            {/* Stats rapides */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400">Suivi des paiements</p>
              <div className="flex flex-wrap gap-2">
                <GlassPill label="Dû ce mois" value={`${dueThisMonth.toFixed(2)} €`} />
                <GlassPill label="Payé ce mois" value={`${totalPaidThisMonth.toFixed(2)} €`} />
                <GlassPill label="Reste à payer" value={`${remainingThisMonth.toFixed(2)} €`} />
              </div>
            </div>

            {/* Formulaire paiement (indépendant de l’échéance) */}
            {!showPayForm ? (
              <div className="mb-3 sm:mb-4">
                <PrimaryButton onClick={() => setShowPayForm(true)} className="w-full sm:w-auto">
                  Enregistrer un paiement
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={submitPayment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                    disabled={payLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition disabled:opacity-60"
                  >
                    {payLoading ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}

            {payError && <p className="text-sm text-red-400 mb-2">{payError}</p>}

            {/* Liste des paiements */}
            {rentPayments.length > 0 ? (
              <div className="space-y-2 max-h-[50vh] sm:max-h-[55vh] overflow-auto pr-1">
                {rentPayments.map(p => (
                  <GlassRow key={`${p.id}-${p.date}`}>
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

/* === Petits composants UI === */
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
