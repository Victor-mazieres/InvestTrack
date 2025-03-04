import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPinPage() {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Désactive le scroll sur le body
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Dès que 6 chiffres sont saisis, on lance l'animation de vérification
  useEffect(() => {
    if (pin.length === 6) {
      setIsVerifying(true);
      const timer = setTimeout(() => {
        handleConfirm();
        setIsVerifying(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const handleDigitClick = (digit) => {
    if (pin.length < 6 && !isVerifying) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    if (!isVerifying) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    console.log("PIN saisi :", pin);
    // Logique de validation / redirection
    setPin("");
  };

  return (
    <div
      className="
        fixed inset-0
        bg-gradient-to-b
        from-[#2c3e50]
        to-[#bdc3c7]
        p-6
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full relative flex flex-col items-center">
        <motion.h1
          className="text-3xl font-extrabold mb-2 text-center text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bienvenue sur Invest
          <span className="text-greenLight">Track</span> !
        </motion.h1>

        <motion.p
          className="text-center text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Veuillez entrer votre code PIN pour continuer
        </motion.p>

        {/* Cercles du PIN */}
        <div className="flex items-center justify-center mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-6 h-6 mx-2 rounded-full border border-gray-300 ${
                index < pin.length ? "bg-gray-900" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Pavé numérique */}
        <div className="grid grid-cols-3 gap-8 text-2xl font-semibold mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {num}
            </motion.button>
          ))}

          {/* Bouton de biométrie */}
          <motion.button
            onClick={() => console.log("Authentification biométrique déclenchée !")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <Fingerprint size={24} />
          </motion.button>

          {/* Bouton pour le 0 */}
          <motion.button
            onClick={() => handleDigitClick("0")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            0
          </motion.button>

          {/* Bouton de suppression */}
          <motion.button
            onClick={handleBackspace}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </motion.button>
        </div>

        {/* Animation de vérification */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full bg-green-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1.3 }}
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

        <p className="mt-4 text-center text-gray-600">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-greenLight hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
