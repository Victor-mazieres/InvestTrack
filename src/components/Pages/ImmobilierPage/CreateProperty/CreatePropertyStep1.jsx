// src/pages/CreatePropertyStep1.jsx
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import FloatingInput from '../../../Reutilisable/FloatingLabelInput';
import CustomDatePicker from '../../PeaPage/Modules/Actions/CustomDatePickerAddAction/CustomDatePicker';
import CustomSelect from '../../../Reutilisable/CustomSelect';
import CreatePropertyStep0 from './CreatePropertyStep0';

/* ---------- Helpers pour valeurs contrôlées ---------- */
const asInputStr = (v) => (v === undefined || v === null ? '' : String(v));
const asNumberStr = (v) => {
  if (v === '' || v === undefined || v === null) return '';
  const n = Number(v);
  return Number.isFinite(n) ? String(v) : '';
};

/* ---------- Options du type de bien ---------- */
const propertyTypeOptions = [
  { value: 'appartement',      label: 'Appartement' },
  { value: 'maison',           label: 'Maison' },
  { value: 'challet',           label: 'Challet' },
  { value: 'studio',           label: 'Studio' },
  { value: 'duplex',           label: 'Duplex' },
  { value: 'loft',             label: 'Loft' },
  { value: 'villa',            label: 'Villa' },
  { value: 'immeuble',         label: 'Immeuble' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'bureau',           label: 'Bureau' },
  { value: 'parking',          label: 'Parking / Box' },
  { value: 'terrain',          label: 'Terrain' },
];

/* ---------- Valeurs par défaut ---------- */
const defaultProperty = {
  // pilotage
  rentalKind: '',          // 'LLD' | 'LCD' | 'AV' (défini à l'étape 0)
  mode: '',                // dérivé ensuite si besoin
  rentalStrategy: '',      // 'annual' | 'short_term' | ''

  // identité du bien
  name: '',
  address: '',
  postalCode: '',
  city: '',
  surface: '',             // string pour rester contrôlé
  propertyType: '',        // CustomSelect
  rooms: '',               // CustomSelect
  building: '',
  lot: '',
  floor: '',
  door: '',

  // rattachements
  owner: '',               // id locataire (LLD/LCD)

  // dates & chiffres
  acquisitionDate: null,   // Date | null
  value: '',

  // détails logement
  pieces: '',
  toilettes: '',
  sallesDeBain: '',
  chauffage: '',
  eauChaude: '',
  amenities: {},

  // meublé
  isFurnished: null,       // true | false | null
  furnished: null,         // 'meublé' | 'non_meublé' | null

  // DPE (lettre simple)
  dpe: '',                 // 'A'...'G'
};

const roomOptions = Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }));
const dpeOptions  = ['A','B','C','D','E','F','G'].map(x => ({ value: x, label: x }));

const CreatePropertyStep1 = ({ apiUrl = '/api/tenants' }) => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  const [property, setProperty] = useLocalStorage('propertyFormData', defaultProperty);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [step, setStep] = useState(0); // 0 = écran choix, 1 = formulaire

  /* ---------- Pré-remplissage via state.strategy ---------- */
  useEffect(() => {
    const strat = locationState?.strategy;
    if (!strat) return;
    if (strat === 'flip') {
      setProperty(prev => ({ ...prev, rentalKind: 'AV', mode: 'Achat/Revente', rentalStrategy: '' }));
      setStep(1);
    } else if (strat === 'annual') {
      setProperty(prev => ({ ...prev, rentalKind: 'LLD', mode: 'Location', rentalStrategy: 'annual' }));
      setStep(1);
    } else if (strat === 'short_term') {
      setProperty(prev => ({ ...prev, rentalKind: 'LCD', mode: 'Location', rentalStrategy: 'short_term' }));
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState?.strategy]);

  /* ---------- Chargement locataires ---------- */
  useEffect(() => {
    fetch(apiUrl, { headers: { Accept: 'application/json' } })
      .then(async res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          try { console.error('API locataires a renvoyé :', await res.text()); } catch {}
          throw new Error('Réponse non-JSON');
        }
        return res.json();
      })
      .then(data => {
        const tenants = (Array.isArray(data) ? data : []).map(t => ({
          value: (t.id ?? t._id ?? '').toString(),
          label: `${t.firstName ?? ''} ${t.name ?? ''}`.trim(),
        }));
        const createOption = { value: 'create', label: 'Créer' };
        setOwnerOptions(
          tenants.length === 0
            ? [createOption]
            : [{ value: '', label: 'Sélectionnez un locataire' }, ...tenants, createOption]
        );
      })
      .catch(err => console.error(err));
  }, [apiUrl]);

  /* ---------- Handlers ---------- */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: name === 'postalCode' ? value.replace(/\D/g, '') : value,
    }));
  }, [setProperty]);

  const handleDateChange = useCallback((date) => {
    setProperty(prev => ({ ...prev, acquisitionDate: date }));
  }, [setProperty]);

  const handleSelectChange = useCallback((name, val) => {
    if (val === 'create') {
      navigate('/nouveau-locataire', { state: { from: 'nouveau-bien' } });
    } else {
      setProperty(prev => ({ ...prev, [name]: val }));
    }
  }, [navigate, setProperty]);

  const validateForm = useCallback(() => {
    if (!property?.rentalKind) { alert("Choisissez un type : AV, LLD ou LCD."); return false; }
    if (!asInputStr(property?.name).trim()) { alert("Le champ 'Nom / Référence' est obligatoire."); return false; }
    if (!asInputStr(property?.address).trim()) { alert("Le champ 'Adresse' est obligatoire."); return false; }
    if (!/^\d+$/.test(asInputStr(property?.postalCode))) { alert("Le champ 'Code Postal' doit être numérique."); return false; }
    if (!asInputStr(property?.city).trim()) { alert("Le champ 'Ville' est obligatoire."); return false; }
    if (!asInputStr(property?.surface).trim()) { alert("Le champ 'Surface' est obligatoire."); return false; }
    if (!property?.propertyType) { alert("Le champ 'Type de bien' est obligatoire."); return false; }
    if (property?.rentalKind !== 'AV' && !property?.owner) { alert("Le champ 'Locataire' est obligatoire pour une location."); return false; }
    if (!property?.acquisitionDate) { alert("Le champ 'Date d'acquisition' est obligatoire."); return false; }
    return true;
  }, [property]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateForm()) return;
    navigate('/nouveau-bien/etape-2', { state: { ...property } });
  }, [navigate, property, validateForm]);

  /* ---------- Étape 0 (choix) ---------- */
  if (step === 0) {
    const onChoose = (kind) => {
      if (kind === 'AV') {
        setProperty(prev => ({ ...prev, rentalKind: 'AV', mode: 'Achat/Revente', rentalStrategy: '' }));
      } else if (kind === 'LLD') {
        setProperty(prev => ({ ...prev, rentalKind: 'LLD', mode: 'Location', rentalStrategy: 'annual' }));
      } else if (kind === 'LCD') {
        setProperty(prev => ({ ...prev, rentalKind: 'LCD', mode: 'Location', rentalStrategy: 'short_term' }));
      }
      setStep(1);
    };

    return (
      <CreatePropertyStep0
        onBack={() => navigate(-1)}
        onChoose={onChoose}
      />
    );
  }

  /* ---------- Étape 1 (formulaire) ---------- */
  return (
    <div className="min-h-screen text-gray-100 p-6">
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Créer un Bien Immobilier – <span className="text-greenLight">Étape 1</span>
        </h1>

        {property?.rentalKind && (
          <div className="mb-4 text-sm text-gray-300">
            <span className="opacity-70">Type : </span>
            <span className="font-medium">
              {property.rentalKind === 'AV'
                ? 'Achat / Revente'
                : property.rentalKind === 'LLD'
                ? 'Location longue durée'
                : 'Location courte durée'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nom / Référence"
            name="name"
            value={asInputStr(property?.name)}
            onChange={handleChange}
          />
          <FloatingInput
            label="Adresse"
            name="address"
            value={asInputStr(property?.address)}
            onChange={handleChange}
          />

          <div className="flex space-x-4">
            <FloatingInput
              label="Code Postal"
              name="postalCode"
              value={asInputStr(property?.postalCode)}
              onChange={handleChange}
              inputMode="numeric"
            />
            <FloatingInput
              label="Ville"
              name="city"
              value={asInputStr(property?.city)}
              onChange={handleChange}
            />
          </div>

          <FloatingInput
            label="Surface (m²)"
            name="surface"
            type="number"
            value={asNumberStr(property?.surface)}
            onChange={handleChange}
          />

          <div className="flex space-x-4">
            <div className="w-3/5">
              <CustomSelect
                name="propertyType"
                value={property?.propertyType || ''}
                onChange={v => handleSelectChange('propertyType', v)}
                options={propertyTypeOptions}
                placeholder="Type de biens"
                className="bg-gray-800 text-gray-100 border border-gray-500"
              />
            </div>
            <div className="w-2/5">
              <CustomSelect
                name="rooms"
                value={property?.rooms || ''}
                onChange={v => handleSelectChange('rooms', v)}
                options={roomOptions}
                placeholder="Pièces"
                className="bg-gray-800 text-gray-100 border border-gray-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <FloatingInput
                label="Bâtiment"
                name="building"
                value={asInputStr(property?.building)}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <CustomSelect
                name="dpe"
                value={property?.dpe || ''}
                onChange={v => handleSelectChange('dpe', v)}
                options={dpeOptions}
                placeholder="DPE"
                className="bg-gray-800 text-gray-100 border border-gray-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <FloatingInput
              label="Lot"
              name="lot"
              value={asInputStr(property?.lot)}
              onChange={handleChange}
            />
            <FloatingInput
              label="Étage"
              name="floor"
              value={asInputStr(property?.floor)}
              onChange={handleChange}
            />
            <FloatingInput
              label="Porte"
              name="door"
              value={asInputStr(property?.door)}
              onChange={handleChange}
            />
          </div>

          {property?.rentalKind !== 'AV' && (
            <CustomSelect
              name="owner"
              value={property?.owner || ''}
              onChange={v => handleSelectChange('owner', v)}
              options={ownerOptions}
              placeholder="Sélectionnez un locataire"
              className="bg-gray-800 text-gray-100 border border-gray-500"
            />
          )}

          <CustomDatePicker
            selected={property?.acquisitionDate || null}
            onChange={handleDateChange}
            placeholderText="Sélectionnez la date d'acquisition"
            className="w-full"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className={[
                "relative px-6 py-3 rounded-3xl font-medium text-white",
                "bg-gradient-to-b from-greenLight to-checkgreen",
                "shadow-md hover:from-checkgreen hover:to-greenLight hover:shadow-lg",
                "focus:ring-2 focus:ring-greenLight/60 focus:ring-offset-2 focus:ring-offset-gray-900 focus:shadow-xl",
                "transition duration-200 ease-out focus-visible:outline-none",
              ].join(" ")}
            >
              <span className="relative z-10">Suivant</span>
              <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-black/20 blur-[2px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreatePropertyStep1.propTypes = {
  apiUrl: PropTypes.string
};

export default CreatePropertyStep1;
