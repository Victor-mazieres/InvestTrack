// src/pages/PropertyDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Plus, ArrowLeft, Eye, Trash,
  MapPin, Building2, Home, Hash, Layers, DoorOpen, User2,
  CalendarDays, Ruler, Phone, Mail, FileText, DollarSign, Receipt, Hammer
} from 'lucide-react';

import DonutChart           from './components/DonutChart';
import FinancialDataDisplay from './FinancialInfo/FinancialDataDisplay';
import PhotoCarousel        from './components/PhotoCarousel';
import SectionLoader        from './components/SectionLoader';
import { Loader }           from './components/Loader';
import TenantTab            from './components/TenantTab';
import WorkProgress         from './components/WorkProgress';

// LLD / bail au mois
import LeasePanel           from './components/LeaseAndRents';
// LCD / courte durée (nuits & paiements)
import ShortStayPanel       from './components/ShortStayPanel';

import { useProperty }   from './hooks/useProperty';
import { useBills }      from './hooks/useBills';
import { useFinancials } from './hooks/useFinancials';
import { usePhotos }     from './hooks/usePhotos';

/* ===========================
   UI Carrés (2×2+) + Panneaux
   =========================== */

function TileButton({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "group relative aspect-square w-full rounded-2xl p-4",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_22px_-12px_rgba(0,0,0,0.65)]",
        active ? "outline outline-2 outline-checkgreen/40" : "hover:bg-white/5",
        "transition"
      ].join(" ")}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <span className={["text-2xl", active ? "text-greenLight" : "text-gray-200"].join(" ")}>
          {icon}
        </span>
        <span className={["text-sm font-medium", active ? "text-white" : "text-gray-300"].join(" ")}>
          {label}
        </span>
      </div>
      {active && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </span>
      )}
    </button>
  );
}

function Panel({ show, children }) {
  return (
    <div className="col-span-2">
      <div
        className={[
          "overflow-hidden transition-[grid-template-rows] duration-300",
          show ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"
        ].join(" ")}
      >
        <div className="min-h-0">
          {show && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0a1016]/60 p-4 ring-1 ring-black/10">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Page
   =========================== */

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { property, loading: propLoading, error: propErr } = useProperty(id);
  const { bills, loading: billsLoading, deleteBill, addBill } = useBills(id);
  const { totalBills, travauxEstimes, budgetRestant, pieData } =
    useFinancials(property?.financialInfo, bills);
  const { photos, loading: photosLoading, addPhoto, deletePhoto } = usePhotos(id);

  const [activeTab, setActiveTab] = useState(null);

  // === Base API (utilise .env si présent)
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // === Résolution asynchrone du tenantId avant navigation
  const [resolvingTenant, setResolvingTenant] = useState(false);
  const [tenantResolveError, setTenantResolveError] = useState(null);

  const tryFetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) return { ok: false, status: res.status, data: null };
    const data = await res.json();
    return { ok: true, status: 200, data };
  };

  const looksLikeNumericId = (v) => /^\d+$/.test(String(v ?? '').trim());

  const resolveTenantIdAsync = async (p) => {
    if (!p) return null;
    if (p.tenantId)               return String(p.tenantId);
    if (p.tenant && p.tenant.id)  return String(p.tenant.id);
    if (p.ownerId)                return String(p.ownerId);
    if (p.tenantUserId)           return String(p.tenantUserId);
    if (p.owner && typeof p.owner === 'object' && (p.owner.id || p.owner._id)) {
      return String(p.owner.id || p.owner._id);
    }
    if (looksLikeNumericId(p.owner)) {
      const r = await tryFetchJson(`${API_BASE}/api/tenants/${p.owner}`);
      if (r.ok && r.data && (r.data.id || r.data._id)) return String(r.data.id || r.data._id);
      const r2 = await tryFetchJson(`${API_BASE}/api/tenants?userId=${p.owner}`);
      if (r2.ok && Array.isArray(r2.data) && r2.data.length > 0) {
        const t = r2.data[0];
        if (t && (t.id || t._id)) return String(t.id || t._id);
      }
    }
    const all = await tryFetchJson(`${API_BASE}/api/tenants`);
    if (all.ok && Array.isArray(all.data)) {
      const hintEmail = p.ownerEmail || p.email || null;
      const hintName  = p.ownerName  || p.name  || null;
      if (hintEmail) {
        const found = all.data.find(t => (t.email || '').toLowerCase() === String(hintEmail).toLowerCase());
        if (found && (found.id || found._id)) return String(found.id || found._id);
      }
      if (hintName) {
        const ln = String(hintName).toLowerCase();
        const found = all.data.find(t => `${t.name ?? ''} ${t.firstName ?? ''}`.toLowerCase().includes(ln));
        if (found && (found.id || found._id)) return String(found.id || found._id);
      }
    }
    return null;
  };

  const handleGoToTenant = async () => {
    setTenantResolveError(null);
    setResolvingTenant(true);
    try {
      const tenantId = await resolveTenantIdAsync(property);
      if (tenantId) navigate(`/locataire/${tenantId}`);
      else navigate(`/locataire/new?property=${id}`);
    } catch (e) {
      console.error(e);
      setTenantResolveError("Impossible de trouver le locataire. Redirection vers la création.");
      navigate(`/locataire/new?property=${id}`);
    } finally {
      setResolvingTenant(false);
    }
  };

  // === Détection via rentalKind (LLD | LCD | AV)
  const getRentalKind = (p) => {
    const rk = String(p?.rentalKind || '').toUpperCase();
    if (rk === 'LLD' || rk === 'LCD' || rk === 'AV') return rk;
    const mode = String(p?.mode || '').toLowerCase();
    const rs   = String(p?.rentalStrategy || '').toLowerCase();
    if (mode === 'achat_revente') return 'AV';
    if (mode === 'location') return rs === 'short_term' ? 'LCD' : 'LLD';
    return 'LLD';
  };

  // === Navigation vers la bonne page financière
  const goToFinancial = () => {
    const kind = getRentalKind(property);
    if (kind === 'LCD')      navigate(`/properties/${id}/financial-short?mode=LCD`);
    else if (kind === 'AV')  navigate(`/properties/${id}/financial-sell?mode=AV`);
    else                     navigate(`/properties/${id}/financial?mode=LLD`);
  };

  if (propErr)                  return <div className="p-6 text-red-500">{propErr}</div>;
  if (propLoading || !property) return <Loader />;

  const rentalKind = getRentalKind(property); // 'LLD' | 'LCD' | 'AV'

  return (
    <div className="min-h-screen bg-noir-780 text-gray-100 p-6">
      {/* HEADER */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <h2 className="text-3xl mb-6 text-white">
        Détails du bien <span className="text-greenLight">{property.name}</span>
      </h2>

      {photosLoading
        ? <Loader />
        : <PhotoCarousel photos={photos} onAdd={addPhoto} onDelete={deletePhoto} />
      }

      <DonutChart data={pieData} />

      {!!tenantResolveError && (
        <p className="mt-2 mb-2 text-sm text-amber-300">{tenantResolveError}</p>
      )}

      {/* ==============================
          Grille de 6 carrés + panneaux
         ============================== */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <TileButton
          label="Location"
          icon={<MapPin className="w-7 h-7" />}
          active={activeTab === 'location'}
          onClick={() => setActiveTab(t => (t === 'location' ? null : 'location'))}
        />
        <TileButton
          label="Financier"
          icon={<DollarSign className="w-7 h-7" />}
          active={activeTab === 'financial'}
          onClick={() => setActiveTab(t => (t === 'financial' ? null : 'financial'))}
        />
        <TileButton
          label="Factures"
          icon={<Receipt className="w-7 h-7" />}
          active={activeTab === 'bills'}
          onClick={() => setActiveTab(t => (t === 'bills' ? null : 'bills'))}
        />
        <TileButton
          label="Locataire"
          icon={<User2 className="w-7 h-7" />}
          active={activeTab === 'tenant'}
          onClick={() => setActiveTab(t => (t === 'tenant' ? null : 'tenant'))}
        />
        <TileButton
          label="Travaux"
          icon={<Hammer className="w-7 h-7" />}
          active={activeTab === 'works'}
          onClick={() => setActiveTab(t => (t === 'works' ? null : 'works'))}
        />
        {/* NOUVEAU : BAIL & LOYERS */}
        <TileButton
          label={rentalKind === 'LCD' ? "Séjours & Paiements" : "Bail & Loyers"}
          icon={<FileText className="w-7 h-7" />}
          active={activeTab === 'lease'}
          onClick={() => setActiveTab(t => (t === 'lease' ? null : 'lease'))}
        />

        {/* --------- PANEL : Location --------- */}
        <Panel show={activeTab === 'location'}>
          <SectionLoader loading={false} error={null}>
            {/* HEADER */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-400">Information location</p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {property?.propertyType || "Bien"} — {property?.city || "Ville"}
                </h3>

                {property?.address ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.address)}`}
                    target="_blank" rel="noreferrer"
                    className="mt-1 inline-flex items-center text-greenLight hover:underline"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}
                  </a>
                ) : (
                  <span className="text-gray-400">Adresse non renseignée</span>
                )}
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <SpecTile icon={<Home className="w-4 h-4" />} label="Type de bien" value={property?.propertyType} />
              <SpecTile icon={<Hash className="w-4 h-4" />} label="Code Postal" value={property?.postalCode} />
              <SpecTile icon={<MapPin className="w-4 h-4" />} label="Ville" value={property?.city} />
              <SpecTile icon={<Ruler className="w-4 h-4" />} label="Surface" value={property?.surface ? `${property.surface} m²` : null} />
              <SpecTile icon={<Building2 className="w-4 h-4" />} label="Bâtiment" value={property?.building} />
              <SpecTile icon={<Hash className="w-4 h-4" />} label="Lot" value={property?.lot} />
              <SpecTile icon={<Layers  className="w-4 h-4" />} label="Étage" value={property?.floor} />
              <SpecTile icon={<DoorOpen className="w-4 h-4" />} label="Porte" value={property?.door} />
              <SpecTile icon={<User2 className="w-4 h-4" />} label="Propriétaire" value={property?.owner} />
              <SpecTile
                icon={<CalendarDays className="w-4 h-4" />}
                label="Date d’acquisition"
                value={property?.acquisitionDate ? new Date(property.acquisitionDate).toLocaleDateString("fr-FR") : null}
              />
            </div>

            {/* ÉQUIPEMENTS */}
            <div className="mt-6">
              <p className="font-semibold text-gray-300 mb-2">Équipements</p>
              {property?.amenities && Object.keys(property.amenities).some(k => property.amenities[k]) ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(property.amenities)
                    .filter(([, v]) => v)
                    .map(([amenity]) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 rounded-2xl text-sm bg-[#0a1016]/70 border border-white/10 ring-1 ring-black/10 text-gray-100"
                      >
                        {amenity}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun</p>
              )}
            </div>
          </SectionLoader>
        </Panel>

        {/* --------- PANEL : Financier --------- */}
        <Panel show={activeTab === 'financial'}>
          <SectionLoader loading={false} error={null}>
            {property.financialInfo && Object.keys(property.financialInfo).length > 0 ? (
              <FinancialDataDisplay data={property.financialInfo} />
            ) : (
              <button
                onClick={goToFinancial}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-checkgreen transition"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </button>
            )}
          </SectionLoader>
        </Panel>

        {/* --------- PANEL : Factures --------- */}
        <Panel show={activeTab === 'bills'}>
          <SectionLoader loading={billsLoading} error={null}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Gestion des factures</h3>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
                title="Ajouter une facture"
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            </div>

            {/* Cartes résumé */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <GlassCard>
                <p className="text-xs uppercase tracking-wide text-gray-400">Total factures</p>
                <p className="mt-1 text-2xl font-bold text-white">{Number(totalBills || 0).toFixed(2)} €</p>
              </GlassCard>
              <GlassCard>
                <p className="text-xs uppercase tracking-wide text-gray-400">Travaux estimés</p>
                <p className="mt-1 text-2xl font-bold text-white">{Number(travauxEstimes || 0).toFixed(2)} €</p>
              </GlassCard>
              <GlassCard>
                <p className="text-xs uppercase tracking-wide text-gray-400">Budget restant</p>
                <p className="mt-1 text-2xl font-bold text-white">{Number(budgetRestant || 0).toFixed(2)} €</p>
              </GlassCard>
            </div>

            {/* Formulaire d'ajout (inline) */}
            <BillInlineForm onSubmit={addBill} />

            {/* Liste des factures */}
            {Array.isArray(bills) && bills.length > 0 ? (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <BillRow
                    key={bill.id || bill._id || bill.fileUrl}
                    bill={bill}
                    onDelete={() => deleteBill && deleteBill(bill.id || bill._id)}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="text-gray-400">Aucune facture pour le moment.</GlassCard>
            )}
          </SectionLoader>
        </Panel>

        {/* --------- PANEL : Locataire --------- */}
        <Panel show={activeTab === 'tenant'}>
          <SectionLoader loading={false} error={null}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Dossier locataire</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGoToTenant}
                  disabled={resolvingTenant}
                  className="px-4 py-2 rounded-3xl font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition disabled:opacity-60"
                  title="Gérer le dossier"
                >
                  {resolvingTenant ? 'Ouverture…' : 'Gérer'}
                </button>
                <button
                  onClick={() => navigate(`/locataire/new?property=${id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
                  title="Ajouter un locataire"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <GlassCard className="lg:col-span-2">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Identité & Contact</p>
                </div>
                <TenantTab ownerId={property.owner} active={activeTab === 'tenant'} />
              </GlassCard>

              <div className="space-y-3">
                <GlassCard>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Raccourcis</p>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickAction icon={<Phone className="w-4 h-4" />} label="Appeler" />
                    <QuickAction icon={<Mail className="w-4 h-4" />} label="Email" />
                    <QuickAction icon={<FileText className="w-4 h-4" />} label="Contrat" />
                    <QuickAction icon={<CalendarDays className="w-4 h-4" />} label="Échéances" />
                  </div>
                </GlassCard>

                <GlassCard>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Statut</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-2xl text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">Actif</span>
                    <span className="px-3 py-1 rounded-2xl text-xs bg-white/10 text-gray-200 border border-white/10">Vérifié</span>
                  </div>
                </GlassCard>
              </div>
            </div>
          </SectionLoader>
        </Panel>

        {/* --------- PANEL : Travaux --------- */}
        <Panel show={activeTab === 'works'}>
          <SectionLoader loading={false} error={null}>
            <WorkProgress propertyId={id} />
          </SectionLoader>
        </Panel>

        {/* --------- PANEL : Bail / Séjours --------- */}
        <Panel show={activeTab === 'lease'}>
          <SectionLoader loading={false} error={null}>
            {rentalKind === 'LCD' ? (
              <ShortStayPanel property={property} propertyId={id} />
            ) : (
              <LeasePanel
                property={property}
                propertyId={id}
                onOpenTenant={handleGoToTenant}
              />
            )}
          </SectionLoader>
        </Panel>
      </div>
    </div>
  );
}

/* === Petits composants réutilisés localement === */
function SpecTile({ icon, label, value }) {
  const display = value ?? "—";
  return (
    <div
      className={[
        "rounded-2xl p-3",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_-10px_rgba(0,0,0,0.6)]"
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide">
        <span className="text-gray-300/80">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-white font-medium">{display}</div>
    </div>
  );
}

function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-2xl p-3",
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

function BillInlineForm({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !file) return;
    if (!onSubmit) return;
    const form = new FormData();
    form.append('title', title);
    form.append('amount', amount);
    form.append('file', file);
    await onSubmit(form);
    setTitle(''); setAmount(''); setFile(null); setOpen(false);
  };

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-2xl font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition mb-3"
        >
          Ajouter une facture
        </button>
      ) : (
        <GlassCard className="p-4 mb-4">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-900/60 border border-white/10 rounded-xl text-white"
                placeholder="Ex. Facture EDF"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-900/60 border border-white/10 rounded-xl text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm">Document</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 text-gray-200 block"
                required
              />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setTitle(''); setAmount(''); setFile(null); }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-100 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen hover:from-checkgreen hover:to-greenLight shadow-md hover:shadow-lg transition"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </GlassCard>
      )}
    </>
  );
}

function BillRow({ bill, onDelete }) {
  const title = bill?.title || bill?.name || bill?.label || "Facture";
  const amount =
    typeof bill?.amount === "number" ? bill.amount :
    typeof bill?.total === "number"  ? bill.total  : null;
  const dateStr = bill?.date
    ? new Date(bill.date).toLocaleDateString("fr-FR")
    : (bill?.createdAt ? new Date(bill.createdAt).toLocaleDateString("fr-FR") : "—");

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-white font-medium">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">Émise le {dateStr}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {amount !== null ? `${Number(amount).toFixed(2)} €` : "—"}
          </p>
          {bill?.category && (
            <p className="text-xs text-gray-400 mt-0.5">{bill.category}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {bill?.fileUrl && (
            <a
              href={bill.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
              title="Voir la facture"
            >
              <Eye className="w-5 h-5 text-blue-400" />
            </a>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
            title="Supprimer la facture"
          >
            <Trash className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100 text-sm transition"
    >
      <span className="text-gray-300">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
