// src/pages/CreatePropertyStep1.jsx
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';
import CustomDatePicker from '../../PeaPage/Modules/Actions/CustomDatePickerAddAction/CustomDatePicker';
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect';

// --- Liste complète des types de bien ---
const propertyTypeOptions = [
  { value: 'Appartement',         label: 'Appartement' },
  { value: 'Maison',              label: 'Maison' },
  { value: 'Bureau',              label: 'Bureau' },
  { value: 'Chalet',              label: 'Chalet' },
  { value: 'Commerce',            label: 'Commerce' },
  { value: 'Duplex',              label: 'Duplex' },
  { value: 'Garage',              label: 'Garage' },
  { value: 'Immeuble',            label: 'Immeuble' },
  { value: 'Loft',                label: 'Loft' },
  { value: 'Mobil-home',          label: 'Mobil-home' },
  { value: 'Maison individuelle', label: 'Maison individuelle' },
  { value: 'Studio',              label: 'Studio' },
  { value: 'Villa',               label: 'Villa' },
  { value: 'Autre',               label: 'Autre' }
];

// --- Valeurs par défaut du formulaire ---
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

const CreatePropertyStep1 = ({ apiUrl = '/api/tenants' }) => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  const [property, setProperty] = useLocalStorage(
    'propertyFormData',
    defaultProperty
  );

  const [ownerOptions, setOwnerOptions] = useState([]);

  // --- Chargement des locataires (propriétaires) ---
  useEffect(() => {
    fetch(apiUrl, { headers: { Accept: 'application/json' } })
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          return res.text().then(txt => {
            console.error('API locataires a renvoyé :', txt);
            throw new Error('Réponse non-JSON');
          });
        }
        return res.json();
      })
      .then(data => {
        const tenants = data.map(t => ({
          value: t.id.toString(),
          label: `${t.firstName} ${t.name}`
        }));
        const createOption = {
          value: 'create',
          label: (
            <div className="flex items-center">
              <Plus className="w-4 h-4 text-greenLight mr-1" />
              Créer
            </div>
          )
        };
        setOwnerOptions(
          tenants.length === 0
            ? [createOption]
            : [{ value: '', label: 'Sélectionnez un locataire' }, ...tenants, createOption]
        );
      })
      .catch(err => console.error(err));
  }, [apiUrl]);

  // --- Handlers avec useCallback pour perf ---
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: name === 'postalCode' ? value.replace(/\D/g, '') : value
    }));
  }, [setProperty]);

  const handleDateChange = useCallback(date => {
    setProperty(prev => ({ ...prev, acquisitionDate: date }));
  }, [setProperty]);

  const handleSelectChange = useCallback((name, val) => {
    if (val === 'create') {
      // on reste en mémoire, on navigue vers création de locataire
      navigate('/nouveau-locataire', { state: { from: 'nouveau-bien' } });
    } else {
      setProperty(prev => ({ ...prev, [name]: val }));
    }
  }, [navigate, setProperty]);

  // --- Validation ---
  const validateForm = useCallback(() => {
    if (!property.name.trim())    { alert("Le champ 'Nom / Référence' est obligatoire."); return false; }
    if (!property.address.trim()) { alert("Le champ 'Adresse' est obligatoire."); return false; }
    if (!/^\d+$/.test(property.postalCode)) {
      alert("Le champ 'Code Postal' doit être numérique."); return false;
    }
    if (!property.city.trim())         { alert("Le champ 'Ville' est obligatoire."); return false; }
    if (!property.surface.toString().trim())   { alert("Le champ 'Surface' est obligatoire."); return false; }
    if (!property.propertyType)        { alert("Le champ 'Type de bien' est obligatoire."); return false; }
    if (!property.owner)               { alert("Le champ 'Locataire' est obligatoire."); return false; }
    if (!property.acquisitionDate)     { alert("Le champ 'Date d'acquisition' est obligatoire."); return false; }
    if (!property.value.toString().trim()) { alert("Le champ 'Valeur d'achat' est obligatoire."); return false; }
    return true;
  }, [property]);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (!validateForm()) return;
    // Les données sont déjà en storage, on passe à l'étape 2
    navigate('/nouveau-bien/etape-2', { state: { ...property } });
  }, [navigate, property, validateForm]);

  return (
    <div className="min-h-screen text-gray-100 p-6">
      <header className="flex items-center mb-4">
      <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Créer un Bien Immobilier – <span className="text-greenLight">Étape 1</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput label="Nom / Référence" name="name" value={property.name} onChange={handleChange} />
          <FloatingInput label="Adresse" name="address" value={property.address} onChange={handleChange} />

          <div className="flex space-x-4">
            <FloatingInput label="Code Postal" name="postalCode" value={property.postalCode} onChange={handleChange} inputMode="numeric" />
            <FloatingInput label="Ville"       name="city"       value={property.city}       onChange={handleChange} />
          </div>

          <FloatingInput label="Surface (m²)"     name="surface" type="number" value={property.surface} onChange={handleChange} />

          <CustomSelect
            name="propertyType"
            value={property.propertyType}
            onChange={v => handleSelectChange('propertyType', v)}
            options={propertyTypeOptions}
            placeholder="Sélectionnez le type de bien"
            className="bg-gray-800 text-gray-100 border border-gray-500"
          />

          <FloatingInput label="Bâtiment"    name="building" value={property.building} onChange={handleChange} />
          <div className="flex space-x-4">
            <FloatingInput label="Lot numéro" name="lot"    value={property.lot}    onChange={handleChange} />
            <FloatingInput label="Étage"      name="floor"  value={property.floor}  onChange={handleChange} />
            <FloatingInput label="Porte"      name="door"   value={property.door}   onChange={handleChange} />
          </div>

          <CustomSelect
            name="owner"
            value={property.owner}
            onChange={v => handleSelectChange('owner', v)}
            options={ownerOptions}
            placeholder="Sélectionnez un locataire"
            className="bg-gray-800 text-gray-100 border border-gray-500"
          />

          <CustomDatePicker
            selected={property.acquisitionDate}
            onChange={handleDateChange}
            placeholderText="Sélectionnez la date d'acquisition"
            className="w-full"
          />

          <FloatingInput label="Valeur d'achat" name="value" type="number" value={property.value} onChange={handleChange} />

          <div className="flex justify-end">
            <button type="submit" className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-checkgreen
             transition">
              Suivant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreatePropertyStep1.propTypes = {
  /** URL de l'API pour récupérer les locataires (doit renvoyer JSON) */
  apiUrl: PropTypes.string
};

export default CreatePropertyStep1;
