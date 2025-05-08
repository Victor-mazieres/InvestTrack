// src/pages/PropertyDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, ArrowLeft } from 'lucide-react';

import DonutChart           from './components/DonutChart';
import FinancialDataDisplay from './FinancialInfo/FinancialDataDisplay';
import BillsSection         from './components/BillsSection';
import PhotoCarousel        from './components/PhotoCarousel';
import SectionLoader        from './components/SectionLoader';
import DetailItem           from './components/DetailItem';
import { Loader }           from './components/Loader';
import TenantTab            from './components/TenantTab';

import { useProperty }   from './hooks/useProperty';
import { useBills }      from './hooks/useBills';
import { useFinancials } from './hooks/useFinancials';
import { usePhotos }     from './hooks/usePhotos';

function Tab({ label, active, onToggle, children }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={active}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
      >
        <span className="font-bold">{label}</span>
        {active ? <ChevronUp /> : <ChevronDown />}
      </button>
      {active && <div className="p-4 border-t border-gray-700">{children}</div>}
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { property, loading: propLoading, error: propErr } = useProperty(id);
  const { bills, loading: billsLoading, deleteBill, addBill } = useBills(id);
  const { totalBills, travauxEstimes, budgetRestant, pieData } =
    useFinancials(property?.financialInfo, bills);
  const { photos, loading: photosLoading, addPhoto, deletePhoto } = usePhotos(id);

  const [activeTab, setActiveTab] = useState(null);

  if (propErr)                 return <div className="p-6 text-red-500">{propErr}</div>;
  if (propLoading || !property) return <Loader />;

  return (
    <div className="min-h-screen bg-noir-780 text-gray-100 p-6">
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

      <div className="space-y-4">
        {/* Location */}
        <Tab
          label="Information location"
          active={activeTab === 'location'}
          onToggle={() => setActiveTab(t => (t === 'location' ? null : 'location'))}
        >
          <SectionLoader loading={false} error={null}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['Adresse', property.address],
                ['Code Postal', property.postalCode],
                ['Ville', property.city],
                ['Surface', property.surface ? `${property.surface} m²` : null],
                ['Type de bien', property.propertyType],
                ['Bâtiment', property.building],
                ['Lot', property.lot],
                ['Étage', property.floor],
                ['Porte', property.door],
                ['Propriétaire', property.owner],
                [
                  'Date d’acquisition',
                  property.acquisitionDate
                    ? new Date(property.acquisitionDate).toLocaleDateString()
                    : null
                ],
              ].map(([label, value]) => (
                <DetailItem key={label} label={label} value={value} />
              ))}

              <div className="col-span-2 md:col-span-3">
                <p className="font-bold text-gray-400 mb-1">Équipements :</p>
                {property.amenities &&
                Object.keys(property.amenities).filter(k => property.amenities[k]).length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-greenLight">
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
          </SectionLoader>
        </Tab>

        {/* Financière */}
        <Tab
          label="Information financière"
          active={activeTab === 'financial'}
          onToggle={() => setActiveTab(t => (t === 'financial' ? null : 'financial'))}
        >
          <SectionLoader loading={false} error={null}>
            {property.financialInfo && Object.keys(property.financialInfo).length > 0 ? (
              <FinancialDataDisplay data={property.financialInfo} />
            ) : (
              <button
                onClick={() => navigate(`/properties/${id}/financial`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-checkgreen transition"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </button>
            )}
          </SectionLoader>
        </Tab>

        {/* Factures */}
        <Tab
          label="Factures"
          active={activeTab === 'bills'}
          onToggle={() => setActiveTab(t => (t === 'bills' ? null : 'bills'))}
        >
          <SectionLoader loading={billsLoading} error={null}>
            <BillsSection
              bills={bills}
              loading={false}
              addBill={addBill}
              deleteBill={deleteBill}
              travauxEstimes={travauxEstimes}
              totalBills={totalBills}
              budgetRestant={budgetRestant}
            />
          </SectionLoader>
        </Tab>

        {/* Locataire */}
        <Tab
          label="Locataire"
          active={activeTab === 'tenant'}
          onToggle={() => setActiveTab(t => (t === 'tenant' ? null : 'tenant'))}
        >
          <TenantTab ownerId={property.owner} active={activeTab === 'tenant'} />
        </Tab>
      </div>
    </div>
  );
}
