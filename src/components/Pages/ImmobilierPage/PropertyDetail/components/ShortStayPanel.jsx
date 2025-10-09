// src/pages/ShortTermRents.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Loader } from './Loader';
import { useProperty } from '../hooks/useProperty';

/**
 * LCD (Location Courte Durée)
 * - Enregistrer des séjours (check-in / check-out, prix/nuit, frais ménage)
 * - Enregistrer des paiements (montant, date, mode, lié à un séjour facultatif)
 * - KPIs mensuels basiques : nuits du mois, facturé ce mois, encaissé ce mois, reste à encaisser
 * Mobile-first.
 */
export default function ShortTermRents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error } = useProperty(id);

  // Amorçage (si des valeurs existent dans financialInfo)
  const baseNightPrice = useMemo(
    () => Number(property?.financialInfo?.nightlyPrice ?? property?.financialInfo?.prixNuit ?? 0),
    [property]
  );
  const defaultCleaning = useMemo(
    () => Number(property?.financialInfo?.cleaningFee ?? property?.financialInfo?.menage ?? 0),
    [property]
  );

  // ======== Séjours (nuits) — local (brancheable à une API plus tard)
  const [bookings, setBookings] = useState(() => {
    const init = property?.financialInfo?.bookings;
    return Array.isArray(init) ? init : [];
  });

  const [bookingForm, setBookingForm] = useState(() => ({
    guest: '',
    channel: 'direct', // airbnb | booking | direct | autre
    checkIn: new Date().toISOString().slice(0,10),
    checkOut: new Date(Date.now() + 86400000).toISOString().slice(0,10),
    nightRate: baseNightPrice || '',
    cleaningFee: defaultCleaning || 0,
    notes: '',
  }));

  // ======== Paiements — local (brancheable à une API plus tard)
  const [payments, setPayments] = useState(() => {
    const init = property?.financialInfo?.payments;
    return Array.isArray(init) ? init : [];
  });

  const [payForm, setPayForm] = useState(() => ({
    amount: '',
    date: new Date().toISOString().slice(0,10),
    method: 'virement',
    bookingId: '', // optionnel : rattacher à un séjour
    ref: '',
    notes: '',
  }));

  // ======== Helpers Dates/Calcul
  const iso = (d) => new Date(d).toISOString().slice(0,10);
  const diffNights = (ci, co) => {
    const inD  = new Date(ci);
    const outD = new Date(co);
    const ms = outD - inD;
    return Math.max(0, Math.round(ms / 86400000));
  };

  const monthBounds = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) }; // [start, end)
  };

  // Nuits de la réservation tombant dans le mois courant
  const overlapNightsWithMonth = (ci, co, dateRef = new Date()) => {
    const { start, end } = monthBounds(dateRef);
    const a = new Date(ci);
    const b = new Date(co);
    const startMax = a > start ? a : start;
    const endMin   = b < end ? b : end;
    const ms = endMin - startMax;
    return Math.max(0, Math.round(ms / 86400000));
  };

  // Chiffre d’affaires "facturé ce mois" (basé sur les nuits qui tombent dans le mois)
  const { nightsThisMonth, billedThisMonth } = useMemo(() => {
    const now = new Date();
    let nights = 0;
    let billed = 0;

    bookings.forEach(b => {
      const n = overlapNightsWithMonth(b.checkIn, b.checkOut, now);
      if (n <= 0) return;

      const rate = Number(b.nightRate || 0);
      const clean = Number(b.cleaningFee || 0);

      nights += n;
      // Pro-rata du ménage : on compte 1 ménage si le séjour passe (au moins une nuit) dans le mois.
      billed += (n * rate) + clean;
    });

    return { nightsThisMonth: nights, billedThisMonth: billed };
  }, [bookings]);

  // Encaissé ce mois
  const paidThisMonth = useMemo(() => {
    const month = new Date().toISOString().slice(0,7); // YYYY-MM
    return payments
      .filter(p => (p.date || '').slice(0,7) === month)
      .reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [payments]);

  const remainingThisMonth = Math.max(0, billedThisMonth - paidThisMonth);

  // ======== Actions
  const addBooking = (e) => {
    e?.preventDefault?.();
    const n = diffNights(bookingForm.checkIn, bookingForm.checkOut);
    if (!n || Number(bookingForm.nightRate) <= 0) return;

    const item = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      ...bookingForm,
      nightRate: Number(bookingForm.nightRate),
      cleaningFee: Number(bookingForm.cleaningFee || 0),
      nights: n,
    };
    setBookings(prev => [item, ...prev]);

    setBookingForm(f => ({
      ...f,
      guest: '',
      channel: 'direct',
      checkIn: iso(new Date()),
      checkOut: iso(new Date(Date.now() + 86400000)),
      nightRate: baseNightPrice || '',
      cleaningFee: defaultCleaning || 0,
      notes: '',
    }));
  };

  const removeBooking = (id) => setBookings(prev => prev.filter(b => b.id !== id));

  const addPayment = (e) => {
    e?.preventDefault?.();
    if (!payForm.amount) return;
    const item = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      amount: Number(payForm.amount),
      date: payForm.date,
      method: payForm.method,
      bookingId: payForm.bookingId || null,
      ref: payForm.ref || '',
      notes: payForm.notes || '',
    };
    setPayments(prev => [item, ...prev]);

    setPayForm(f => ({
      ...f,
      amount: '',
      date: iso(new Date()),
      method: 'virement',
      bookingId: '',
      ref: '',
      notes: '',
    }));
  };

  const removePayment = (id) => setPayments(prev => prev.filter(p => p.id !== id));

  if (error) return <p className="p-4 sm:p-6 text-red-500">Erreur : {error}</p>;
  if (loading || !property) return <Loader />;

  return (
    <div className="min-h-screen bg-noir-780 text-gray-100 p-4 sm:p-6">
      {/* Header */}
      <header className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 sm:p-2.5 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
          aria-label="Revenir en arrière"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Séjours & Paiements (LCD) — <span className="text-greenLight">{property?.name}</span>
        </h1>
      </header>

      {/* KPIs mensuels basiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Kpi title="Nuits ce mois" value={nightsThisMonth} />
        <Kpi title="Facturé ce mois" value={`${billedThisMonth.toFixed(0)} €`} />
        <Kpi title="Encaissé ce mois" value={`${paidThisMonth.toFixed(0)} €`} />
        <Kpi title="Reste à encaisser" value={`${remainingThisMonth.toFixed(0)} €`} />
      </div>

      {/* Grid principale : mobile-first */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Formulaire Séjour */}
        <GlassCard>
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 mb-3">Ajouter un séjour</p>
          <form onSubmit={addBooking} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm">Voyageur</label>
              <input
                type="text"
                value={bookingForm.guest}
                onChange={(e) => setBookingForm(f => ({ ...f, guest: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                placeholder="Nom du voyageur"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Canal</label>
              <select
                value={bookingForm.channel}
                onChange={(e) => setBookingForm(f => ({ ...f, channel: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
              >
                <option value="direct">Direct</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Arrivée</label>
              <input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm(f => ({ ...f, checkIn: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Départ</label>
              <input
                type="date"
                min={bookingForm.checkIn}
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm(f => ({ ...f, checkOut: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Prix / nuit (€)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={bookingForm.nightRate}
                onChange={(e) => setBookingForm(f => ({ ...f, nightRate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Frais ménage (€)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={bookingForm.cleaningFee}
                onChange={(e) => setBookingForm(f => ({ ...f, cleaningFee: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm">Notes (optionnel)</label>
              <textarea
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                placeholder="Infos utiles sur le séjour…"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition"
              >
                Ajouter le séjour
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Formulaire Paiement */}
        <GlassCard>
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 mb-3">Enregistrer un paiement</p>
          <form onSubmit={addPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={payForm.amount}
                onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Date</label>
              <input
                type="date"
                value={payForm.date}
                onChange={(e) => setPayForm(f => ({ ...f, date: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Mode</label>
              <select
                value={payForm.method}
                onChange={(e) => setPayForm(f => ({ ...f, method: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
              >
                <option value="virement">Virement</option>
                <option value="cb">CB</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Séjour (optionnel)</label>
              <select
                value={payForm.bookingId}
                onChange={(e) => setPayForm(f => ({ ...f, bookingId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
              >
                <option value="">— Non rattaché —</option>
                {bookings.map(b => {
                  const label = `${b.guest || 'Voyageur'} · ${new Date(b.checkIn).toLocaleDateString('fr-FR')}→${new Date(b.checkOut).toLocaleDateString('fr-FR')}`;
                  return <option key={b.id} value={b.id}>{label}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Référence (optionnel)</label>
              <input
                type="text"
                value={payForm.ref}
                onChange={(e) => setPayForm(f => ({ ...f, ref: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                placeholder="N° virement, stripe id…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm">Notes (optionnel)</label>
              <textarea
                rows={2}
                value={payForm.notes}
                onChange={(e) => setPayForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-900/60 border border-white/10 text-white"
                placeholder="Infos complémentaires sur le paiement…"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition"
              >
                Enregistrer le paiement
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Liste des séjours */}
        <GlassCard className="lg:col-span-2">
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 mb-3">Séjours</p>
          {bookings.length > 0 ? (
            <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
              {bookings.map(b => {
                const nights = diffNights(b.checkIn, b.checkOut);
                const total  = (nights * Number(b.nightRate || 0)) + Number(b.cleaningFee || 0);
                return (
                  <GlassRow key={b.id}>
                    <div className="min-w-0">
                      <p className="text-white font-medium">
                        {b.guest || 'Voyageur'} — {b.channel}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(b.checkIn).toLocaleDateString('fr-FR')} → {new Date(b.checkOut).toLocaleDateString('fr-FR')} · {nights} nuit{nights>1?'s':''}
                      </p>
                      {b.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{b.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        {Number(b.nightRate).toFixed(0)} € /n · Ménage {Number(b.cleaningFee||0).toFixed(0)} €
                      </p>
                      <p className="text-lg font-semibold text-white">{total.toFixed(0)} €</p>
                      <button
                        onClick={() => removeBooking(b.id)}
                        className="mt-1 inline-flex px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[12px] text-gray-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </GlassRow>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Aucun séjour" desc="Ajoute un séjour pour commencer à suivre les nuits et encaissements." />
          )}
        </GlassCard>

        {/* Liste des paiements */}
        <GlassCard className="lg:col-span-2">
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 mb-3">Paiements</p>
          {payments.length > 0 ? (
            <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
              {payments.map(p => {
                const linked = p.bookingId ? bookings.find(b => b.id === p.bookingId) : null;
                return (
                  <GlassRow key={p.id}>
                    <div className="min-w-0">
                      <p className="text-white font-medium">
                        {Number(p.amount).toFixed(2)} € — {p.method}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.date).toLocaleDateString('fr-FR')}
                        {linked ? ` · ${linked.guest || 'Voyageur'} (${new Date(linked.checkIn).toLocaleDateString('fr-FR')}→${new Date(linked.checkOut).toLocaleDateString('fr-FR')})` : ''}
                        {p.ref ? ` · Ref: ${p.ref}` : ''}
                      </p>
                      {p.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.notes}</p>}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => removePayment(p.id)}
                        className="inline-flex px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[12px] text-gray-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </GlassRow>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Aucun paiement" desc="Enregistre un paiement pour suivre ce qui est encaissé." />
          )}
        </GlassCard>
      </div>
    </div>
  );
}

/* ====== Petits composants UI ====== */
function Kpi({ title, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
function EmptyState({ title, desc }) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
      <p className="text-white font-medium">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{desc}</p>
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
