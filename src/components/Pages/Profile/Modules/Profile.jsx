// Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Home, Building, Mailbox, ChevronRight, Mail, Lock, ArrowLeft, X, Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function ConfirmResetModal({ onConfirm, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-center mb-4">
          Voulez-vous réinitialiser votre mot de passe ?
        </h2>
        <div className="flex space-x-4">
          <button 
            onClick={onConfirm} 
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-center hover:bg-blue-600"
          >
            Oui
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-center hover:bg-gray-200"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function PinKeyboardModal({ onConfirm, onClose }) {
  const [pin, setPin] = useState("");
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const displayLength = pin.length;

  const handleDigitClick = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleConfirm = () => {
    if (pin.length === 6) {
      onConfirm(pin);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-8 w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-extrabold text-center">
            Entrez votre nouveau PIN
          </h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="flex items-center justify-center mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-6 h-6 mx-2 rounded-full border border-gray-400 ${
                index < displayLength ? "bg-black" : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-10 text-2xl font-semibold mb-8">
          {digits.map((num) => (
            <button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigitClick("0")}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <button
          onClick={handleConfirm}
          disabled={pin.length !== 6}
          className="w-full bg-primary text-white py-2 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50"
        >
          Confirmer
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("France");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let interval;
    if (notification) {
      setProgress(100);
  
      const totalTime = 2000; // 3 secondes
      const intervalTime = 30;
      const decrement = 100 / (totalTime / intervalTime);
      const startTime = Date.now();
  
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = 100 - (elapsed / totalTime) * 100;
  
        if (newProgress <= 0) {
          clearInterval(interval);
          setProgress(0);
          setNotification("");
          navigate("/profile"); // si tu veux la redirection exactement ici
        } else {
          setProgress(newProgress);
        }
      }, intervalTime);
    }
  
    return () => clearInterval(interval);
  }, [notification, navigate]);
  
  
  

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showPinKeyboard, setShowPinKeyboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/connexion");
      return;
    }
    fetch("http://localhost:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setCountry(data.country || "France");
        setAddress(data.address || "");
        setCity(data.city || "");
        setPostalCode(data.postalCode || "");
        setEmail(data.email || "");
      })
      .catch((err) => console.error("Erreur de chargement du profil :", err));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const updateData = { country, address, city, postalCode, email };
  
    fetch("http://localhost:5000/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => {
        if (res.ok) {
          setNotification("✅ Profil mis à jour avec succès !");
          setTimeout(() => {
            setNotification("");
            navigate("/profile");
          }, 3000);
        } else {
          throw new Error("Erreur lors de la mise à jour du profil");
        }
      })
      .catch(() => {
        setNotification("❌ Erreur lors de la mise à jour du profil");
        setTimeout(() => setNotification(""), 3000);
      });
  };
  

  const handleResetPassword = (newPin) => {
    const token = localStorage.getItem("token");
    const updateData = { pin: newPin };
    fetch("http://localhost:5000/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => res.json())
      .then(() => {
        setShowPinKeyboard(false);
        setError("");
      })
      .catch(() => {
        setError("Erreur lors de la réinitialisation du mot de passe");
      });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      
      {notification && (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 w-3/4">
    <div className="flex items-center justify-between">
      <span className="font-semibold">{notification}</span>
      <button onClick={() => setNotification("")}>
        <X className="text-white w-5 h-5 hover:text-gray-200 transition" />
      </button>
    </div>
    <div className="w-full bg-green-300 h-1 mt-2 rounded-xl overflow-hidden">
      <div
        className="h-full bg-white transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}



      <header className="p-4 flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition">
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-secondary">Retour</h1>
      </header>

      <div className="flex-1 flex flex-col px-4 pb-20 overflow-hidden">
        <section className="flex-1 overflow-hidden">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Informations</h2>
          <div className="space-y-4">
            {/* Nom d'utilisateur en lecture seule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <div className="w-full flex items-center justify-between bg-gray-100 rounded-xl p-3 shadow-sm">
                <span className="w-full text-gray-900">{username}</span>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
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
            {/* Adresse e-mail vérifiée avec icône */}
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
                    placeholder="votre@email.com"
                    className="w-full bg-transparent focus:outline-none"
                    readOnly={localStorage.getItem("emailVerified") === "true"}
                  />
              </div>
                {localStorage.getItem("emailVerified") === "true" ? (
                  <Check className="text-green-500" />
                ) : (
                  <ChevronRight className="text-gray-400" />
                )}
              </div>
            </div>


            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div 
                onClick={() => setShowConfirmReset(true)} 
                className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm cursor-pointer"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Lock className="text-gray-600" />
                  <span className="w-full text-gray-700">********</span>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bouton "Valider" */}
      <div className="absolute bottom-5 w-full flex justify-end px-4 py-3">
        <button 
          onClick={handleSubmit} 
          className="bg-primary text-white w-5/12 p-3 rounded-xl font-bold"
        >
          Valider
        </button>
      </div>

      {showConfirmReset && (
        <ConfirmResetModal 
          onConfirm={() => { setShowConfirmReset(false); setShowPinKeyboard(true); }} 
          onClose={() => setShowConfirmReset(false)} 
        />
      )}

      {showPinKeyboard && (
        <PinKeyboardModal 
          onConfirm={handleResetPassword} 
          onClose={() => setShowPinKeyboard(false)} 
        />
      )}

      {error && (
        <p className="text-red-500 mt-4 text-center">{error}</p>
      )}
    </div>
  );
}
