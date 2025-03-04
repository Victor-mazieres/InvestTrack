import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  // Étape 1: saisie du nom d'utilisateur
  // Étape 2: création du PIN
  // Étape 3: confirmation du PIN
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

  // Passage de l'étape 1 à 2 quand le nom d'utilisateur est saisi et "Suivant" est cliqué
  const handleNextFromUsername = () => {
    if (username.trim() !== "") {
      setStep(2);
      setPin("");
      setError("");
    } else {
      setError("Veuillez entrer un nom d'utilisateur.");
    }
  };

  // Dès que 6 chiffres sont saisis en étape 2, passe automatiquement à l'étape 3 (confirmation)
  useEffect(() => {
    if (step === 2 && pin.length === 6) {
      setStep(3);
      setConfirmPin("");
    }
  }, [pin, step]);

  // Dès que 6 chiffres sont saisis en confirmation (étape 3), vérifie si les PIN correspondent
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
    if (step === 2 && pin.length < 6 && !isVerifying) {
      setPin(pin + digit);
    } else if (step === 3 && confirmPin.length < 6 && !isVerifying) {
      setConfirmPin(confirmPin + digit);
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    if (step === 2) {
      setPin(pin.slice(0, -1));
    } else if (step === 3) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleRegister = () => {
    console.log("Inscription réussie :", { username, pin });
    // Ici, vous ajouterez la logique d'inscription réelle (hachage, appel API, etc.)
    // Puis redirigez l'utilisateur vers la page de connexion
    navigate("/connexion");
  };

  // Animation variants pour les transitions entre étapes
  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Pour l'affichage des cercles, le nombre dépend de l'étape 2 ou 3
  const displayLength = step === 2 ? pin.length : step === 3 ? confirmPin.length : 0;
  // Clavier numérique fixe (chiffres 1 à 9)
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0
    bg-gradient-to-b
    from-[#2c3e50]
    to-[#bdc3c7]
    p-6
    flex
    items-center
    justify-center
    overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Inscription sur Invest
                <span className="text-greenLight">Track</span> !
              </h1>
              <p className="text-gray-500 mb-6">
                Entrez votre nom d'utilisateur pour créer votre compte.
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                onClick={handleNextFromUsername}
                className="w-full bg-secondary text-white py-2 rounded-full text-lg font-bold hover:secondary transition"
              >
                Suivant
              </button>
              {error && (
                <p className="text-red-500 mt-4 text-center">{error}</p>
              )}
              <p className="mt-4 text-secondary text-center">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Créez votre code PIN
              </h1>
              <p className="text-gray-500 mb-6">
                Choisissez un code PIN à 6 chiffres.
              </p>
              {/* Cercles pour le PIN */}
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
              {/* Clavier numérique */}
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
              {error && (
                <p className="text-red-500 mb-4 text-center">{error}</p>
              )}
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Confirmez votre code PIN
              </h1>
              <p className="text-gray-500 mb-6">
                Saisissez à nouveau votre code PIN.
              </p>
              {/* Cercles pour la confirmation */}
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
              {/* Clavier numérique pour la confirmation */}
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
              {error && (
                <p className="text-red-500 mb-4 text-center">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animation de vérification */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full bg-greenLight flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                exit={{ scale: 0 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              >
                <Check size={48} className="text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lien vers la page de connexion */}
        {step !== 1 && (
          <p className="mt-4 text-gray-600 text-center">
            Vous avez déjà un compte ?{" "}
            <Link to="/connexion" className="text-greenLight hover:underline">
              Connectez-vous
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
