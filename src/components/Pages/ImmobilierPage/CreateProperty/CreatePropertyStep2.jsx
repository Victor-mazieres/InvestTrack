import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect';

const CreatePropertyStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};

  const [details, setDetails] = useState({
    pieces: '',
    toilettes: '',
    sallesDeBain: '',
    chauffage: '',
    eauChaude: '',
    amenities: {
      cave: false,
      grenier: false,
      garage: false,
      parking: false,
      cellier: false,
      dependance: false,
      piscine: false,
      terrasse: false,
      balcon: false,
      jardin: false, // Correction: jadrin -> jardin
      veranda: false,
      abriJardin: false,
    },
  });

  // Options de nombre pour pièces, toilettes, salles de bain
  const numberOptions = (min, max) => {
    return Array.from({ length: max - min + 1 }, (_, i) => ({
      value: (min + i).toString(),
      label: (min + i).toString()
    }));
  };

  const chauffageOptions = [
    { value: 'Individuel bois', label: 'Individuel bois' },
    { value: 'Individuel', label: 'Individuel' },
    { value: 'Individuel gaz', label: 'Individuel gaz' },
    { value: 'Collectif', label: 'Collectif' },
    { value: 'Collectif gaz', label: 'Collectif gaz' },
    { value: 'Aucun', label: 'Aucun' },
    { value: 'Individuel fuel', label: 'Individuel fuel' },
    { value: 'Collectif fuel', label: 'Collectif fuel' },
    { value: 'Individuel électrique', label: 'Individuel électrique' },
    { value: 'Électrique soufflant', label: 'Électrique soufflant' },
  ];

  const eauChaudeOptions = [
    { value: 'Individuel', label: 'Individuel' },
    { value: 'Collectif', label: 'Collectif' },
    { value: 'Aucun', label: 'Aucun' },
  ];

  const handleSelectChange = (name, value) => {
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setDetails(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: checked }
    }));
  };

  const validateForm = () => {
    const requiredFields = {
      pieces: 'Nombre de pièces',
      toilettes: 'Nombre de toilettes',
      sallesDeBain: 'Nombre de salles de bain',
      chauffage: 'Type de chauffage',
      eauChaude: 'Système eau chaude'
    };

    for (const [field, name] of Object.entries(requiredFields)) {
      if (!details[field]) {
        alert(`Le champ "${name}" est obligatoire`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Préparation des données finales
    const propertyData = {
      ...previousData,
      ...details,
      // Conversion des valeurs numériques
      surface: previousData.surface ? Number(previousData.surface) : null,
      value: previousData.value ? Number(previousData.value) : null,
      pieces: Number(details.pieces),
      toilettes: Number(details.toilettes),
      sallesDeBain: Number(details.sallesDeBain),
      acquisitionDate: previousData.acquisitionDate 
        ? new Date(previousData.acquisitionDate).toISOString() 
        : null,
      // Vérification du userId
      userId: previousData.userId || localStorage.getItem('userId')
    };

    console.log('Données envoyées au serveur:', propertyData);

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Si vous utilisez JWT
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création du bien");
      }

      navigate('/immobilier', { 
        state: { successMessage: 'Bien créé avec succès!' } 
      });

    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-checkgreen transition">
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Créer un Bien Immobilier - <span className="text-greenLight">Étape 2</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            name="pieces"
            value={details.pieces}
            onChange={(val) => handleSelectChange('pieces', val)}
            options={numberOptions(1, 10)}
            placeholder="Nombre de pièces*"
            required
          />

          <CustomSelect
            name="toilettes"
            value={details.toilettes}
            onChange={(val) => handleSelectChange('toilettes', val)}
            options={numberOptions(1, 5)}
            placeholder="Nombre de toilettes*"
            required
          />

          <CustomSelect
            name="sallesDeBain"
            value={details.sallesDeBain}
            onChange={(val) => handleSelectChange('sallesDeBain', val)}
            options={numberOptions(1, 5)}
            placeholder="Nombre de salles de bain*"
            required
          />

          <CustomSelect
            name="chauffage"
            value={details.chauffage}
            onChange={(val) => handleSelectChange('chauffage', val)}
            options={chauffageOptions}
            placeholder="Chauffage*"
            required
          />

          <CustomSelect
            name="eauChaude"
            value={details.eauChaude}
            onChange={(val) => handleSelectChange('eauChaude', val)}
            options={eauChaudeOptions}
            placeholder="Eau chaude*"
            required
          />

          <div>
            <p className="mb-2">Équipements :</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'cave', label: 'Cave' },
                { name: 'grenier', label: 'Grenier' },
                { name: 'garage', label: 'Garage' },
                { name: 'parking', label: 'Parking' },
                { name: 'cellier', label: 'Cellier' },
                { name: 'dependance', label: 'Dépendance' },
                { name: 'piscine', label: 'Piscine' },
                { name: 'terrasse', label: 'Terrasse' },
                { name: 'balcon', label: 'Balcon' },
                { name: 'jardin', label: 'Jardin' }, // Correction ici
                { name: 'veranda', label: 'Véranda' },
                { name: 'abriJardin', label: 'Abri jardin' },
              ].map((amenity) => (
                <label key={amenity.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={amenity.name}
                    checked={details.amenities[amenity.name]}
                    onChange={handleAmenityChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-checkgreen transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyStep2;