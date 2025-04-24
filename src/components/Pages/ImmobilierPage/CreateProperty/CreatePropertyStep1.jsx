// src/pages/CreatePropertyStep1.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';
import CustomDatePicker from '../../PeaPage/Modules/Actions/CustomDatePickerAddAction/CustomDatePicker';
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect';

// Options pour le type de bien
const propertyTypeOptions = [
  { value: 'Appartement', label: 'Appartement' },
  { value: 'Maison', label: 'Maison' },
  { value: 'Bureau', label: 'Bureau' },
  { value: 'Chalet', label: 'Chalet' },
  { value: 'Commerce', label: 'Commerce' },
  { value: 'Duplex', label: 'Duplex' },
  { value: 'Garage', label: 'Garage' },
  { value: 'Immeuble', label: 'Immeuble' },
  { value: 'Loft', label: 'Loft' },
  { value: 'Mobil-home', label: 'Mobil-home' },
  { value: 'Maison individuelle', label: 'Maison individuelle' },
  { value: 'Studio', label: 'Studio' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Autre', label: 'Autre' }
];

// Valeurs par défaut du formulaire de bien
const defaultProperty = {
  userId: localStorage.getItem('userId') || '',
  name: '',
  address: '',
  postalCode: '',
  city: '',
  surface: '',
  propertyType: '',
  building: '',
  lot: '',
  floor: '',
  door: '',
  owner: '',
  acquisitionDate: null,
  value: ''
};

const CreatePropertyStep1 = () => {
  const navigate = useNavigate();

  // Initialiser l'état avec les données sauvegardées si elles existent
  const [property, setProperty] = useState(() => {
    const saved = localStorage.getItem("propertyFormData");
    return saved ? JSON.parse(saved) : defaultProperty;
  });

  // State pour les options du propriétaire récupérées depuis l'API
  const [ownerOptions, setOwnerOptions] = useState([]);

  useEffect(() => {
    // Remplacer l'URL par celle de votre API qui retourne la liste des locataires
    fetch('http://localhost:5000/api/tenants')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des locataires");
        }
        return res.json();
      })
      .then((data) => {
        // Transformer les données en options pour le dropdown
        const options = data.map((tenant) => ({
          value: tenant.id.toString(),
          label: `${tenant.firstName} ${tenant.name}`
        }));
        // Ajouter l'option "Créer" avec l'icône à la fin
        options.push({
          value: 'create',
          label: (
            <div className="flex items-center">
              <Plus className="w-4 h-4 text-greenLight mr-1" />
              Créer
            </div>
          )
        });
        setOwnerOptions(options);
      })
      .catch((error) => console.error(error));
  }, []);

  // Modification de handleChange pour nettoyer le champ postalCode
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "postalCode") {
      // Conserver uniquement les chiffres
      const digits = value.replace(/\D/g, "");
      setProperty({
        ...property,
        [name]: digits
      });
    } else {
      setProperty({
        ...property,
        [name]: value
      });
    }
  };

  const handleDateChange = (date) => {
    setProperty({
      ...property,
      acquisitionDate: date
    });
  };

  const handleSelectChange = (name, value) => {
    // Si l'option "Créer" est sélectionnée, on sauvegarde le formulaire et on navigue vers la création d'un locataire
    if (value === 'create') {
      localStorage.setItem("propertyFormData", JSON.stringify(property));
      navigate('/nouveau-locataire', { state: { from: "nouveau-bien" } });
    } else {
      setProperty({
        ...property,
        [name]: value
      });
    }
  };

  // Fonction de validation du formulaire
  const validateForm = () => {
    if (!property.name.trim()) {
      alert("Le champ 'Nom / Référence' est obligatoire.");
      return false;
    }
    if (!property.address.trim()) {
      alert("Le champ 'Adresse' est obligatoire.");
      return false;
    }
    if (!property.postalCode.trim()) {
      alert("Le champ 'Code Postal' est obligatoire.");
      return false;
    }
    if (!/^\d+$/.test(property.postalCode.trim())) {
      alert("Le champ 'Code Postal' doit contenir uniquement des chiffres.");
      return false;
    }
    if (!property.city.trim()) {
      alert("Le champ 'Ville' est obligatoire.");
      return false;
    }
    if (!property.surface.toString().trim()) {
      alert("Le champ 'Surface' est obligatoire.");
      return false;
    }
    if (!property.propertyType.trim()) {
      alert("Le champ 'Type de bien' est obligatoire.");
      return false;
    }
    if (!property.owner.trim()) {
      alert("Le champ 'Propriétaire' est obligatoire.");
      return false;
    }
    if (!property.acquisitionDate) {
      alert("Le champ 'Date d'acquisition' est obligatoire.");
      return false;
    }
    if (!property.value.toString().trim()) {
      alert("Le champ 'Valeur d'achat' est obligatoire.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier que tous les champs obligatoires sont remplis et valides
    if (!validateForm()) {
      return;
    }

    // Sauvegarder le formulaire dans le localStorage
    localStorage.setItem("propertyFormData", JSON.stringify(property));
    // Passage à l'étape suivante (ici, vous pouvez adapter la redirection)
    navigate('/nouveau-bien/etape-2', { state: { ...property } });
  };

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

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Créer un Bien Immobilier - <span className="text-greenLight">Étape 1</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nom / Référence"
            name="name"
            value={property.name}
            onChange={handleChange}
          />

          <FloatingInput
            label="Adresse"
            name="address"
            value={property.address}
            onChange={handleChange}
          />

          <div className="flex space-x-4">
            <FloatingInput
              label="Code Postal"
              name="postalCode"
              value={property.postalCode}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]+"
            />
            <FloatingInput
              label="Ville"
              name="city"
              value={property.city}
              onChange={handleChange}
            />
          </div>

          <FloatingInput
            label="Surface (m²)"
            name="surface"
            type="number"
            value={property.surface}
            onChange={handleChange}
          />

          <CustomSelect
            name="propertyType"
            value={property.propertyType}
            onChange={(val) => handleSelectChange('propertyType', val)}
            options={propertyTypeOptions}
            placeholder="Sélectionnez le Type de bien"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <FloatingInput
            label="Bâtiment"
            name="building"
            value={property.building}
            onChange={handleChange}
          />
          <FloatingInput
            label="Lot numéro"
            name="lot"
            value={property.lot}
            onChange={handleChange}
          />
          <FloatingInput
            label="Étage"
            name="floor"
            value={property.floor}
            onChange={handleChange}
          />
          <FloatingInput
            label="Porte"
            name="door"
            value={property.door}
            onChange={handleChange}
          />

          <CustomSelect
            name="owner"
            value={property.owner}
            onChange={(val) => handleSelectChange('owner', val)}
            options={ownerOptions}
            placeholder="Sélectionnez un propriétaire"
            className="bg-gray-800 text-gray-100 border border-gray-500"
            dropdownClassName="bg-gray-800 text-gray-100 w-full border border-gray-500"
            dropdownSize="max-h-60"
          />

          <div className="w-full">
            <CustomDatePicker
              selected={property.acquisitionDate}
              onChange={handleDateChange}
              placeholderText="Sélectionnez la date d'acquisition"
              className="w-full"
            />
          </div>

          <FloatingInput
            label="Valeur d'achat"
            name="value"
            type="number"
            value={property.value}
            onChange={handleChange}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-700 transition"
            >
              Suivant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyStep1;
