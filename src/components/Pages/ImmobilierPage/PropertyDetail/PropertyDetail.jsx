import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [tenantOptions, setTenantOptions] = useState([]);
  
  // Récupération de la propriété
  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setProperty)
      .catch((error) => setError(error.message));
  }, [id]);

  // Récupération des locataires
  useEffect(() => {
    fetch('http://localhost:5000/api/tenants')
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setTenantOptions)
      .catch(console.error);
  }, []);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  if (error) return <div className="p-6 bg-gray-900 min-h-screen text-red-500">{error}</div>;
  if (!property) return <div className="p-6 bg-gray-900 min-h-screen text-gray-300">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-full hover:bg-blue-900 transition">
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <h1 className="text-3xl font-bold mb-6">
        <span className="text-white">Détails du bien: </span>
        <span className="text-greenLight">{property.name}</span>
      </h1>

      {/* Menu d'onglets */}
      <div className="space-y-2">
        {/* Onglet Information location */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => toggleTab('location')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Information location</span>
            {activeTab === 'location' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {activeTab === 'location' && (
            <div className="p-4 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Adresse" value={property.address} />
                <DetailItem label="Code Postal" value={property.postalCode} />
                <DetailItem label="Ville" value={property.city} />
                <DetailItem label="Surface" value={property.surface ? `${property.surface} m²` : null} />
                <DetailItem label="Type de bien" value={property.propertyType} />
                <DetailItem label="Bâtiment" value={property.building} />
                <DetailItem label="Lot" value={property.lot} />
                <DetailItem label="Étage" value={property.floor} />
                <DetailItem label="Porte" value={property.door} />
                <DetailItem label="Propriétaire" value={property.owner} />
                <DetailItem 
                  label="Date d'acquisition" 
                  value={property.acquisitionDate ? new Date(property.acquisitionDate).toLocaleDateString() : null} 
                />
                
                <div className="col-span-1 md:col-span-2">
                  <h3 className="font-bold mb-2">Équipements :</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities && Object.entries(property.amenities)
                      .filter(([_, value]) => value)
                      .map(([amenity]) => (
                        <span key={amenity} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Onglet Information financière */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => toggleTab('financial')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Information financière</span>
            {activeTab === 'financial' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {activeTab === 'financial' && (
             <div className="p-4 border-t border-gray-700 flex justify-center">
             <button
               onClick={() => navigate('/informartion-financiere')}
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
             >
               <Plus className="w-5 h-5" />
               <span>Ajouter</span>
             </button>
           </div>
          )}
        </div>

        {/* Onglet Facture */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => toggleTab('bills')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Facture</span>
            {activeTab === 'bills' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {activeTab === 'bills' && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-gray-400">Liste des factures à implémenter</p>
            </div>
          )}
        </div>

        {/* Onglet Rentabilité */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => toggleTab('profitability')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition"
          >
            <span className="font-bold">Rentabilité</span>
            {activeTab === 'profitability' ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {activeTab === 'profitability' && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-gray-400">Graphiques et indicateurs de rentabilité à implémenter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant réutilisable pour afficher un détail
const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="font-bold text-gray-400">{label}</p>
    <span className="text-greenLight">{value || 'Non défini'}</span>
  </div>
);

export default PropertyDetail;
