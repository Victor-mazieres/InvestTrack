// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  
  // État pour la modification du propriétaire
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");
  
  // Liste des locataires disponibles pour sélection
  const [tenantOptions, setTenantOptions] = useState([]);

  // Récupération de la propriété par son ID
  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP error, status = " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        setProperty(data);
        // Initialiser la sélection avec la valeur actuelle
        setSelectedOwner(data.owner);
      })
      .catch((error) => {
        console.error('Erreur de récupération de la propriété:', error);
        setError(error.message);
      });
  }, [id]);

  // Récupération de la liste des locataires
  useEffect(() => {
    fetch(`http://localhost:5000/api/tenants`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP error, status = " + res.status);
        }
        return res.json();
      })
      .then((data) => setTenantOptions(data))
      .catch((error) => console.error('Erreur de récupération des locataires:', error));
  }, []);

  // Fonction de mise à jour du propriétaire
  const updateOwner = async () => {
    try {
      // Chercher le locataire sélectionné pour obtenir son nom complet
      const chosenTenant = tenantOptions.find(
        (tenant) => tenant.id.toString() === selectedOwner
      );
      const ownerName = chosenTenant ? `${chosenTenant.firstName} ${chosenTenant.name}` : '';
      const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: ownerName }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du propriétaire");
      }
      const updatedProperty = await response.json();
      setProperty(updatedProperty);
      setIsEditingOwner(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  // Construction de l'URL de l'image (si existante)
  const imageUrl = property.profilePicture 
    ? property.profilePicture.startsWith('http')
      ? property.profilePicture 
      : `http://localhost:5000/${property.profilePicture}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <h1 className="text-3xl font-bold mb-6 text-greenLight">
        <span className="text-white">Location de </span>{property.name}
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="font-bold">Adresse :</p>
            <span className="text-greenLight">{property.address || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Code Postal :</p>
            <span className="text-greenLight">{property.postalCode || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Ville :</p>
            <span className="text-greenLight">{property.city || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Surface :</p>
            <span className="text-greenLight">{property.surface ? property.surface + ' m²' : 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Type de bien :</p>
            <span className="text-greenLight">{property.propertyType || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Bâtiment :</p>
            <span className="text-greenLight">{property.building || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Lot :</p>
            <span className="text-greenLight">{property.lot || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Étage :</p>
            <span className="text-greenLight">{property.floor || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Porte :</p>
            <span className="text-greenLight">{property.door || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Propriétaire :</p>
            {isEditingOwner ? (
              <>
                <select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="p-2 bg-gray-700 text-greenLight border border-gray-600 rounded"
                >
                  {tenantOptions.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={updateOwner}
                  className="mt-2 bg-greenLight text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                >
                  Enregistrer
                </button>
              </>
            ) : (
              <div className="flex items-center">
                <span className="text-greenLight">{property.owner || 'Non défini'}</span>
                <button
                  onClick={() => setIsEditingOwner(true)}
                  className="ml-2 text-sm bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Date d'acquisition :</p>
            <span className="text-greenLight">
              {property.acquisitionDate
                ? new Date(property.acquisitionDate).toLocaleDateString()
                : 'Non défini'}
            </span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Valeur :</p>
            <span className="text-greenLight">{property.value ? property.value + '€' : 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Nombre de pièces :</p>
            <span className="text-greenLight">{property.pieces || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Nombre de toilettes :</p>
            <span className="text-greenLight">{property.toilettes || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Nombre de salles de bain :</p>
            <span className="text-greenLight">{property.sallesDeBain || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Chauffage :</p>
            <span className="text-greenLight">{property.chauffage || 'Non défini'}</span>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Eau chaude :</p>
            <span className="text-greenLight">{property.eauChaude || 'Non défini'}</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-bold">Équipements :</p>
          <ul className="list-disc ml-6">
            {property.amenities && Object.entries(property.amenities)
              .filter(([_, value]) => value)
              .map(([amenity]) => (
                <li key={amenity} className="text-greenLight">{amenity}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
