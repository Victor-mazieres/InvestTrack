// src/pages/CreateTenant.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User } from 'lucide-react';
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput';
import DateInput from '../../ImmobilierPage/Tenant/DateInput';

const CreateTenant = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pour tester, on force un userId par défaut s'il n'est pas déjà dans le localStorage
  const storedUserId = localStorage.getItem('userId') || '123';
  localStorage.setItem('userId', storedUserId);

  const [tenant, setTenant] = useState({
    userId: storedUserId,
    name: '',
    firstName: '',
    email: '',
    phone: '',
    dateOfBirth: '', // Format "JJ/MM/AAAA"
    occupation: '',
    bio: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setTenant({ ...tenant, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setTenant({ ...tenant, dateOfBirth: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Veuillez sélectionner un fichier image valide.");
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        setError("La taille de l'image dépasse 5 MB.");
        return;
      }
      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
      if (!allowedExtensions.exec(file.name)) {
        setError("Le format de l'image n'est pas supporté. Formats acceptés : jpg, jpeg, png, gif.");
        return;
      }
      setProfilePicture(file);
      setProfilePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!tenant.name.trim()) errors.name = "Le nom est requis.";
    if (!tenant.firstName.trim()) errors.firstName = "Le prénom est requis.";
    if (!tenant.email.trim()) {
      errors.email = "L'email est requis.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tenant.email)) errors.email = "L'email n'est pas valide.";
    }
    if (!tenant.phone.trim()) errors.phone = "Le téléphone est requis.";
    if (!tenant.dateOfBirth.trim()) errors.dateOfBirth = "La date de naissance est requise.";
    if (!tenant.userId.trim()) errors.userId = "Identifiant utilisateur manquant.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Début de la soumission du formulaire", tenant);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      console.log("Validation échouée:", errors);
      return;
    }
    setValidationErrors({});
    try {
      const formData = new FormData();
      Object.keys(tenant).forEach(key => {
        formData.append(key, tenant[key]);
      });
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      console.log("Envoi de la requête avec les données:", tenant);
      const response = await fetch('http://localhost:5000/api/tenants', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du locataire");
      }
      console.log("Locataire créé avec succès");
      // Affichage de la notification pop-up
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        // Vérifier si l'on vient du flux de création d'un bien
        if (location.state && location.state.from === "nouveau-bien") {
          // Récupérer les données du bien sauvegardées dans le localStorage
          const propertyData = localStorage.getItem("propertyFormData");
          // Redirection vers /nouveau-bien en transmettant les données du formulaire du bien
          navigate('/nouveau-bien', { state: propertyData ? JSON.parse(propertyData) : {} });
        } else {
          // Redirection vers le Dashboard Immobilier
          navigate('/immobilier');
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-6">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-greenLight text-white p-4 rounded shadow-lg z-50 w-3/4 text-center"
          >
            Locataire créé !
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-blue-900 transition"
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
              className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {profilePreview ? (
                <img src={profilePreview} alt="Aperçu" className="object-cover w-full h-full" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-greenLight text-white px-4 py-2 rounded-3xl shadow-xl hover:bg-blue-700 transition"
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
