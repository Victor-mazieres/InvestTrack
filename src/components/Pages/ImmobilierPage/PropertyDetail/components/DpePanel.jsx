// src/pages/components/DpePanel.jsx
import React, { useState } from "react";
import PrimaryButton from "../.././../../Reutilisable/PrimaryButton";
import  {api}  from "../../../../../api/api";

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

export default function DpePanel({ propertyId, initialDpe }) {
  const [classe, setClasse] = useState(initialDpe?.class || "");
  const [conso, setConso]   = useState(initialDpe?.consumption ?? "");
  const [ges, setGes]       = useState(initialDpe?.ges ?? "");
  const [file, setFile]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (file) {
        const form = new FormData();
        form.append("class", classe);
        form.append("consumption", conso);
        form.append("ges", ges);
        form.append("file", file);
        await api.post(`/api/properties/${propertyId}/dpe`, form);
      } else {
        await api.put(`/api/properties/${propertyId}/dpe`, {
          class: classe || null,
          consumption: conso === "" ? null : Number(conso),
          ges: ges === "" ? null : Number(ges),
        });
      }
      setMsg({ tone: "ok", text: "DPE enregistré." });
    } catch (e) {
      console.error(e);
      setMsg({ tone: "err", text: "Erreur lors de l’enregistrement du DPE." });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2500);
    }
  };

  return (
    <div className="space-y-3">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-white">Diagnostic de performance énergétique (DPE)</h3>
        <p className="text-xs text-gray-400 mt-1">
          Renseigne la <b>classe</b>, la <b>consommation</b> (kWh/m²/an) et le <b>GES</b> (kgCO₂/m²/an). Tu peux joindre le fichier PDF/scan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Classe</p>
          <select
            value={classe}
            onChange={(e) => setClasse(e.target.value)}
            className="w-full h-11 rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
          >
            <option value="">—</option>
            {["A", "B", "C", "D", "E", "F", "G"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Conso (kWh/m²/an)</p>
          <input
            type="number"
            value={conso}
            onChange={(e) => setConso(e.target.value)}
            className="w-full h-11 rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
            placeholder="Ex: 185"
          />
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">GES (kgCO₂/m²/an)</p>
          <input
            type="number"
            value={ges}
            onChange={(e) => setGes(e.target.value)}
            className="w-full h-11 rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
            placeholder="Ex: 37"
          />
        </GlassCard>
      </div>

      <GlassCard>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Fichier DPE (PDF ou image)</p>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-2 file:text-gray-100 hover:file:bg-white/10"
        />
        {initialDpe?.fileUrl && (
          <a
            href={initialDpe.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-greenLight hover:underline"
          >
            Voir le DPE existant
          </a>
        )}
      </GlassCard>

      <div className="flex items-center gap-3">
        <PrimaryButton onClick={onSave} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer le DPE"}
        </PrimaryButton>
        {msg && (
          <span
            className={[
              "px-2 py-1 rounded-md border text-sm",
              msg.tone === "ok"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                : "bg-red-500/15 text-red-300 border-red-500/20",
            ].join(" ")}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
