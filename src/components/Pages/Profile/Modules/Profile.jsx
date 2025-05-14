// src/components/Profile.jsx

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  Building,
  Mailbox,
  ChevronRight,
  Mail,
  Lock,
  ArrowLeft,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmailVerificationModal from "../../ConnexionPage/EmailVerificationModal";

// Modal de confirmation de reset de PIN
function ConfirmResetModal({ onConfirm, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 rounded-3xl p-6 w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-center mb-4 text-gray-100">
          Voulez-vous réinitialiser votre mot de passe ?
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-3 rounded-3xl text-center hover:bg-blue-700 transition"
          >
            Oui
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-3xl text-center hover:bg-gray-600 transition"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

// Clavier numérique pour entrer un nouveau PIN
function PinKeyboardModal({ onConfirm, onClose }) {
  const [pin, setPin] = useState("");
  const displayLength = pin.length;
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 rounded-3xl shadow-xl p-8 w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-extrabold text-gray-100">
            Entrez votre nouveau PIN
          </h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-6 h-6 mx-2 rounded-full border border-gray-500 ${
                i < displayLength ? "bg-gray-100" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-10 text-3xl font-semibold mb-8">
          {digits.map((d) => (
            <button
              key={d}
              onClick={() => pin.length < 6 && setPin((p) => p + d)}
              className="w-16 h-16 rounded-full bg-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-600 transition"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => pin.length < 6 && setPin((p) => p + "0")}
            className="w-16 h-16 rounded-full bg-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-600 transition"
          >
            0
          </button>
          <button
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="w-16 h-16 rounded-full bg-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-600 transition"
          >
            <ArrowLeft size={24} className="text-gray-100" />
          </button>
        </div>

        <button
          onClick={() => pin.length === 6 && onConfirm(pin)}
          disabled={pin.length !== 6}
          className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Confirmer
        </button>
      </div>
    </div>
  );
}

// Toast de notifications
function Toast({ message, type = "success", onClose, progress }) {
  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white px-4 py-3 rounded-xl shadow-lg z-50 w-3/4`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{message}</span>
        <button onClick={onClose}>
          <X className="text-white w-5 h-5 hover:text-gray-200 transition" />
        </button>
      </div>
      <div
        className={`w-full ${
          type === "success" ? "bg-green-300" : "bg-red-300"
        } h-1 mt-2 rounded-xl overflow-hidden`}
      >
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  // États utilisateur
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("France");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");

  // États UI
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [progress, setProgress] = useState(100);

  // Vérification e-mail
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Reset PIN
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showPinKeyboard, setShowPinKeyboard] = useState(false);

  // Barre de progression du toast
  useEffect(() => {
    if (!notification) return;
    setProgress(100);
    const total = 3000,
      step = 30,
      start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = 100 - (elapsed / total) * 100;
      if (pct <= 0) {
        clearInterval(timer);
        setNotification("");
      } else {
        setProgress(pct);
      }
    }, step);
    return () => clearInterval(timer);
  }, [notification]);

  // Chargement du profil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError(true);
      setLoading(false);
      setNotification("Veuillez vous connecter pour accéder à votre profil");
      setNotificationType("error");
      setTimeout(() => navigate("/connexion"), 2000);
      return;
    }

    fetch("http://localhost:5000/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401)
            throw new Error("Session expirée, veuillez vous reconnecter");
          throw new Error("Erreur lors du chargement du profil");
        }
        return res.json();
      })
      .then((data) => {
        setUsername(data.username || "");
        setCountry(data.country || "France");
        setAddress(data.address || "");
        setCity(data.city || "");
        setPostalCode(data.postalCode || "");
        setEmail(data.email || "");
        setEmailVerified(data.emailVerified);

        // Si mail présent et non vérifié → afficher la modal
        if (data.email && data.emailVerified === false) {
                 setShowVerifyModal(true);
         }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setAuthError(true);
        setLoading(false);
        setNotification(err.message);
        setNotificationType("error");
        if (err.message.includes("Session expirée")) {
          localStorage.removeItem("token");
          setTimeout(() => navigate("/connexion"), 2000);
        }
      });
  }, [navigate]);

  // Soumission du profil
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification("Veuillez vous connecter pour mettre à jour votre profil");
      setNotificationType("error");
      setTimeout(() => navigate("/connexion"), 2000);
      return;
    }

    const updateData = { country, address, city, postalCode, email };
    fetch("http://localhost:5000/auth/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401)
            throw new Error("Session expirée, veuillez vous reconnecter");
          throw new Error("Erreur lors de la mise à jour du profil");
        }
        return res.json();
      })
      .then(({ user }) => {
        setNotification("✅ Profil mis à jour avec succès !");
        setNotificationType("success");

        // Mettre à jour le flag et, si nécessaire, afficher la modal
        setEmailVerified(user.emailVerified);
        if (user.email && !user.emailVerified) {
          setShowVerifyModal(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setNotification(err.message);
        setNotificationType("error");
        if (err.message.includes("Session expirée")) {
          localStorage.removeItem("token");
          setTimeout(() => navigate("/connexion"), 2000);
        }
      });
  };

  // Réinitialisation du PIN
  const handleResetPassword = (newPin) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowPinKeyboard(false);
      setNotification("Veuillez vous connecter pour réinitialiser votre mot de passe");
      setNotificationType("error");
      setTimeout(() => navigate("/connexion"), 2000);
      return;
    }

    fetch("http://localhost:5000/auth/reset-pin", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: newPin }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401)
            throw new Error("Session expirée, veuillez vous reconnecter");
          throw new Error("Erreur lors de la réinitialisation du PIN");
        }
        return res.json();
      })
      .then(() => {
        setShowPinKeyboard(false);
        setNotification("✅ PIN mis à jour avec succès !");
        setNotificationType("success");
      })
      .catch((err) => {
        console.error(err);
        setShowPinKeyboard(false);
        setNotification(err.message);
        setNotificationType("error");
        if (err.message.includes("Session expirée")) {
          localStorage.removeItem("token");
          setTimeout(() => navigate("/connexion"), 2000);
        }
      });
  };

  // États intermédiaires
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
        <p className="mt-4 text-lg">Chargement...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-100 px-4">
        {notification && (
          <Toast
            message={notification}
            type={notificationType}
            onClose={() => setNotification("")}
            progress={progress}
          />
        )}
        <div className="bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erreur d'authentification</h2>
          <p className="mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <button
            onClick={() => navigate("/connexion")}
            className="bg-blue-600 text-white w-full p-3 rounded-3xl font-bold hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // UI principale
  return (
    <div className="min-h-screen text-gray-100 overflow-hidden p-6">
      {notification && (
        <Toast
          message={notification}
          type={notificationType}
          onClose={() => setNotification("")}
          progress={progress}
        />
      )}

      {showVerifyModal && (
        <EmailVerificationModal
          onVerified={() => {
            localStorage.setItem("emailVerified", "true");
            setEmailVerified(true);
            setShowVerifyModal(false);
          }}
          onClose={() => setShowVerifyModal(false)}
        />
      )}

      <header className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 overflow-hidden">
        <section className="flex-1 overflow-hidden">
          <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Informations
          </h2>
          <div className="space-y-4">
            {/* Nom d'utilisateur (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom d'utilisateur
              </label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <span className="w-full text-gray-100">{username}</span>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pays</label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-gray-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-gray-100"
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Adresse</label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Home className="text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse"
                    className="w-full bg-transparent focus:outline-none text-gray-100"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ville</label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Building className="text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ville"
                    className="w-full bg-transparent focus:outline-none text-gray-100"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Code postal */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Code Postal
              </label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Mailbox className="text-gray-400" />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Code Postal"
                    className="w-full bg-transparent focus:outline-none text-gray-100"
                  />
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>

            {/* Adresse e-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adresse e-mail
              </label>
              <div className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full">
                  <Mail className="text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-transparent focus:outline-none text-gray-100"
                    readOnly={emailVerified}
                  />
                </div>
                {emailVerified ? (
                  <Check className="text-green-500" />
                ) : (
                  <ChevronRight className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Mot de passe (reset) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <div
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm cursor-pointer"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Lock className="text-gray-400" />
                  <span className="w-full text-gray-300">********</span>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Bouton Valider */}
        <div className="w-full flex justify-end mt-12">
          <button
            type="submit"
            className="bg-greenLight text-white w-5/12 p-3 rounded-3xl font-bold mr-6 hover:bg-checkgreen transition"
          >
            Valider
          </button>
        </div>
      </form>

      {showConfirmReset && (
        <ConfirmResetModal
          onConfirm={() => {
            setShowConfirmReset(false);
            setShowPinKeyboard(true);
          }}
          onClose={() => setShowConfirmReset(false)}
        />
      )}

      {showPinKeyboard && (
        <PinKeyboardModal onConfirm={handleResetPassword} onClose={() => setShowPinKeyboard(false)} />
      )}
    </div>
  );
}
