import React, { useState } from 'react';
import { 
  MapPin, Home, Building, Mailbox, ChevronRight, 
  Mail, Lock, ArrowLeft, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Composant Modal pour la réinitialisation du mot de passe
 */
function ResetPasswordModal({ onClose, onConfirm }) {
  return (
    // Fond semi-transparent
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      {/* Boîte du modal */}
      <div className="relative w-11/12 max-w-md bg-white rounded-2xl p-6">
        
        {/* Bouton de fermeture (croix) en haut à droite */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        {/* Titre centré */}
        <h2 className="text-lg font-semibold text-center mb-4">
          Voulez-vous réinitialiser votre mot de passe ?
        </h2>
        
        {/* Boutons d’action */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white font-bold py-3 rounded-xl text-center hover:bg-blue-600"
          >
            Oui
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-center hover:bg-gray-200"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant principal : Profil
 */
export default function Profile() {
  const navigate = useNavigate();

  // États pour les champs
  const [country, setCountry] = useState('France');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');

  // État pour afficher/masquer la pop-up
  const [showResetModal, setShowResetModal] = useState(false);

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ country, address, city, postalCode, email });
  };

  // Déconnexion
  const handleLogout = () => {
    console.log('Déconnexion...');
  };

  // Confirmation de la réinitialisation du mot de passe
  const handleResetPassword = () => {
    console.log('Réinitialisation du mot de passe...');
    setShowResetModal(false);
  };

  return (
    <div 
      className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden" 
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Header avec flèche de retour */}
      <header className="p-4 flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col px-4 pb-20 overflow-hidden">
        <section className="flex-1 overflow-hidden">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Informations
          </h2>
          <div className="space-y-4">
            
            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-gray-600" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                  >
                    <option value="France">🇫🇷 France</option>
                    <option value="Belgique">🇧🇪 Belgique</option>
                    <option value="Suisse">🇨🇭 Suisse</option>
                  </select>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Home className="text-gray-600" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse"
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Building className="text-gray-600" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ville"
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Code postal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Postal
              </label>
              <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Mailbox className="text-gray-600" />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Code Postal"
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Adresse e-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Mail className="text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm cursor-pointer"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Lock className="text-gray-600" />
                  {/* On affiche juste des astérisques */}
                  <span className="w-full text-gray-700">********</span>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Boutons en bas (Valider + Déconnexion) */}
      <div className="absolute bottom-32 w-full flex justify-between px-4 py-3 ">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white w-5/12 p-3 rounded-xl font-bold hover:bg-red-600"
        >
          Déconnexion
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white w-5/12 p-3 rounded-xl font-bold hover:bg-blue-600"
        >
          Valider
        </button>
      </div>

      {/* Pop-up de réinitialisation du mot de passe */}
      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetPassword}
        />
      )}
    </div>
  );
}
