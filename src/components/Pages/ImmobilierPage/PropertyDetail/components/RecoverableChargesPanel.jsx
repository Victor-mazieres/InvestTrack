// src/pages/components/RecoverableChargesPanel.jsx
import React from "react";
import { Eye, Trash } from "lucide-react";
import  {api}  from "../../../../../api/api";
import PrimaryButton from "../../../../Reutilisable/PrimaryButton";

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

/**
 * Formulaire inline simple pour ajouter une facture catégorisée "charges_recuperables".
 * Si tu as déjà un BillInlineForm générique, tu peux le remplacer par un import.
 */
function InlineRecChargeForm({ onSubmit }) {
  const [title, setTitle]   = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate]     = React.useState("");
  const [file, setFile]     = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      // si fichier => FormData
      if (file) {
        const form = new FormData();
        form.append("title", title.trim());
        form.append("amount", amount || "");
        form.append("date", date || "");
        form.append("category", "charges_recuperables");
        form.append("file", file);
        await onSubmit(form, /* isFormData */ true);
      } else {
        await onSubmit(
          {
            title: title.trim(),
            amount: amount === "" ? null : Number(amount),
            date: date || null,
            category: "charges_recuperables",
          },
          /* isFormData */ false
        );
      }
      setTitle(""); setAmount(""); setDate(""); setFile(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input
          className="h-11 w-full rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="h-11 w-full rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
          placeholder="Montant (€)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="h-11 w-full rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
          placeholder="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-2 file:text-gray-100 hover:file:bg-white/10"
        />
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? "Ajout…" : "Ajouter"}
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

function Row({ bill, onDelete }) {
  const title = bill?.title || bill?.name || bill?.label || "Facture";
  const amount =
    typeof bill?.amount === "number" ? bill.amount :
    typeof bill?.total  === "number" ? bill.total  : null;
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

export default function RecoverableChargesPanel({
  propertyId,
  bills,
  loading,
  addBill,
  deleteBill,
}) {
  // onSubmit wrapper : accepte JSON ou FormData
  const onSubmit = async (payload, isFormData) => {
    if (isFormData) {
      // endpoint qui accepte form-data
      await api.post(`/api/properties/${propertyId}/bills`, payload);
    } else {
      await addBill({ ...payload, category: "charges_recuperables" });
    }
  };

  const filtered = (Array.isArray(bills) ? bills : []).filter(
    (b) => (b.category || "").toLowerCase() === "charges_recuperables"
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Factures des charges récupérables</h3>
      </div>

      <InlineRecChargeForm onSubmit={onSubmit} />

      {loading ? (
        <GlassCard className="mt-3 text-gray-400">Chargement…</GlassCard>
      ) : filtered.length > 0 ? (
        <div className="space-y-3 mt-3">
          {filtered.map((bill) => (
            <Row
              key={bill.id || bill._id || bill.fileUrl}
              bill={bill}
              onDelete={() => deleteBill && deleteBill(bill.id || bill._id)}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="text-gray-400 mt-3">Aucune facture de charges récupérables pour le moment.</GlassCard>
      )}
    </div>
  );
}
