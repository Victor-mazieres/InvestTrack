// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import FinancialDataDisplay from '../PropertyDetail/FinancialInfo/FinancialDataDisplay';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
} from 'recharts';

const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FF5722'];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // États pour la propriété, l’erreur et les onglets
  const [property, setProperty] = useState(null);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // Données financières + donut
  const [financialData, setFinancialData] = useState(null);
  const [activeIndex, setActiveIndex]     = useState(-1);

  // Factures
  const [bills, setBills]               = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillFile, setNewBillFile]     = useState(null);

  // --- Charger la propriété
  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(setProperty)
      .catch(err => setError(err.message));
  }, [id]);

  // --- Charger les données financières
  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}/financial`)
      .then(res => {
        if (res.status === 204) return null;
        if (!res.ok) throw res;
        return res.json();
      })
      .then(data => data && setFinancialData(data))
      .catch(console.error);
  }, [id]);

  // --- Charger les factures
  useEffect(() => {
    setLoadingBills(true);
    fetch(`http://localhost:5000/api/properties/${id}/bills`)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(setBills)
      .catch(console.error)
      .finally(() => setLoadingBills(false));
  }, [id]);

  // --- Supprimer une facture
  const handleDeleteBill = async billId => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    const res = await fetch(
      `http://localhost:5000/api/properties/${id}/bills/${billId}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setBills(bills.filter(b => b.id !== billId));
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-red-500">
        {error}
      </div>
    );
  }
  if (!property) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-gray-300">
        Chargement...
      </div>
    );
  }

  // Calcul du total des factures
  const totalBills = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  // Récupération des travaux estimés
  const travauxEstimes = financialData
    ? parseFloat(financialData.travauxEstimes)
    : 0;
  const budgetRestant = travauxEstimes - totalBills;

  // Préparer les données pour le donut
  const pieData = financialData
    ? [
        {
          name: 'Loyer annuel HC',
          value: parseFloat(financialData.loyerHc || 0) * 12,
        },
        {
          name: 'Taxe foncière',
          value:
            financialData.taxeFoncierePeriod === 'annual'
              ? parseFloat(financialData.taxeFonciere)
              : parseFloat(financialData.taxeFonciere) * 12,
        },
        {
          name: 'Charges copro',
          value:
            financialData.chargesCoproPeriod === 'annual'
              ? parseFloat(financialData.chargesCopro)
              : parseFloat(financialData.chargesCopro) * 12,
        },
        {
          name: 'Assurance PNO',
          value:
            financialData.assurancePnoPeriod === 'annual'
              ? parseFloat(financialData.assurancePno)
              : parseFloat(financialData.assurancePno) * 12,
        },
        {
          name: 'Charges récupérables',
          value: parseFloat(financialData.chargeRecup || 0) * 12,
        },
      ]
    : [];

  const onPieClick = (_, index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const renderActiveShape = ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  }) => (
    <>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="#fff"
        className="font-bold"
      >
        {payload.value.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
        })}{' '}
        €
      </text>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      {/* En-tête / Retour */}
      <header className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">
          Détails du bien
        </h1>
      </header>

      {/* Nom du bien */}
      <h2 className="text-3xl font-bold mb-4 text-greenLight">
        {property.name}
      </h2>

      {/* Camembert */}
      {financialData && (
        <div className="w-full h-64 mb-6 bg-gray-800 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={50}
                outerRadius={100}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onClick={onPieClick}
                stroke="none"
                strokeWidth={0}
              >
                {pieData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={COLORS[idx % COLORS.length]}
                    focusable="false"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Contenu des onglets */}
      <div className="space-y-4">
        {/* Information location */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'location' ? null : 'location')
            }
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Information location</span>
            {activeTab === 'location' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {activeTab === 'location' && (
            <div className="p-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Adresse" value={property.address} />
              <DetailItem label="Code Postal" value={property.postalCode} />
              <DetailItem label="Ville" value={property.city} />
              <DetailItem
                label="Surface"
                value={property.surface ? `${property.surface} m²` : null}
              />
              <DetailItem label="Type de bien" value={property.propertyType} />
              <DetailItem label="Bâtiment" value={property.building} />
              <DetailItem label="Lot" value={property.lot} />
              <DetailItem label="Étage" value={property.floor} />
              <DetailItem label="Porte" value={property.door} />
              <DetailItem label="Propriétaire" value={property.owner} />
              <DetailItem
                label="Date d'acquisition"
                value={
                  property.acquisitionDate
                    ? new Date(property.acquisitionDate).toLocaleDateString()
                    : null
                }
              />
              <div className="col-span-1 md:col-span-2">
                <h3 className="font-bold mb-2">Équipements :</h3>
                {property.amenities && Object.keys(property.amenities).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(property.amenities)
                      .filter(([, v]) => v)
                      .map(([amenity]) => (
                        <span
                          key={amenity}
                          className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Aucun</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Information financière */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'financial' ? null : 'financial')
            }
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Information financière</span>
            {activeTab === 'financial' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {activeTab === 'financial' && (
            <div className="p-4 border-t border-gray-700">
              {financialData ? (
                <FinancialDataDisplay data={financialData} />
              ) : (
                <button
                  onClick={() => navigate(`/properties/${id}/financial`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Factures */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'bills' ? null : 'bills')
            }
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Factures</span>
            {activeTab === 'bills' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {activeTab === 'bills' && (
            <div className="p-4 border-t border-gray-700 space-y-4">
              {/* Budget Travaux dans l'onglet Factures */}
              <div className="space-y-1 text-gray-300">
                <div>
                  <strong>Travaux estimés :</strong>{' '}
                  {travauxEstimes.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  €
                </div>
                <div>
                  <strong>Total factures :</strong>{' '}
                  {totalBills.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  €
                </div>
                <div>
                  <strong>Budget restant :</strong>{' '}
                  {budgetRestant.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  €
                </div>
              </div>

              {loadingBills ? (
                <p className="text-gray-400">Chargement des factures…</p>
              ) : bills.length > 0 ? (
                bills.map(bill => (
                  <div
                    key={bill.id}
                    className="flex justify-between items-center bg-gray-700 p-2 rounded"
                  >
                    <span>
                      {new Date(bill.date).toLocaleDateString()} —{' '}
                      {parseFloat(bill.amount).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      €
                    </span>
                    <div className="flex items-center space-x-3">
                      <a
                        href={bill.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-400"
                      >
                        Voir
                      </a>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Aucune facture pour le moment.</p>
              )}

              {/* Bouton / Formulaire d’ajout */}
              {!showBillForm ? (
                <button
                  onClick={() => setShowBillForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter</span>
                </button>
              ) : (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const form = new FormData();
                    form.append('amount', newBillAmount);
                    form.append('file', newBillFile);
                    fetch(`http://localhost:5000/api/properties/${id}/bills`, {
                      method: 'POST',
                      body: form,
                    })
                      .then(res =>
                        res.ok ? res.json() : Promise.reject(res)
                      )
                      .then(added => {
                        setBills([added, ...bills]);
                        setNewBillAmount('');
                        setNewBillFile(null);
                        setShowBillForm(false);
                      })
                      .catch(console.error);
                  }}
                  className="bg-gray-700 p-4 rounded space-y-2"
                >
                  <div>
                    <label className="block text-gray-400">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBillAmount}
                      onChange={e => setNewBillAmount(e.target.value)}
                      className="w-full bg-gray-600 p-2 rounded text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400">Document</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => setNewBillFile(e.target.files[0])}
                      className="mt-1 text-gray-200"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBillForm(false);
                        setNewBillAmount('');
                        setNewBillFile(null);
                      }}
                      className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-greenLight rounded text-white hover:bg-green-500"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Rentabilité */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'profitability' ? null : 'profitability')
            }
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Rentabilité</span>
            {activeTab === 'profitability' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {activeTab === 'profitability' && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-gray-400">Graphiques et indicateurs à implémenter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant réutilisable pour un label / value
function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <p className="font-bold text-gray-400">{label}</p>
      <span className="text-greenLight">{value ?? 'Non défini'}</span>
    </div>
  );
}
