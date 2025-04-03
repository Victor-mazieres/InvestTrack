// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data))
      .catch((error) => console.error('Erreur de récupération:', error));
  }, [id]);

  if (!property) return <div className="p-6 text-gray-100">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>
      
      <h1 className="text-3xl font-bold mb-4 text-greenLight">{property.name}</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md space-y-2">
        <p><strong>Adresse :</strong> {property.address}</p>
        <p><strong>Code Postal :</strong> {property.postalCode}</p>
        <p><strong>Ville :</strong> {property.city}</p>
        <p><strong>Surface :</strong> {property.surface} m²</p>
        <p><strong>Type de bien :</strong> {property.propertyType}</p>
        <p><strong>Bâtiment :</strong> {property.building}</p>
        <p><strong>Lot :</strong> {property.lot}</p>
        <p><strong>Étage :</strong> {property.floor}</p>
        <p><strong>Porte :</strong> {property.door}</p>
        <p><strong>Propriétaire :</strong> {property.owner}</p>
        <p>
          <strong>Date d'acquisition :</strong> {new Date(property.acquisitionDate).toLocaleDateString()}
        </p>
        <p><strong>Valeur :</strong> {property.value}€</p>
        <p><strong>Nombre de pièces :</strong> {property.pieces}</p>
        <p><strong>Nombre de toilettes :</strong> {property.toilettes}</p>
        <p><strong>Nombre de salles de bain :</strong> {property.sallesDeBain}</p>
        <p><strong>Chauffage :</strong> {property.chauffage}</p>
        <p><strong>Eau chaude :</strong> {property.eauChaude}</p>
        <div>
          <strong>Équipements :</strong>
          <ul className="list-disc ml-6">
            {property.amenities &&
              Object.entries(property.amenities)
                .filter(([_, value]) => value)
                .map(([amenity]) => (
                  <li key={amenity}>{amenity}</li>
                ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
