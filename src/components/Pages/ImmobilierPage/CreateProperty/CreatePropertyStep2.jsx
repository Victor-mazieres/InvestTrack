// src/pages/CreatePropertyStep2.jsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';

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
      jadrin: false,
      veranda: false,
      abriJardin: false,
    },
  });

  // Options de nombre pour pièces, toilettes, salles de bain
  const numberOptions = (min, max) => {
    const opts = [];
    for (let i = min; i <= max; i++) {
      opts.push({ value: i.toString(), label: i.toString() });
    }
    return opts;
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
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setDetails((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: checked },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Fusion des données de l'étape 1 et de l'étape 2, avec conversion des valeurs numériques
    const finalData = {
      ...previousData,
      ...details,
      surface: Number(previousData.surface) || Number(details.surface) || 0,
      value: Number(previousData.value) || Number(details.value) || 0,
      pieces: Number(details.pieces) || 0,
      toilettes: Number(details.toilettes) || 0,
      sallesDeBain: Number(details.sallesDeBain) || 0,
      acquisitionDate: previousData.acquisitionDate ? new Date(previousData.acquisitionDate) : null,
    };

    console.log('Données finales du bien :', finalData);

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l’enregistrement');
      }
      // Redirection vers le dashboard après enregistrement
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur : ', error);
      // Vous pouvez afficher un message d'erreur ici
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition">
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
            placeholder="Nombre de pièces"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <CustomSelect
            name="toilettes"
            value={details.toilettes}
            onChange={(val) => handleSelectChange('toilettes', val)}
            options={numberOptions(1, 5)}
            placeholder="Nombre de toilettes"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <CustomSelect
            name="sallesDeBain"
            value={details.sallesDeBain}
            onChange={(val) => handleSelectChange('sallesDeBain', val)}
            options={numberOptions(1, 5)}
            placeholder="Nombre de salles de bain"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <CustomSelect
            name="chauffage"
            value={details.chauffage}
            onChange={(val) => handleSelectChange('chauffage', val)}
            options={chauffageOptions}
            placeholder="Chauffage"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <CustomSelect
            name="eauChaude"
            value={details.eauChaude}
            onChange={(val) => handleSelectChange('eauChaude', val)}
            options={eauChaudeOptions}
            placeholder="Eau chaude"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          {/* Checkboxes pour les équipements */}
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
                { name: 'jadrin', label: 'Jadrin' },
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
            <button type="submit" className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-700 transition">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyStep2;
