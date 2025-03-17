// CalculationDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronRight, ArrowLeft } from "lucide-react";

const CalculationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSimulation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/simulations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSimulation(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la simulation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [id]);

  const downloadPDF = () => {
    if (!simulation) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "A4"
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Dossier de Demande de Prêt Immobilier", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Simulation ID : ${simulation.id}`, doc.internal.pageSize.getWidth() / 2, 70, { align: "center" });
    const rows = [
      ["Prix du bien", `${simulation.propertyPrice} €`],
      ["Apport personnel", `${simulation.personalContribution} €`],
      ["Frais de dossier", `${simulation.loanFees} €`],
      ["Taxe foncière annuelle", `${simulation.propertyTax} €`],
      ["Syndic (mensuel)", `${simulation.syndicFees} €`],
      ["Assurance PNO (annuelle)", `${simulation.ownerInsuranceAmount} €`],
      ["Durée du prêt", `${simulation.loanDuration} ans`],
      ["Taux d'intérêt annuel", `${simulation.interestRate} %`],
      ["Assurance emprunteur", `${simulation.insuranceRate} %`]
    ];
    autoTable(doc, {
      startY: 90,
      head: [["Libellé", "Valeur"]],
      body: rows,
      margin: { left: 40, right: 40 },
      headStyles: { fillColor: [200, 200, 200], textColor: 20, fontSize: 11, fontStyle: "bold" },
      bodyStyles: { fontSize: 10, textColor: 50 },
      theme: "grid"
    });
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "Document généré automatiquement à partir de votre calculateur.\nPour toute question ou modification, contactez-nous.",
      40,
      finalY
    );
    doc.save(`demande_pret_${simulation.id || "details"}.pdf`);
  };

  if (loading) return <p>Chargement...</p>;
  if (!simulation) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Simulation introuvable</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header intégré */}
      <header className="flex items-center mb-4 px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition">
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Détails de la Simulation</h1>
      </header>
      {/* Contenu principal */}
      <main className="flex-1 px-4 py-6 overflow-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Prix du bien</span>
              <span className="text-gray-900 font-semibold">{simulation.propertyPrice} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Apport personnel</span>
              <span className="text-gray-900 font-semibold">{simulation.personalContribution} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Frais de dossier</span>
              <span className="text-gray-900 font-semibold">{simulation.loanFees} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Taxe foncière annuelle</span>
              <span className="text-gray-900 font-semibold">{simulation.propertyTax} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Syndic (mensuel)</span>
              <span className="text-gray-900 font-semibold">{simulation.syndicFees} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Assurance PNO (annuelle)</span>
              <span className="text-gray-900 font-semibold">{simulation.ownerInsuranceAmount} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Durée du prêt</span>
              <span className="text-gray-900 font-semibold">{simulation.loanDuration} ans</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Taux d'intérêt annuel</span>
              <span className="text-gray-900 font-semibold">{simulation.interestRate} %</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Assurance emprunteur</span>
              <span className="text-gray-900 font-semibold">{simulation.insuranceRate} %</span>
            </div>
          </div>
        </div>
      </main>
      {/* Pied de page avec boutons */}
      <footer className="flex-none px-4 py-4 bg-white shadow">
        <div className="flex justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 bg-blue-500 text-white w-full p-3 rounded-xl font-bold transition">
            <span>Retour</span>
            <ChevronRight className="text-white" />
          </button>
          <button onClick={downloadPDF} className="flex items-center space-x-2 bg-green-500 text-white w-full p-3 rounded-xl font-bold transition ml-4">
            <span>PDF</span>
            <ChevronRight className="text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CalculationDetails;
