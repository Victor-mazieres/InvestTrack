import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronRight, ArrowLeft, BarChart2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CalculationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [growthScenario, setGrowthScenario] = useState(0.02); // Taux de croissance (2 % par défaut)

  // Récupération des données
  const fetchSimulation = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
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
  }, [id]);

  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  // Extraction des résultats calculés
  const results = simulation?.results || {};
  const {
    totalMonthlyCost,
    totalInterest,
    totalInsuranceCost,
    grossYield,
    netYield,
    monthlyCashFlow,
    notaryFees,
  } = results;

  // Extraction des paramètres de prêt
  const {
    propertyPrice,
    personalContribution,
    loanFees,
    propertyTax,
    syndicFees,
    ownerInsuranceAmount,
    loanDuration,
    interestRate,
    insuranceRate,
  } = simulation || {};

  // Calculs complémentaires
  const monthlyPropertyTax = simulation?.propertyTax ? simulation.propertyTax / 12 : 0;
  const monthlyOwnerInsurance = ownerInsuranceAmount ? ownerInsuranceAmount / 12 : 0;

  // Projection de la rentabilité
  const projectionYears = [5, 10, 15, 20];

  // Calcul du cash flow cumulé (croissance composée) : CF cumulé = CF₀ * ((1+growth)^N - 1)/growth, CF₀ = monthlyCashFlow * 12
  const cashFlowNumbers = useMemo(() => {
    if (!Number.isFinite(monthlyCashFlow)) return [];
    return projectionYears.map(
      (year) =>
        monthlyCashFlow * 12 * (((1 + growthScenario) ** year - 1) / growthScenario)
    );
  }, [monthlyCashFlow, projectionYears, growthScenario]);

  // Calcul du crédit emprunté (principal) : montant emprunté = prix du bien - apport personnel
  const principal = useMemo(() => {
    return propertyPrice && personalContribution
      ? Number(propertyPrice) - Number(personalContribution)
      : 0;
  }, [propertyPrice, personalContribution]);

  // Taux mensuel d'intérêt (décimal)
  const monthlyInterestRate = useMemo(() => {
    return interestRate ? Number(interestRate) / 100 / 12 : 0;
  }, [interestRate]);

  // Nombre total de mois
  const totalMonths = useMemo(() => {
    return loanDuration ? Number(loanDuration) * 12 : 0;
  }, [loanDuration]);

  // Calcul du crédit restant après n mois : Solde = P * ((1+i)^N - (1+i)^(n)) / ((1+i)^N - 1)
  const creditRemainingNumbers = useMemo(() => {
    if (!principal || !monthlyInterestRate || !totalMonths) return [];
    return projectionYears.map((year) => {
      const n = year * 12;
      return principal * ((Math.pow(1 + monthlyInterestRate, totalMonths) - Math.pow(1 + monthlyInterestRate, n)) /
        (Math.pow(1 + monthlyInterestRate, totalMonths) - 1));
    });
  }, [principal, monthlyInterestRate, totalMonths, projectionYears]);

  // Pour le graphique : définir les bornes de l'axe Y
  const yMin = cashFlowNumbers.length > 0 ? Math.min(...cashFlowNumbers) : 0;
  const yMax = cashFlowNumbers.length > 0 ? Math.max(...cashFlowNumbers) : 0;
  const stepSize = cashFlowNumbers.length > 0 ? (yMax - yMin) / 3 : 0;

  // Données du graphique
  const chartData = useMemo(() => {
    return {
      labels: projectionYears.map((year) => `${year} ans`),
      datasets: [
        {
          label: "", // On supprime le label de la légende
          data: cashFlowNumbers,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          pointBackgroundColor: "rgba(16, 185, 129, 1)",
          tension: 0.3,
        },
      ],
    };
  }, [cashFlowNumbers, projectionYears]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Projection du Cash Flow cumulé",
          font: { size: 16 },
          color: "#fff",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = "";
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#fff", font: { size: 12 } },
          grid: { display: false },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            stepSize: stepSize,
            callback: (value) =>
              value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €",
            color: "#fff",
            font: { size: 12 },
          },
          grid: { display: false },
        },
      },
    };
  }, [yMin, yMax, stepSize]);

  const downloadPDF = useCallback(() => {
    if (!simulation) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "A4",
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(
      "Dossier de Demande de Prêt Immobilier",
      doc.internal.pageSize.getWidth() / 2,
      50,
      { align: "center" }
    );
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `Simulation ID : ${simulation.id}`,
      doc.internal.pageSize.getWidth() / 2,
      70,
      { align: "center" }
    );
    const rows = [
      ["Prix du bien", `${propertyPrice} €`],
      ["Apport personnel", `${personalContribution} €`],
      ["Frais de dossier", `${loanFees} €`],
      ["Taxe foncière annuelle", `${propertyTax} €`],
      ["Syndic (mensuel)", `${syndicFees} €`],
      ["Assurance PNO (annuelle)", `${ownerInsuranceAmount} €`],
      ["Durée du prêt", `${loanDuration} ans`],
      ["Taux d'intérêt annuel", `${interestRate} %`],
      ["Assurance emprunteur", `${insuranceRate} %`],
    ];
    autoTable(doc, {
      startY: 90,
      head: [["Libellé", "Valeur"]],
      body: rows,
      margin: { left: 40, right: 40 },
      headStyles: { fillColor: [200, 200, 200], textColor: 20, fontSize: 11, fontStyle: "bold" },
      bodyStyles: { fontSize: 10, textColor: 50 },
      theme: "grid",
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
  }, [
    simulation,
    propertyPrice,
    personalContribution,
    loanFees,
    propertyTax,
    syndicFees,
    ownerInsuranceAmount,
    loanDuration,
    interestRate,
    insuranceRate,
  ]);

  if (loading)
    return <p className="text-center text-gray-400">Chargement...</p>;
  if (!simulation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Simulation introuvable</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          aria-label="Retour"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <header className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow hover:bg-blue-700 transition"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Détails de la Simulation</h1>
      </header>

      {/* Section Paramètres du Prêt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-white">Paramètres du Prêt</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Prix du bien</span>
              <span className="font-medium text-greenLight">{propertyPrice} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Apport personnel</span>
              <span className="font-medium text-greenLight">{personalContribution} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Frais de dossier</span>
              <span className="font-medium text-greenLight">{loanFees} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taxe foncière</span>
              <span className="font-medium text-greenLight">{propertyTax} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Syndic (mensuel)</span>
              <span className="font-medium text-greenLight">{syndicFees} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Assurance PNO</span>
              <span className="font-medium text-greenLight">{ownerInsuranceAmount} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Durée du prêt</span>
              <span className="font-medium text-greenLight">{loanDuration} ans</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taux d'intérêt</span>
              <span className="font-medium text-greenLight">{interestRate} %</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Assurance emprunteur</span>
              <span className="font-medium text-greenLight">{insuranceRate} %</span>
            </div>
          </div>
        </div>

        {/* Section Résultats */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-gray-600">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b pb-2">Résultats</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Mensualités</h3>
              <p className="text-2xl font-bold text-greenLight">
                {Number.isFinite(totalMonthlyCost)
                  ? `${Math.round(totalMonthlyCost).toLocaleString("fr-FR")} € / mois`
                  : "—"}
              </p>
              <ul className="mt-2 text-sm text-gray-400 space-y-1">
                <li>
                  <span className="font-medium">Montant de l'emprunt :</span> {Math.round(propertyPrice).toLocaleString("fr-FR")} €
                </li>
                <li>
                  <span className="font-medium">Coût des intérêts :</span>{" "}
                  {Number.isFinite(totalInterest)
                    ? `${Math.round(totalInterest).toLocaleString("fr-FR")} €`
                    : "—"} <span className="text-xs">(sur {loanDuration} ans)</span>
                </li>
                <li>
                  <span className="font-medium">Coût de l'assurance :</span>{" "}
                  {Number.isFinite(totalInsuranceCost)
                    ? `${Math.round(totalInsuranceCost).toLocaleString("fr-FR")} €`
                    : "—"} <span className="text-xs">(simplifié)</span>
                </li>
                <li>
                  <span className="font-medium">Taxe foncière (mensuelle) :</span>{" "}
                  {Math.round(monthlyPropertyTax).toLocaleString("fr-FR")} €
                </li>
                <li>
                  <span className="font-medium">Syndic (mensuel) :</span>{" "}
                  {Math.round(syndicFees).toLocaleString("fr-FR")} €
                </li>
                <li>
                  <span className="font-medium">Assurance non occupant (mensuelle) :</span>{" "}
                  {Math.round(monthlyOwnerInsurance).toLocaleString("fr-FR")} €
                </li>
                <li>
                  <span className="font-medium">Frais de notaire :</span>{" "}
                  {Math.round(notaryFees).toLocaleString("fr-FR")} € <span className="text-xs">(8 %)</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Calcul de rentabilité</h3>
              <div className="mt-1 text-sm text-gray-200">
                <p>
                  <span className="font-medium">Rendement brut (%) :</span>{" "}
                  {Number.isFinite(grossYield)
                    ? `${grossYield.toFixed(2)} %`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">(Loyer annuel / Coût d'achat) x 100</p>
              </div>
              <div className="mt-2 text-sm text-gray-200">
                <p>
                  <span className="font-medium">Rendement net (%) :</span>{" "}
                  {Number.isFinite(netYield)
                    ? `${netYield.toFixed(2)} %`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">
                  [(Loyer annuel - Charges annuelles) / (Coût d'achat + Financement)] x 100
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-200">
                <p>
                  <span className="font-medium">Cash-flow mensuel :</span>{" "}
                  {Number.isFinite(monthlyCashFlow)
                    ? `${Math.round(monthlyCashFlow).toLocaleString("fr-FR")} € / mois`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">Loyer - (Mensualité + Charges)</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section Projection de la Rentabilité */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-gray-600 mt-8 relative">
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-greenLight rounded-full p-2"
            aria-label="Afficher/Masquer les statistiques"
          >
            <BarChart2 className="w-6 h-6 text-white" />
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b pb-2">Projection de la Rentabilité</h2>
        <p className="text-xs text-gray-400 mb-4">
          La projection du cash flow cumulé est calculée en supposant une croissance annuelle de 2 %. <br />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projectionYears.map((year, index) => (
            <div key={year} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-white">Sur {year} ans</h3>
              <p>
                <span className="font-medium">Cash Flow cumulé :</span>{" "}
                <span className="font-medium text-greenLight">
                  {Number.isFinite(monthlyCashFlow)
                    ? (
                        (monthlyCashFlow * 12 * ((1 + growthRate) ** year - 1)) / growthRate
                      ).toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                    : "—"}{" "}
                  €
                </span>
              </p>
              <p className="text-xs text-gray-400">
                <span className="font-medium">Crédit restant :</span>{" "}
                <span className="font-medium text-greenLight">
                  {Number.isFinite(propertyPrice) &&
                  Number.isFinite(personalContribution) &&
                  totalMonths > 0 &&
                  monthlyInterestRate > 0
                    ? (
                        (Number(propertyPrice) - Number(personalContribution)) *
                        ((Math.pow(1 + monthlyInterestRate, totalMonths) - Math.pow(1 + monthlyInterestRate, year * 12)) /
                          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1))
                      ).toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                    : "—"}{" "}
                  €
                </span>
              </p>
            </div>
          ))}
        </div>
        {showChart && (
          <div className="mt-4 h-64">
            <Suspense fallback={<p className="text-center text-gray-400">Chargement du graphique…</p>}>
              <Line data={chartData} options={chartOptions} />
            </Suspense>
          </div>
        )}
      </section>

      {/* Bouton pour générer le PDF */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={downloadPDF}
          className="flex items-center space-x-2 bg-greenLight text-white px-6 py-3 rounded-xl font-bold transition hover:bg-green-500"
          aria-label="Télécharger le PDF"
        >
          <span>Générer PDF</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const growthRate = 0.02;

const chartData = {
  labels: [5, 10, 15, 20].map((year) => `${year} ans`),
  datasets: [
    {
      label: "", // Supprime le label
      data: [5, 10, 15, 20].map((year) =>
        1000 * 12 * (((1 + growthRate) ** year - 1) / growthRate)
      ),
      borderColor: "rgba(16, 185, 129, 1)",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      pointBackgroundColor: "rgba(16, 185, 129, 1)",
      tension: 0.3,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Supprime la légende
    },
    title: {
      display: true,
      text: "Projection du Cash Flow cumulé",
      font: { size: 16 },
      color: "#fff",
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = "";
          if (context.parsed.y !== null) {
            label += context.parsed.y.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#fff", font: { size: 12 } },
      grid: { display: false },
    },
    y: {
      min: 0,
      max: 10000, // Ajustez en fonction de vos données réelles
      ticks: {
        stepSize: 10000 / 3,
        callback: (value) =>
          value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €",
        color: "#fff",
        font: { size: 12 },
      },
      grid: { display: false },
    },
  },
};

export default CalculationDetails;
