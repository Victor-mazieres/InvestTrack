import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../../../Reutilisable/CustomSelect';
import PrimaryButton from "../../../Reutilisable/PrimaryButton";
import FurnishedTogglePro from '../../../Reutilisable/FurnishedTogglePro'; // ⬅️ chemin relatif depuis /src/pages

// Utilitaire pour récupérer un CSRF token frais
async function fetchCsrfToken() {
  const resp = await fetch('http://localhost:5000/csrf-token', {
    credentials: 'include'
  });
  const { csrfToken } = await resp.json();
  return csrfToken;
}

const CreatePropertyStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {}; // contient notamment rentalKind: 'LLD'|'LCD'|'AV'

  const [details, setDetails] = useState({
    // Par défaut: non meublé (tu peux mettre null si tu veux forcer un choix)
    isFurnished: false,

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
      jardin: false,
      veranda: false,
      abriJardin: false,
    },
  });

  const numberOptions = (min, max) =>
    Array.from({ length: max - min + 1 }, (_, i) => ({
      value: (min + i).toString(),
      label: (min + i).toString()
    }));

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

  const validateForm = () => {
    const requiredFields = {
      // Si tu veux rendre le choix obligatoire et partir de null, décommente la ligne suivante
      // isFurnished: 'Type de location (meublé / non meublé)',
      toilettes: 'Nombre de toilettes',
      sallesDeBain: 'Nombre de salles de bain',
      chauffage: 'Type de chauffage',
      eauChaude: 'Système eau chaude'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const v = details[field];
      if (v === '' || v === null || v === undefined) {
        alert(`Le champ "${label}" est obligatoire`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const csrfToken = await fetchCsrfToken();
    const rk = String(previousData.rentalKind || '').toUpperCase(); // 'LLD'|'LCD'|'AV'

    const propertyData = {
      userId: previousData.userId || localStorage.getItem('userId') || null,

      rentalKind: rk, // le back déduira 'mode'

      name: previousData.name || '',
      address: previousData.address || '',
      postalCode: previousData.postalCode || '',
      city: previousData.city || '',
      surface: previousData.surface ? Number(previousData.surface) : null,
      propertyType: previousData.propertyType || '',
      building: previousData.building || '',
      lot: previousData.lot || '',
      floor: previousData.floor || '',
      door: previousData.door || '',
      owner: previousData.owner || '',
      acquisitionDate: previousData.acquisitionDate
        ? new Date(previousData.acquisitionDate).toISOString()
        : null,

      // ✅ Meublé / Non meublé
      isFurnished: !!details.isFurnished,                  // booléen
      furnished: details.isFurnished ? 'meublé' : 'non_meublé', // doublon texte pratique

      toilettes: Number(details.toilettes),
      sallesDeBain: Number(details.sallesDeBain),
      chauffage: details.chauffage,
      eauChaude: details.eauChaude,

      amenities: details.amenities,
    };

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Erreur lors de la création du bien");
      }

      const newId = data.id || data.insertId || data._id;
      if (!newId) {
        console.warn('API /properties ne renvoie pas id/insertId/_id. data=', data);
        navigate('/immobilier', { state: { successMessage: 'Bien créé avec succès!' } });
        return;
      }

      navigate(`/property/${newId}`, { state: { successMessage: 'Bien créé avec succès!' } });
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <header className="flex items-center mb-4">
        <button onClick={() => navigate(-1)}
                className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-checkgreen transition">
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Créer un Bien Immobilier – <span className="text-greenLight">Étape 2</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ Toggle meublé / non meublé */}
          <div className="flex flex-col items-start">
            <FurnishedTogglePro
              value={details.isFurnished}
              onChange={(v) => setDetails(prev => ({ ...prev, isFurnished: v }))}
            />
          </div>

          <div className="grid gap-4">
            <CustomSelect
              name="toilettes"
              value={details.toilettes}
              onChange={val => handleSelectChange('toilettes', val)}
              options={numberOptions(1, 5)}
              placeholder="Nombre de toilettes*"
              required
            />

            <CustomSelect
              name="sallesDeBain"
              value={details.sallesDeBain}
              onChange={val => handleSelectChange('sallesDeBain', val)}
              options={numberOptions(1, 5)}
              placeholder="Nombre de salles de bain*"
              required
            />

            <CustomSelect
              name="chauffage"
              value={details.chauffage}
              onChange={val => handleSelectChange('chauffage', val)}
              options={chauffageOptions}
              placeholder="Chauffage*"
              required
            />

            <CustomSelect
              name="eauChaude"
              value={details.eauChaude}
              onChange={val => handleSelectChange('eauChaude', val)}
              options={eauChaudeOptions}
              placeholder="Eau chaude*"
              required
            />
          </div>

          {/* Équipements */}
          <div>
            <p className="mb-2 text-sm">Équipements :</p>
            <div className="flex flex-wrap gap-2">
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
                { name: 'jardin', label: 'Jardin' },
                { name: 'veranda', label: 'Véranda' },
                { name: 'abriJardin', label: 'Abri jardin' },
              ].map(amenity => {
                const selected = details.amenities[amenity.name];
                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() =>
                      setDetails(prev => ({
                        ...prev,
                        amenities: {
                          ...prev.amenities,
                          [amenity.name]: !prev.amenities[amenity.name],
                        },
                      }))
                    }
                    className={[
                      "px-3 py-2 rounded-full text-xs font-medium border transition",
                      selected
                        ? "bg-greenLight text-white border-greenLight shadow"
                        : "bg-gray-800 text-gray-200 border-gray-600 hover:border-gray-500 hover:bg-gray-750",
                    ].join(" ")}
                  >
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <PrimaryButton type="submit">Enregistrer</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyStep2;
