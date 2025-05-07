import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User } from 'lucide-react';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';
import DateInput from '../../ImmobilierPage/Tenant/DateInput';

const CreateTenant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Forcer un userId de test si besoin
  const storedUserId = localStorage.getItem('userId') || '123';
  localStorage.setItem('userId', storedUserId);

  const [tenant, setTenant] = useState({
    userId: storedUserId,
    name: '',
    firstName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    bio: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setTenant(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = e => {
    setTenant(prev => ({ ...prev, dateOfBirth: e.target.value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner un fichier image valide.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La taille de l'image dépasse 5 MB.");
      return;
    }
    if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
      setError("Formats acceptés : jpg, jpeg, png, gif.");
      return;
    }
    setProfilePicture(file);
    setProfilePreview(URL.createObjectURL(file));
    setError(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!tenant.name.trim())        errs.name = "Le nom est requis.";
    if (!tenant.firstName.trim())   errs.firstName = "Le prénom est requis.";
    if (!tenant.email.trim()) {
      errs.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email)) {
      errs.email = "L'email n'est pas valide.";
    }
    if (!tenant.phone.trim())       errs.phone = "Le téléphone est requis.";
    if (!tenant.dateOfBirth.trim()) errs.dateOfBirth = "La date de naissance est requise.";

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    const dobISO = Date.parse(tenant.dateOfBirth)
      ? new Date(tenant.dateOfBirth).toISOString()
      : tenant.dateOfBirth;

    Object.entries({ ...tenant, dateOfBirth: dobISO }).forEach(([k, v]) => {
      formData.append(k, v);
    });
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const res = await fetch('http://localhost:5000/api/tenants', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Erreur lors de la création du locataire");

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);

        // Retour selon le contexte d'origine
        if (location.state?.from === 'nouveau-bien') {
          // on revient à l'étape 1 du formulaire de bien
          const propData = localStorage.getItem('propertyFormData');
          navigate('/nouveau-bien', {
            state: {
              fromOwnerCreation: true,
              ...(propData ? JSON.parse(propData) : {})
            }
          });
        }
        else if (location.state?.fromDashboard) {
          // on revient au dashboard
          navigate(-1);
        }
        else {
          // redirection classique
          navigate('/locataires');
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("Une erreur est survenue lors de la création du locataire.");
    }
  };

  return (
    <div className="min-h-screen text-gray-100 p-6">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              fixed top-4 inset-x-0 mx-auto 
              w-full max-w-sm 
              bg-greenLight text-white 
              p-4 rounded shadow-lg 
              z-50 text-center
            "
          >
            Locataire créé !
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="
            p-2 bg-gradient-to-br from-gray-800 to-gray-700 
            border border-gray-600 rounded-full shadow-md 
            hover:bg-blue-900 transition
          "
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <div className="max-w-xl bg-gray-800 shadow-xl rounded-3xl p-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Créer un Locataire</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FloatingInput
            label="Nom"
            name="name"
            value={tenant.name}
            onChange={handleChange}
            error={validationErrors.name}
          />
          <FloatingInput
            label="Prénom"
            name="firstName"
            value={tenant.firstName}
            onChange={handleChange}
            error={validationErrors.firstName}
          />
          <FloatingInput
            label="Email"
            name="email"
            type="email"
            value={tenant.email}
            onChange={handleChange}
            error={validationErrors.email}
          />
          <FloatingInput
            label="Téléphone"
            name="phone"
            value={tenant.phone}
            onChange={handleChange}
            error={validationErrors.phone}
          />
          <DateInput
            value={tenant.dateOfBirth}
            onChange={handleDateChange}
            error={validationErrors.dateOfBirth}
          />
          <FloatingInput
            label="Profession"
            name="occupation"
            value={tenant.occupation}
            onChange={handleChange}
          />
          <FloatingInput
            label="Biographie"
            name="bio"
            value={tenant.bio}
            onChange={handleChange}
          />

          <div className="flex flex-col items-center">
            <label className="mb-2 text-gray-300">Photo de profil</label>
            <div
              className="
                w-24 h-24 rounded-full bg-gray-700 
                flex items-center justify-center 
                cursor-pointer overflow-hidden
              "
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Aperçu"
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="
                bg-greenLight text-white 
                px-4 py-2 rounded-3xl shadow-xl 
                hover:bg-checkgreen transition
              "
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTenant;
