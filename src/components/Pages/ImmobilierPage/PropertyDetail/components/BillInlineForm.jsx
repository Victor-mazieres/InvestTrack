// src/pages/PropertyDetail/components/BillInlineForm.jsx
import React, { useState } from "react";
import PrimaryButton from "../../../../Reutilisable/PrimaryButton"; // ajuste le chemin si besoin

function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-2xl p-3",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_22px_-12px_rgba(0,0,0,0.65)]",
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
        "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-black/30",
        className,
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_65%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function BillInlineForm({ onSubmit, className = "" }) {
  const [open, setOpen]   = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile]   = useState(null);
  const [busy, setBusy]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !file || !onSubmit) return;
    const form = new FormData();
    form.append("title", title);
    form.append("amount", amount);
    form.append("file", file);

    try {
      setBusy(true);
      await onSubmit(form);
      setTitle(""); setAmount(""); setFile(null); setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <PrimaryButton onClick={() => setOpen(true)} className={["mb-3", className].join(" ")}>
        Ajouter une facture
      </PrimaryButton>
    );
  }

  return (
    <GlassCard className={["p-4 mb-4", className].join(" ")}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            onClick={() => { setOpen(false); setTitle(""); setAmount(""); setFile(null); }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-gray-100 transition"
          >
            Annuler
          </button>

          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </PrimaryButton>
        </div>
      </form>
    </GlassCard>
  );
}
