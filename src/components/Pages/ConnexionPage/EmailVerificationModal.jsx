import React, { useState } from "react";

export default function EmailVerificationModal({ onVerified, onClose }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Envoie du code à l'adresse e-mail indiquée
  const handleSendCode = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch("http://localhost:5000/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Cette ligne est obligatoire
        },
        body: JSON.stringify({ email }),
      });
  
      if (response.ok) {
        setSent(true);
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      setError("Erreur réseau lors de l'envoi du code");
    }
  };
  
  

  // Vérifie le code saisi
  const handleVerifyCode = async () => {
    const token = localStorage.getItem("token"); // Ajoute cette ligne
  
    try {
      const response = await fetch("http://localhost:5000/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ajoute cette ligne
        },
        body: JSON.stringify({ email, code }),
      });
  
      if (response.ok) {
        localStorage.setItem("emailVerified", "true");
        onVerified();
      } else {
        const data = await response.json();
        setError(data.message || "Code invalide");
      }
    } catch (err) {
      setError("Erreur réseau lors de la vérification");
    }
  };
  

  // Si l'utilisateur clique en dehors de la boîte, on ferme la pop-up
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
        {!sent ? (
          <>
            <h2 className="text-lg font-semibold text-center mb-4">
              Entrez votre adresse e-mail pour vérifier votre compte
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 text-center"
            />
            {error && <p className="text-red-500 text-center mb-2">{error}</p>}
            <button
              onClick={handleSendCode}
              className="w-full bg-blue-500 text-white py-2 rounded-xl font-bold hover:bg-blue-600"
            >
              Envoyer le code
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center mb-4">
              Un code à 6 chiffres a été envoyé à {email}
            </h2>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez le code"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 text-center"
            />
            {error && <p className="text-red-500 text-center mb-2">{error}</p>}
            <button
              onClick={handleVerifyCode}
              className="w-full bg-blue-500 text-white py-2 rounded-xl font-bold hover:bg-blue-600"
              disabled={code.length !== 6}
            >
              Vérifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}
