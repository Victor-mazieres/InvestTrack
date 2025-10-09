// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialDataDisplay.jsx
import React from "react";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";

/* ---------- Format monétaire ---------- */
function fmt(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function money(n) {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(v)) return "—";
  return v.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

const signClass = (v) =>
  (typeof v === "number" ? v : parseFloat(v)) >= 0
    ? "text-emerald-400"
    : "text-red-400";

/* ---------- Toutes les sections (inchangées) ---------- */
const sections = [
  {
    title: "Détails du Prêt",
    items: [
      { label: "Montant emprunté", key: "emprunt" },
      { label: "Mensualité", key: "mensualite" },
    ],
  },
  {
    title: "Charges & Taxes",
    items: [
      { label: "Taxe foncière", key: "taxeFonciere" },
      { label: "Charges copropriété", key: "chargesCopro" },
      { label: "Assurance PNO", key: "assurancePno" },
      { label: "Charges récupérables", key: "chargeRecup" },
      { label: "Total sorties", key: "totalSorties" },
    ],
  },
  {
    title: "Flux Locatifs",
    items: [
      { label: "Loyer HC", key: "loyerHc" },
      { label: "Charges locataire", key: "chargesLoc" },
      { label: "Total CC", key: "totalCc" },
    ],
  },
  {
    title: "Impôts",
    items: [
      { label: "Impôt mensuel", key: "impotMensuel" },
      { label: "Impôt annuel total", key: "impotAnnuel" },
    ],
  },
  {
    title: "Cash Flow & Intérêts",
    items: [
      { label: "Cash flow / mois", key: "cfMensuel" },
      { label: "Cash flow / an", key: "cfAnnuel" },
      { label: "Cash flow total", key: "cfTotal" },
      { label: "Cash flow net net / mois", key: "cfNetNetMensuel" },
      { label: "Cash flow net net / an", key: "cfNetNetAnnuel" },
      { label: "Cash flow net net total", key: "cfNetNetTotal" },
      { label: "Total intérêts", key: "interets" },
    ],
  },
];

/* ---------- Sous-composants UI ---------- */
function GlassCard({ title, children }) {
  return (
    <div
      className={[
        "rounded-2xl p-5",
        "bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-12px_rgba(0,0,0,0.6)]",
        "transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-greenLight border-b border-white/10 pb-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function StatLine({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100">{fmt(value)}</span>
    </div>
  );
}

/* ---------- Composant principal ---------- */
export default function FinancialDataDisplay({ data, results }) {
  const pdfData = { ...data, ...results };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text("Rapport Financier", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);

    sections.forEach((sec) => {
      doc.text(sec.title, 14, y);
      y += 6;
      sec.items.forEach((item) => {
        const value = fmt(pdfData[item.key]);
        doc.text(`${item.label}: ${value}`, 20, y);
        y += 6;
      });
      y += 4;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save("rapport_financier.pdf");
  };

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => (
          <GlassCard key={i} title={sec.title}>
            {/* Cas spécifique pour Cash Flow & Intérêts */}
            {sec.title === "Cash Flow & Intérêts" ? (
              <>
                <p className="text-sm text-gray-400 mb-2 italic">Avant impôt</p>

                {sec.items.slice(0, 3).map((it, j) => (
                  <StatLine
                    key={j}
                    label={it.label}
                    value={
                      (data && data[it.key]) ?? (results && results[it.key])
                    }
                  />
                ))}

                <p className="text-sm text-gray-400 mt-4 mb-2 italic">
                  Après impôt
                </p>

                {sec.items.slice(3, 6).map((it, j) => (
                  <StatLine
                    key={j}
                    label={it.label}
                    value={
                      (data && data[it.key]) ?? (results && results[it.key])
                    }
                  />
                ))}

                <div className="border-t border-white/10 my-3" />

                <StatLine
                  label="Total intérêts"
                  value={
                    (data && data.interets) ?? (results && results.interets)
                  }
                />
              </>
            ) : (
              // Autres sections (inchangées)
              <div className="space-y-2">
                {sec.items.map((it, j) => (
                  <StatLine
                    key={j}
                    label={it.label}
                    value={
                      (data && data[it.key]) ?? (results && results[it.key])
                    }
                  />
                ))}
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Bouton Export PDF */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleExportPdf}
          className="group flex items-center gap-2 px-6 py-3 rounded-3xl font-semibold text-white bg-gradient-to-b from-greenLight to-checkgreen shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg transition"
        >
          <FileDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Exporter le rapport PDF</span>
        </button>
      </div>
    </div>
  );
}
