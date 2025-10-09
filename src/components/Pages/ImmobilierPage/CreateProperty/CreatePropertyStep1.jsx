// src/pages/CreatePropertyStep1.jsx
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';
import CustomDatePicker from '../../PeaPage/Modules/Actions/CustomDatePickerAddAction/CustomDatePicker';
import CustomSelect from '../../PeaPage/Modules/Reutilisable/CustomSelect';

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

const defaultProperty = {
  userId: localStorage.getItem('userId') || '',
  // NOUVEAU pivot : LLD | LCD | AV
  rentalKind: '',

  // Pour l’UI uniquement (on les garde si tu les utilises ailleurs)
  mode: '',                 // "Location" | "Achat/Revente"
  rentalStrategy: '',       // "annual" | "short_term" (info UI)

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
};

const roomOptions = Array.from({ length: 10 }, (_, i) => {
  const v = (i + 1).toString();
  return { value: v, label: v };
});

const dpeOptions = [
  { value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' },
  { value: 'D', label: 'D' }, { value: 'E', label: 'E' }, { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
];

const CreatePropertyStep1 = ({ apiUrl = '/api/tenants' }) => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  const [property, setProperty] = useLocalStorage('propertyFormData', defaultProperty);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [step, setStep] = useState(0); // 0 = choix, 1 = formulaire

  /* -------- Pré-remplissage si on arrive avec state.strategy -------- */
  useEffect(() => {
    const strat = locationState?.strategy; // "annual" | "short_term" | "flip"
    if (!strat) return;

    if (strat === 'flip') {
      setProperty(prev => ({
        ...prev,
        rentalKind: 'AV',
        mode: 'Achat/Revente',
        rentalStrategy: ''
      }));
      setStep(1);
    } else if (strat === 'annual') {
      setProperty(prev => ({
        ...prev,
        rentalKind: 'LLD',
        mode: 'Location',
        rentalStrategy: 'annual'
      }));
      setStep(1);
    } else if (strat === 'short_term') {
      setProperty(prev => ({
        ...prev,
        rentalKind: 'LCD',
        mode: 'Location',
        rentalStrategy: 'short_term'
      }));
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState?.strategy]);

  /* -------- Chargement des locataires -------- */
  useEffect(() => {
    fetch(apiUrl, { headers: { Accept: 'application/json' } })
      .then(async res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          // Essaye de lire le texte pour debug si ce n’est pas JSON
          try { console.error('API locataires a renvoyé :', await res.text()); } catch {}
          throw new Error('Réponse non-JSON');
        }
        return res.json();
      })
      .then(data => {
        const tenants = (Array.isArray(data) ? data : []).map(t => ({
          value: (t.id ?? t._id ?? '').toString(),
          label: `${t.firstName ?? ''} ${t.name ?? ''}`.trim()
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

  /* -------- Handlers -------- */
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
      navigate('/nouveau-locataire', { state: { from: 'nouveau-bien' } });
    } else {
      setProperty(prev => ({ ...prev, [name]: val }));
    }
  }, [navigate, setProperty]);

  const validateForm = useCallback(() => {
    if (!property.rentalKind) {
      alert("Choisissez un type : Achat/Revente (AV), Location longue durée (LLD) ou Courte durée (LCD).");
      return false;
    }
    if (!property.name.trim()) { alert("Le champ 'Nom / Référence' est obligatoire."); return false; }
    if (!property.address.trim()) { alert("Le champ 'Adresse' est obligatoire."); return false; }
    if (!/^\d+$/.test(property.postalCode)) { alert("Le champ 'Code Postal' doit être numérique."); return false; }
    if (!property.city.trim()) { alert("Le champ 'Ville' est obligatoire."); return false; }
    if (!property.surface.toString().trim()) { alert("Le champ 'Surface' est obligatoire."); return false; }
    if (!property.propertyType) { alert("Le champ 'Type de bien' est obligatoire."); return false; }
    // Locataire requis uniquement si ce n'est pas de l'achat/revente
    if (property.rentalKind !== 'AV' && !property.owner) {
      alert("Le champ 'Locataire' est obligatoire pour une location.");
      return false;
    }
    if (!property.acquisitionDate) { alert("Le champ 'Date d'acquisition' est obligatoire."); return false; }
    return true;
  }, [property]);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (!validateForm()) return;
    navigate('/nouveau-bien/etape-2', { state: { ...property } });
  }, [navigate, property, validateForm]);

  /* -------- UI -------- */
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

      {/* === STEP 0 : Choix === */}
      {step === 0 && (
        <section className="min-h-[calc(100vh-300px)] flex items-center justify-center px-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            {/* Achat / Revente (AV) */}
            <button
              onClick={() => {
                setProperty(prev => ({ ...prev, rentalKind: 'AV', mode: 'Achat/Revente', rentalStrategy: '' }));
                setStep(1);
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-md hover:scale-105 hover:shadow-xl transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-greenLight/10 mb-3">
                <Plus className="w-6 h-6 text-greenLight" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Achat / Revente</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Acquisition et revente</p>
            </button>

            {/* Location longue durée (LLD) */}
            <button
              onClick={() => {
                setProperty(prev => ({ ...prev, rentalKind: 'LLD', mode: 'Location', rentalStrategy: 'annual' }));
                setStep(1);
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-md hover:scale-105 hover:shadow-xl transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 mb-3">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Location longue durée</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Mise en location à l'année</p>
            </button>

            {/* Location courte durée (LCD) */}
            <button
              onClick={() => {
                setProperty(prev => ({ ...prev, rentalKind: 'LCD', mode: 'Location', rentalStrategy: 'short_term' }));
                setStep(1);
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-md hover:scale-105 hover:shadow-xl transition col-span-2 sm:col-span-1"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500/10 mb-3">
                <Plus className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white text-center">Location courte durée</h2>
              <p className="text-sm text-gray-400 mt-1 text-center">Type Airbnb / Booking</p>
            </button>
          </div>
        </section>
      )}

      {/* === STEP 1 : Formulaire === */}
      {step === 1 && (
        <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-100">
            Créer un Bien Immobilier – <span className="text-greenLight">Étape 1</span>
          </h1>

          {/* Rappel du type choisi */}
          {property.rentalKind && (
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
            <FloatingInput label="Nom / Référence" name="name" value={property.name} onChange={handleChange} />
            <FloatingInput label="Adresse" name="address" value={property.address} onChange={handleChange} />

            <div className="flex space-x-4">
              <FloatingInput label="Code Postal" name="postalCode" value={property.postalCode} onChange={handleChange} inputMode="numeric" />
              <FloatingInput label="Ville" name="city" value={property.city} onChange={handleChange} />
            </div>

            <FloatingInput label="Surface (m²)" name="surface" type="number" value={property.surface} onChange={handleChange} />

            {/* Type de bien + pièces */}
            <div className="flex space-x-4">
              <div className="w-3/5">
                <CustomSelect
                  name="propertyType"
                  value={property.propertyType}
                  onChange={v => handleSelectChange('propertyType', v)}
                  options={propertyTypeOptions}
                  placeholder="Type de biens"
                  className="bg-gray-800 text-gray-100 border border-gray-500"
                />
              </div>
              <div className="w-2/5">
                <CustomSelect
                  name="rooms"
                  value={property.rooms || ''}
                  onChange={v => handleSelectChange('rooms', v)}
                  options={roomOptions}
                  placeholder="Pièces"
                  className="bg-gray-800 text-gray-100 border border-gray-500"
                />
              </div>
            </div>

            {/* Bâtiment + DPE */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <FloatingInput label="Bâtiment" name="building" value={property.building} onChange={handleChange} />
              </div>
              <div className="w-1/2">
                <CustomSelect
                  name="dpe"
                  value={property.dpe || ''}
                  onChange={v => handleSelectChange('dpe', v)}
                  options={dpeOptions}
                  placeholder="DPE"
                  className="bg-gray-800 text-gray-100 border border-gray-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <FloatingInput label="Lot" name="lot" value={property.lot} onChange={handleChange} />
              <FloatingInput label="Étage" name="floor" value={property.floor} onChange={handleChange} />
              <FloatingInput label="Porte" name="door" value={property.door} onChange={handleChange} />
            </div>

            {/* Locataire (requis uniquement pour LLD/LCD) */}
            {property.rentalKind !== 'AV' && (
              <CustomSelect
                name="owner"
                value={property.owner}
                onChange={v => handleSelectChange('owner', v)}
                options={ownerOptions}
                placeholder="Sélectionnez un locataire"
                className="bg-gray-800 text-gray-100 border border-gray-500"
              />
            )}

            <CustomDatePicker
              selected={property.acquisitionDate}
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
      )}
    </div>
  );
};

CreatePropertyStep1.propTypes = {
  apiUrl: PropTypes.string
};

export default CreatePropertyStep1;
