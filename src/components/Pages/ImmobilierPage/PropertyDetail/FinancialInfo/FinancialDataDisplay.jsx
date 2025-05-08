// src/components/Pages/ImmobilierPage/PropertyDetail/FinancialDataDisplay.jsx
import React from 'react';
import jsPDF from 'jspdf';

function fmt(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' €';
}

const sections = [
  {
    title: 'Détails du Prêt',
    items: [
      { label: 'Montant emprunté', key: 'emprunt' },
      { label: 'Mensualité',      key: 'mensualite' },
    ],
  },
  {
    title: 'Charges & Taxes',
    items: [
      { label: 'Taxe foncière',        key: 'taxeFonciere' },
      { label: 'Charges copropriété',  key: 'chargesCopro' },
      { label: 'Assurance PNO',        key: 'assurancePno' },
      { label: 'Charges récupérables', key: 'chargeRecup' },
      { label: 'Total sorties',        key: 'totalSorties' },
    ],
  },
  {
    title: 'Flux Locatifs',
    items: [
      { label: 'Loyer HC',            key: 'loyerHc' },
      { label: 'Charges locataire',   key: 'chargesLoc' },
      { label: 'Total CC',            key: 'totalCc' },
    ],
  },
  {
    title: 'Impôts',
    items: [
      { label: 'Impôt mensuel',       key: 'impotMensuel' },
      { label: 'Impôt annuel total',  key: 'impotAnnuel' },
    ],
  },
  {
    title: 'Cash Flow & Intérêts',
    items: [
      { label: 'Cash flow / mois',         key: 'cfMensuel' },
      { label: 'Cash flow / an',           key: 'cfAnnuel' },
      { label: 'Cash flow total',          key: 'cfTotal' },
      { label: 'Cash flow net net / mois', key: 'cfNetNetMensuel' },
      { label: 'Cash flow net net / an',   key: 'cfNetNetAnnuel' },
      { label: 'Cash flow net net total',  key: 'cfNetNetTotal' },
      { label: 'Total intérêts',           key: 'interets' },
    ],
  },
];

export default function FinancialDataDisplay({ data, results }) {

  const pdfData = { ...data, ...results };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text('Rapport Financier', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);

    sections.forEach(sec => {
      doc.text(sec.title, 14, y);
      y += 6;
      sec.items.forEach(item => {
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

    doc.save('rapport_financier.pdf');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => (
          <div key={i} className="bg-gray-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-greenLight">{sec.title}</h3>
            <div className="space-y-3">
              {sec.items.map((it, j) => (
                <div key={j} className="flex justify-between">
                  <span className="text-gray-300">{it.label}</span>
                  <span className="font-medium text-white">
                    {fmt(pdfData[it.key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={handleExportPdf}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
        >
          Exporter en PDF
        </button>
      </div>
    </div>
  );
}
