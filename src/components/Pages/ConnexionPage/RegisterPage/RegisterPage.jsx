import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  // Étape 1 : saisie du nom d'utilisateur
  // Étape 2 : création du PIN
  // Étape 3 : confirmation du PIN
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Désactive le scroll sur le body pendant que cette page est active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Passage de l'étape 1 à 2 après validation du nom d'utilisateur
  const handleNextFromUsername = () => {
    const trimmedUsername = username.trim();
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!trimmedUsername) {
      setError("Veuillez entrer un nom d'utilisateur.");
      return;
    }
    if (!usernameRegex.test(trimmedUsername)) {
      setError("Le nom d'utilisateur doit être alphanumérique (sans espaces ni caractères spéciaux).");
      return;
    }
    if (trimmedUsername.length > 20) {
      setError("Le nom d'utilisateur ne doit pas dépasser 20 caractères.");
      return;
    }
    setError("");
    setStep(2);
    setPin("");
  };

  // Passage automatique de l'étape 2 à 3 dès que 6 chiffres sont saisis
  useEffect(() => {
    if (step === 2 && pin.length === 6) {
      setStep(3);
      setConfirmPin("");
    }
  }, [pin, step]);

  // Vérification automatique en étape 3
  useEffect(() => {
    if (step === 3 && confirmPin.length === 6) {
      if (pin === confirmPin) {
        setIsVerifying(true);
        const timer = setTimeout(() => {
          handleRegister();
          setIsVerifying(false);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setError("Les codes PIN ne correspondent pas. Veuillez réessayer.");
        setConfirmPin("");
      }
    }
  }, [confirmPin, pin, step]);

  const handleDigitClick = (digit) => {
    if (error) setError("");
    if (step === 2 && pin.length < 6 && !isVerifying) {
      setPin((prev) => prev + digit);
    } else if (step === 3 && confirmPin.length < 6 && !isVerifying) {
      setConfirmPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    if (step === 2) {
      setPin((prev) => prev.slice(0, -1));
    } else if (step === 3) {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleUsernameChange = (e) => {
    const { value } = e.target;
    const sanitizedValue = value.replace(/[^A-Za-z0-9]/g, "");
    setUsername(sanitizedValue);
    setError("");
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/connexion");
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      setError("Erreur réseau lors de l'inscription");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const displayLength = step === 2 ? pin.length : step === 3 ? confirmPin.length : 0;
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center overflow-hidden">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
        <AnimatePresence exitBeforeEnter>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                Inscription sur Invest<span className="text-greenLight">Track</span> !
              </h1>
              <p className="text-gray-400 mb-6">
                Entrez votre nom d'utilisateur pour créer votre compte.
              </p>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-1 text-center">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  maxLength={20}
                  required
                />
              </div>
              <button
                onClick={handleNextFromUsername}
                className="w-full bg-greenLight shadow-xl text-white py-2 rounded-full text-lg font-bold hover:bg-secondary-dark transition"
              >
                Suivant
              </button>
              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
              <p className="mt-4 text-center text-white">
                Vous avez déjà un compte ?{" "}
                <Link to="/connexion" className="text-greenLight hover:underline">
                  Connectez-vous
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                Créez votre code PIN
              </h1>
              <p className="text-gray-400 mb-6">
                Choisissez un code PIN à 6 chiffres.
              </p>
              <div className="flex items-center justify-center mb-8">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 mx-2 rounded-full border border-gray-300 ${
                      index < displayLength ? "bg-gray-900" : "bg-transparent"
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
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                Confirmez votre code PIN
              </h1>
              <p className="text-gray-400 mb-6">
                Saisissez à nouveau votre code PIN.
              </p>
              <div className="flex items-center justify-center mb-8">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 mx-2 rounded-full border border-gray-300 ${
                      index < displayLength ? "bg-gray-900" : "bg-transparent"
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
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isVerifying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full bg-greenLight flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Check size={48} className="text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-red-500 mt-4 text-center">{error}</p>
        )}
        <div className="flex items-center justify-center mt-4">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={() => setRemember(!remember)}
            className="h-5 w-5 rounded border-gray-600 accent-greenLight mr-2"
          />
          <label htmlFor="remember" className="text-sm text-gray-300">
            Se souvenir de moi
          </label>
        </div>
      </div>
    </div>
  );
}
