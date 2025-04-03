// src/pages/CreateTenant.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Import de l'icône ArrowLeft
import FloatingInput from '../../PeaPage/Modules/Reutilisable/FloatingLabelInput'; // Adapté à votre structure

const CreateTenant = () => {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setTenant({ ...tenant, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', tenant.name);
      formData.append('email', tenant.email);
      formData.append('phone', tenant.phone);
      formData.append('address', tenant.address);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch('http://localhost:5000/api/tenants', {
        method: 'POST',
        body: formData, // Le Content-Type est automatiquement défini pour FormData
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du locataire");
      }
      navigate('/tenant-dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
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
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Créer un Locataire</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nom"
            name="name"
            value={tenant.name}
            onChange={handleChange}
          />
          <FloatingInput
            label="Email"
            name="email"
            value={tenant.email}
            onChange={handleChange}
          />
          <FloatingInput
            label="Téléphone"
            name="phone"
            value={tenant.phone}
            onChange={handleChange}
          />
          <FloatingInput
            label="Adresse"
            name="address"
            value={tenant.address}
            onChange={handleChange}
          />
          <div className="flex flex-col">
            <label className="mb-2 text-gray-300">Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-2 bg-gray-700 rounded"
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
