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
  Filler, // Importation du plugin Filler
} from "chart.js";

// Enregistrement du plugin Filler (nécessaire pour l'option fill)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CalculationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [growthScenario, setGrowthScenario] = useState(0.02); // 2% par défaut

  // Récupération des données depuis l'API
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

  // Extraction des paramètres de prêt issus de la simulation
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
    renovationCosts,
    renovationPaidByPocket,
    monthlyRent,
    monthlyCharges,
    syndicPeriod,
    ownerInsurancePeriod,
  } = simulation || {};

  // Calcul complémentaires
  const monthlyPropertyTax = propertyTax ? propertyTax / 12 : 0;
  const monthlyOwnerInsurance = ownerInsuranceAmount ? ownerInsuranceAmount / 12 : 0;

  // Calcul du montant emprunté (en tenant compte des travaux si non payés de poche)
  const netLoanAmount = useMemo(() => {
    const numPropertyPrice = propertyPrice ? Number(propertyPrice) : 0;
    const numPersonalContribution = personalContribution ? Number(personalContribution) : 0;
    const numRenovationCosts = renovationCosts ? Number(renovationCosts) : 0;
    const extraCosts = renovationPaidByPocket ? 0 : numRenovationCosts;
    return numPropertyPrice + extraCosts - numPersonalContribution;
  }, [propertyPrice, personalContribution, renovationCosts, renovationPaidByPocket]);

  // Périodes de projection pour 5, 10, 15 et 20 ans
  const projectionYears = [5, 10, 15, 20];

  // Calcul du cash flow cumulé pour chaque intervalle
  // CF cumulé = monthlyCashFlow * 12 * (((1 + growth)^n - 1) / growth)
  const cashFlowNumbers = useMemo(() => {
    if (!Number.isFinite(monthlyCashFlow)) return [];
    return projectionYears.map(
      (year) =>
        monthlyCashFlow * 12 * (((1 + growthScenario) ** year - 1) / growthScenario)
    );
  }, [monthlyCashFlow, projectionYears, growthScenario]);

  // Taux mensuel d'intérêt
  const monthlyInterestRate = useMemo(() => {
    return interestRate ? Number(interestRate) / 100 / 12 : 0;
  }, [interestRate]);

  const totalMonths = useMemo(() => (loanDuration ? Number(loanDuration) * 12 : 0), [loanDuration]);

  // Calcul du crédit restant pour chaque intervalle
  const creditRemainingNumbers = useMemo(() => {
    if (!netLoanAmount || !monthlyInterestRate || !totalMonths) return [];
    return projectionYears.map((year) => {
      const n = year * 12;
      return netLoanAmount * (
        (Math.pow(1 + monthlyInterestRate, totalMonths) - Math.pow(1 + monthlyInterestRate, n)) /
        (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
      );
    });
  }, [netLoanAmount, monthlyInterestRate, totalMonths, projectionYears]);

  // Calcul dynamique de la limite supérieure des ordonnées basée sur le cash flow cumulé
  const maxCF = cashFlowNumbers.length > 0 ? Math.max(...cashFlowNumbers) : 1;
  const dynamicYMax = Math.ceil(maxCF * 1.1);

  // Création d'un tableau de ticks personnalisés pour l'axe des ordonnées
  const customTicks = useMemo(
    () =>
      cashFlowNumbers.map((v) => ({
        value: v,
        label: v >= 1000 ? (v / 1000).toFixed(1) + "K €" : v.toFixed(2) + " €",
      })),
    [cashFlowNumbers]
  );

  // Configuration du graphique : on affiche les 4 points correspondant aux valeurs calculées
  const chartData = useMemo(() => ({
    labels: projectionYears.map((year) => `${year} ans`),
    datasets: [
      {
        label: "", // Pas de label pour éviter le rectangle de légende
        data: cashFlowNumbers,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        tension: 0.4,
        borderWidth: 2,
        fill: true,
      },
    ],
  }), [cashFlowNumbers, projectionYears]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.parsed.y;
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K €";
            }
            return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: dynamicYMax,
        // Utilisation de afterBuildTicks pour forcer les ticks personnalisés
        afterBuildTicks: (scale) => {
          scale.ticks = customTicks;
        },
        ticks: {
          // On retourne ici les labels définis dans nos objets customTicks
          callback: (tick, index, ticks) => {
            return customTicks[index] ? customTicks[index].label : "";
          },
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  }), [dynamicYMax, customTicks]);

  // Pour éviter le problème "Canvas is already in use", on passe une clé au composant Chart qui dépend de chartData
  const chartKey = useMemo(() => JSON.stringify(chartData), [chartData]);

  const downloadPDF = useCallback(() => {
    if (!simulation) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Dossier de Demande de Prêt Immobilier", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Simulation ID : ${simulation.id}`, doc.internal.pageSize.getWidth() / 2, 70, { align: "center" });
    const rows = [
      ["Prix du bien", `${propertyPrice} €`],
      renovationCosts !== undefined
        ? ["Travaux", `${renovationCosts} € ${renovationPaidByPocket ? "(payés de ma poche)" : ""}`]
        : null,
      ["Apport personnel", `${personalContribution} €`],
      ["Frais de dossier", `${loanFees} €`],
      ["Taxe foncière annuelle", `${propertyTax} €`],
      ["Syndic (" + (syndicPeriod || "mensuel") + ")", `${syndicFees} €`],
      ["Assurance PNO (" + (ownerInsurancePeriod || "annuel") + ")", `${ownerInsuranceAmount} €`],
      ["Durée du prêt", `${loanDuration} ans`],
      [`Taux d'intérêt annuel`, `${interestRate} %`],
      ["Assurance emprunteur", `${insuranceRate} %`],
    ].filter(Boolean);

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
    doc.text("Document généré automatiquement à partir de votre calculateur.\nPour toute question ou modification, contactez-nous.", 40, finalY);
    doc.save(`demande_pret_${simulation.id || "details"}.pdf`);
  }, [
    simulation,
    propertyPrice,
    renovationCosts,
    renovationPaidByPocket,
    personalContribution,
    loanFees,
    propertyTax,
    syndicFees,
    ownerInsuranceAmount,
    loanDuration,
    interestRate,
    insuranceRate,
    syndicPeriod,
    ownerInsurancePeriod,
  ]);

  if (loading)
    return <p className="text-center text-gray-400">Chargement...</p>;
  if (!simulation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Simulation introuvable</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-checkgreen transition"
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
          className="p-2 bg-gray-800 rounded-full shadow hover:bg-checkgreen transition"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Détails de la Simulation</h1>
      </header>

      {/* Paramètres du Prêt + Résultats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paramètres du Prêt */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-white">Paramètres du Prêt</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Prix du bien</span>
              <span className="font-medium text-greenLight">{propertyPrice} €</span>
            </div>
            {renovationCosts !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium">Travaux</span>
                <span className="font-medium text-greenLight">
                  {renovationCosts} €{" "}
                  {renovationPaidByPocket && (
                    <span className="text-xs">(payés de ma poche)</span>
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Apport personnel</span>
              <span className="font-medium text-greenLight">{personalContribution} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Frais de dossier</span>
              <span className="font-medium text-greenLight">{loanFees} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taxe foncière annuelle</span>
              <span className="font-medium text-greenLight">{propertyTax} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Syndic ({syndicPeriod || "mensuel"})</span>
              <span className="font-medium text-greenLight">{syndicFees} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Assurance PNO ({ownerInsurancePeriod || "annuel"})</span>
              <span className="font-medium text-greenLight">{ownerInsuranceAmount} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Durée du prêt</span>
              <span className="font-medium text-greenLight">{loanDuration} ans</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taux d'intérêt annuel</span>
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
                  <strong>Montant de l'emprunt :</strong>{" "}
                  {Number.isFinite(netLoanAmount)
                    ? `${Math.round(netLoanAmount).toLocaleString("fr-FR")} €`
                    : "—"}
                </li>
                <li>
                  <span className="font-medium">Coût des intérêts :</span>{" "}
                  {Number.isFinite(totalInterest)
                    ? `${Math.round(totalInterest).toLocaleString("fr-FR")} €`
                    : "—"}{" "}
                  <span className="text-xs">(sur {loanDuration} ans)</span>
                </li>
                <li>
                  <span className="font-medium">Coût de l'assurance :</span>{" "}
                  {Number.isFinite(totalInsuranceCost)
                    ? `${Math.round(totalInsuranceCost).toLocaleString("fr-FR")} €`
                    : "—"}{" "}
                  <span className="text-xs">(simplifié)</span>
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
                  <span className="font-medium">Assurance PNO (mensuelle) :</span>{" "}
                  {Math.round(monthlyOwnerInsurance).toLocaleString("fr-FR")} €
                </li>
                <li>
                  <span className="font-medium">Frais de notaire :</span>{" "}
                  {Math.round(notaryFees).toLocaleString("fr-FR")} €{" "}
                  <span className="text-xs">(8 %)</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Calcul de rentabilité</h3>
              <div className="mt-1 text-sm text-gray-200">
                <p>
                  <strong>Rendement brut (%) :</strong>{" "}
                  {Number.isFinite(grossYield)
                    ? `${grossYield.toFixed(2)} %`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">
                  (Loyer annuel / Coût d'achat) x 100
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-200">
                <p>
                  <strong>Rendement net (%) :</strong>{" "}
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
                  <strong>Cash-flow mensuel :</strong>{" "}
                  {Number.isFinite(monthlyCashFlow)
                    ? `${Math.round(monthlyCashFlow).toLocaleString("fr-FR")} € / mois`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">
                  Loyer - (Mensualité + Charges)
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section Paramètres de Location */}
      {(monthlyRent !== undefined || monthlyCharges !== undefined) && (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-white">
            Paramètres de Location
          </h2>
          <div className="space-y-3">
            {monthlyRent !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium">Loyer mensuel (hors charges)</span>
                <span className="font-medium text-greenLight">{monthlyRent} €</span>
              </div>
            )}
            {monthlyCharges !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium">Charges locatives</span>
                <span className="font-medium text-greenLight">{monthlyCharges} €</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Projection de la Rentabilité */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border border-gray-600 mt-8 relative">
        {/* Bouton cliquable pour afficher/masquer le graphique */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-greenLight rounded-full p-2"
            aria-label="Afficher/Masquer le graphique"
          >
            <BarChart2 className="w-6 h-6 text-white" />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-100 mb-4 border-b pb-2">
          Projection de la Rentabilité
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          La projection du cash flow cumulé est calculée avec une croissance annuelle de{" "}
          {(growthScenario * 100).toFixed(2)} %.
        </p>

        {/* Cartes de projection pour 5, 10, 15, 20 ans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projectionYears.map((year, index) => {
            const cashFlowValue = cashFlowNumbers[index];
            const remainingCredit = creditRemainingNumbers[index];
            return (
              <div key={year} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-white">Sur {year} ans</h3>
                <p>
                  <span className="font-medium">Cash Flow cumulé :</span>{" "}
                  {Number.isFinite(cashFlowValue) ? (
                    <span className="font-medium text-greenLight">
                      {cashFlowValue.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €
                    </span>
                  ) : (
                    <span className="text-sm text-red-300">Données indisponibles</span>
                  )}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Crédit restant :</span>{" "}
                  {Number.isFinite(remainingCredit) ? (
                    <span className="font-medium text-greenLight">
                      {remainingCredit.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €
                    </span>
                  ) : (
                    <span className="text-sm text-red-300">Données indisponibles</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Graphique affiché en bas de la section, avec l'axe X commençant à "0 ans" */}
        {showChart && (
          <div className="mt-4 h-64">
            <Suspense fallback={<p className="text-center text-gray-400">Chargement du graphique…</p>}>
              <Line key={chartKey} data={chartData} options={chartOptions} />
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

export default CalculationDetails;
