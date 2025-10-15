// src/pages/PropertyDetail.jsx
import React, { useMemo, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Plus, ArrowLeft, Eye, Trash,
  MapPin, Building2, Home, Hash, Layers, DoorOpen, User2,
  CalendarDays, Ruler, Phone, Mail, FileText, DollarSign, Receipt, Hammer, Gauge
} from 'lucide-react';

import DonutChart                  from './components/DonutChart';
import FinancialDataDisplay        from './FinancialInfo/FinancialDataDisplay';
import FinancialDataDisplayShort   from './FinancialInfo/FinancialDataDisplayShort';
import PhotoCarousel               from './components/PhotoCarousel';
import SectionLoader               from './components/SectionLoader';
import { Loader }                  from './components/Loader';
import TenantTab                   from './components/TenantTab';
import PrimaryButton               from "../../../Reutilisable/PrimaryButton";
import BillInlineForm              from './components/BillInlineForm';

import DpePanel                    from './components/DpePanel';
import RecoverableChargesPanel     from './components/RecoverableChargesPanel';

import { useProperty }   from './hooks/useProperty';
import { useBills }      from './hooks/useBills';
import { useFinancials } from './hooks/useFinancials';
import { usePhotos }     from './hooks/usePhotos';
import { api }           from '../../../../api/api';

// Lazy heavy panels
const WorkProgress   = React.lazy(() => import('./components/WorkProgress'));
const LeasePanel     = React.lazy(() => import('./components/LeaseAndRents'));
const ShortStayPanel = React.lazy(() => import('./components/ShortStayPanel'));

/* ===========================
   UI: Tile & Panel
   =========================== */
function TileButton({ idFor, label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-controls={idFor}
      role="tab"
      className={[
        "group relative aspect-square w-full rounded-2xl p-4",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_22px_-12px_rgba(0,0,0,0.65)]",
        active ? "outline outline-2 outline-checkgreen/40" : "hover:bg-white/5",
        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-greenLight/60"
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

function Panel({ id, show, children }) {
  return (
    <div id={id} role="region" aria-hidden={!show} className="col-span-2">
      <div className={`transition-all ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} duration-200`}>
        {show && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-[#0a1016]/60 p-4 ring-1 ring-black/10">
            {children}
          </div>
        )}
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

  // Charge la propriété (inclut désormais financialLld et/ou financialCld)
  const { property, loading: propLoading, error: propErr } = useProperty(id);

  // Factures & photos
  const { bills, loading: billsLoading, deleteBill, addBill } = useBills(id);
  const { photos, loading: photosLoading, addPhoto, deletePhoto } = usePhotos(id);

  // Détermine le type (LLD/LCD/AV)
  const rentalKind = useMemo(() => {
    const rk = String(property?.rentalKind || '').toUpperCase();
    if (rk === 'LLD' || rk === 'LCD' || rk === 'AV') return rk;
    const mode = String(property?.mode || '').toLowerCase();
    const rs   = String(property?.rentalStrategy || '').toLowerCase();
    if (mode === 'achat_revente') return 'AV';
    if (mode === 'location') return rs === 'short_term' ? 'LCD' : 'LLD';
    return 'LLD';
  }, [property]);

  // Sélectionne la bonne source financière selon le type
  const finData = useMemo(() => {
    if (!property) return null;
    if (rentalKind === 'LCD') return property.financialCld || property.financialLcd || null;
    if (rentalKind === 'LLD') return property.financialLld || null;
    return null;
  }, [property, rentalKind]);

  // Agrégats pour le donut
  const { totalBills, travauxEstimes, budgetRestant, pieData } =
    useFinancials(finData, bills);

  const [activeTab, setActiveTab] = useState(null);
  const [resolvingTenant, setResolvingTenant] = useState(false);
  const [tenantResolveError, setTenantResolveError] = useState(null);

  const looksNumeric = (v) => /^\d+$/.test(String(v ?? '').trim());

  const tryGet = async (p) => {
    try { return await api.get(p); } catch { return null; }
  };

  const resolveTenantIdAsync = async (p) => {
    if (!p) return null;
    if (p.tenantId)               return String(p.tenantId);
    if (p.tenant && p.tenant.id)  return String(p.tenant.id);
    if (p.ownerId)                return String(p.ownerId);
    if (p.tenantUserId)           return String(p.tenantUserId);
    if (p.owner && typeof p.owner === 'object' && (p.owner.id || p.owner._id)) {
      return String(p.owner.id || p.owner._id);
    }
    if (looksNumeric(p.owner)) {
      const r1 = await tryGet(`/api/tenants/${p.owner}`);
      if (r1?.id || r1?._id) return String(r1.id || r1._id);
      const r2 = await tryGet(`/api/tenants?userId=${p.owner}`);
      const t  = Array.isArray(r2) ? r2[0] : null;
      if (t?.id || t?._id) return String(t.id || t._id);
    }
    const all = await tryGet(`/api/tenants`);
    if (Array.isArray(all)) {
      const hintEmail = p.ownerEmail || p.email || null;
      const hintName  = p.ownerName  || p.name  || null;
      if (hintEmail) {
        const found = all.find(t => (t.email || '').toLowerCase() === String(hintEmail).toLowerCase());
        if (found?.id || found?._id) return String(found.id || found._id);
      }
      if (hintName) {
        const key = String(hintName).toLowerCase();
        const found = all.find(t => `${t.name ?? ''} ${t.firstName ?? ''}`.toLowerCase().includes(key));
        if (found?.id || found?._id) return String(found.id || found._id);
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

  const goToFinancial = () => {
    if (rentalKind === 'LCD')      navigate(`/properties/${id}/financial-short?mode=LCD`);
    else if (rentalKind === 'AV')  navigate(`/properties/${id}/financial-sell?mode=AV`);
    else                           navigate(`/properties/${id}/financial?mode=LLD`);
  };

  if (propErr)                  return <div className="p-6 text-red-500">{propErr}</div>;
  if (propLoading || !property) return <Loader />;

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

      {/* Grille de tuiles */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <TileButton
          idFor="panel-location"
          label="Location"
          icon={<MapPin className="w-7 h-7" />}
          active={activeTab === 'location'}
          onClick={() => setActiveTab(t => (t === 'location' ? null : 'location'))}
        />
        <TileButton
          idFor="panel-financial"
          label="Financier"
          icon={<DollarSign className="w-7 h-7" />}
          active={activeTab === 'financial'}
          onClick={() => setActiveTab(t => (t === 'financial' ? null : 'financial'))}
        />
        <TileButton
          idFor="panel-bills"
          label="Factures"
          icon={<Receipt className="w-7 h-7" />}
          active={activeTab === 'bills'}
          onClick={() => setActiveTab(t => (t === 'bills' ? null : 'bills'))}
        />
        <TileButton
          idFor="panel-tenant"
          label="Locataire"
          icon={<User2 className="w-7 h-7" />}
          active={activeTab === 'tenant'}
          onClick={() => setActiveTab(t => (t === 'tenant' ? null : 'tenant'))}
        />
        <TileButton
          idFor="panel-works"
          label="Travaux"
          icon={<Hammer className="w-7 h-7" />}
          active={activeTab === 'works'}
          onClick={() => setActiveTab(t => (t === 'works' ? null : 'works'))}
        />
        <TileButton
          idFor="panel-lease"
          label={rentalKind === 'LCD' ? "Séjours & Paiements" : "Bail & Loyers"}
          icon={<FileText className="w-7 h-7" />}
          active={activeTab === 'lease'}
          onClick={() => setActiveTab(t => (t === 'lease' ? null : 'lease'))}
        />

        {/* Nouvelle tuile DPE */}
        <TileButton
          idFor="panel-dpe"
          label="DPE"
          icon={<Gauge className="w-7 h-7" />}
          active={activeTab === 'dpe'}
          onClick={() => setActiveTab(t => (t === 'dpe' ? null : 'dpe'))}
        />

        {/* Nouvelle tuile Charges récupérables */}
        <TileButton
          idFor="panel-rec-charges"
          label="Charges récupérables"
          icon={<Receipt className="w-7 h-7" />}
          active={activeTab === 'rec-charges'}
          onClick={() => setActiveTab(t => (t === 'rec-charges' ? null : 'rec-charges'))}
        />

        {/* Panel: Location */}
        <Panel id="panel-location" show={activeTab === 'location'}>
          <SectionLoader loading={false} error={null}>
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

        {/* Panel: Financier */}
        <Panel id="panel-financial" show={activeTab === 'financial'}>
          <SectionLoader loading={false} error={null}>
            {finData && Object.keys(finData).length > 0 ? (
              rentalKind === 'LCD' ? (
                <FinancialDataDisplayShort data={finData} results={finData} />
              ) : rentalKind === 'AV' ? (
                <div className="space-y-3">
                  <GlassCard>
                    <p className="text-sm text-gray-300">
                      Ce bien est en mode <b>achat / revente</b>. Consulte l’analyse dédiée.
                    </p>
                  </GlassCard>
                  <button
                    onClick={() => navigate(`/properties/${id}/financial-sell?mode=AV`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                    Ouvrir l’analyse revente
                  </button>
                </div>
              ) : (
                <FinancialDataDisplay data={finData} results={finData} />
              )
            ) : (
              <PrimaryButton onClick={goToFinancial} icon={Plus}>
                Ajouter
              </PrimaryButton>
            )}
          </SectionLoader>
        </Panel>

        {/* Panel: Factures */}
        <Panel id="panel-bills" show={activeTab === 'bills'}>
          <SectionLoader loading={billsLoading} error={null}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Gestion des factures</h3>
            </div>

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

            {/* Formulaire inline générique */}
            <BillInlineForm onSubmit={addBill} />

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

        {/* Panel: Locataire */}
        <Panel id="panel-tenant" show={activeTab === 'tenant'}>
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
                <PrimaryButton
                  onClick={() => navigate(`/locataire/new?property=${id}`)}
                  icon={Plus}
                  title="Ajouter un locataire"
                >
                  Ajouter
                </PrimaryButton>
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

        {/* Panel: DPE (NOUVEAU) */}
        <Panel id="panel-dpe" show={activeTab === 'dpe'}>
          <SectionLoader loading={false} error={null}>
            <DpePanel propertyId={id} initialDpe={property?.dpe || null} />
          </SectionLoader>
        </Panel>

        {/* Panel: Charges récupérables (NOUVEAU) */}
        <Panel id="panel-rec-charges" show={activeTab === 'rec-charges'}>
          <SectionLoader loading={billsLoading} error={null}>
            <RecoverableChargesPanel
              propertyId={id}
              bills={bills}
              loading={billsLoading}
              addBill={addBill}
              deleteBill={deleteBill}
            />
          </SectionLoader>
        </Panel>

        {/* Panel: Travaux */}
        <Panel id="panel-works" show={activeTab === 'works'}>
          <SectionLoader loading={false} error={null}>
            <Suspense fallback={<SectionLoader loading={true} error={null} />}>
              <WorkProgress propertyId={id} />
            </Suspense>
          </SectionLoader>
        </Panel>

        {/* Panel: Bail / Séjours */}
        <Panel id="panel-lease" show={activeTab === 'lease'}>
          <SectionLoader loading={false} error={null}>
            <Suspense fallback={<SectionLoader loading={true} error={null} />}>
              {rentalKind === 'LCD' ? (
                <ShortStayPanel property={property} propertyId={id} />
              ) : (
                <LeasePanel property={property} propertyId={id} onOpenTenant={handleGoToTenant} />
              )}
            </Suspense>
          </SectionLoader>
        </Panel>
      </div>
    </div>
  );
}

/* === Petits composants réutilisés === */
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
