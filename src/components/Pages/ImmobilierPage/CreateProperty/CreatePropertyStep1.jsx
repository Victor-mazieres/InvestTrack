// CreatePropertyStep1.jsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput'; // Ajustez le chemin
import CustomDatePicker from '../../PeaPage/Modules/Actions/CustomDatePickerAddAction/CustomDatePicker'; // Ajustez le chemin
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect'; // Ajustez le chemin

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

// Options pour le propriétaire
const ownerOptions = [
  { value: 'Propriétaire 1', label: 'Propriétaire 1' },
  { value: 'Propriétaire 2', label: 'Propriétaire 2' },
  { value: 'Propriétaire 3', label: 'Propriétaire 3' }
];

const CreatePropertyStep1 = () => {
  const [property, setProperty] = useState({
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
    acquisitionDate: null, // Date sous forme d'objet Date
    value: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setProperty({
      ...property,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date) => {
    setProperty({
      ...property,
      acquisitionDate: date,
    });
  };

  const handleSelectChange = (name, value) => {
    setProperty({
      ...property,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Au lieu d'enregistrer ici, on passe à la deuxième étape en transmettant les données
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
          Créer un Bien Immobilier - 
          <span className='text-greenLight'> Étape 1</span>
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

          {/* Code Postal et Ville côte à côte */}
          <div className="flex space-x-4">
            <FloatingInput
              label="Code Postal"
              name="postalCode"
              value={property.postalCode}
              onChange={handleChange}
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

          {/* CustomSelect pour le Type de bien */}
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

          {/* CustomSelect pour la sélection du propriétaire */}
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

          {/* Date d'acquisition avec CustomDatePicker */}
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
