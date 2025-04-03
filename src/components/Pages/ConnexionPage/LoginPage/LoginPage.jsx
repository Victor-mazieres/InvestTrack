import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowLeft, X, Lock, MapPin, Home, Building, Mailbox, ChevronRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPinPage() {
  const [username, setUsername] = useState("");
  const [remember, setRemember] = useState(false);
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();

  // À l'initialisation, vérifie si un username a été sauvegardé
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRemember(true);
    }
  }, []);

  // Désactivation du scroll sur le body pendant cette page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Safety net pour la vérification
  useEffect(() => {
    if (isVerifying) {
      setProgress(100);
      const totalTime = 2000;
      const intervalTime = 30;
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = 100 - (elapsed / totalTime) * 100;
        if (newProgress <= 0) {
          clearInterval(timer);
          setProgress(0);
          setNotification("");
          navigate("/profile");
        } else {
          setProgress(newProgress);
        }
      }, intervalTime);
      return () => clearInterval(timer);
    }
  }, [isVerifying, navigate]);

  // Déclenche la validation dès que 6 chiffres sont entrés
  useEffect(() => {
    if (pin.length === 6 && !isVerifying) {
      handleConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, isVerifying]);

  const handleDigitClick = (digit) => {
    if (error) setError("");
    if (pin.length < 6 && !isVerifying) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (!isVerifying) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  // Filtre pour conserver uniquement les caractères alphanumériques pour le username
  const handleUsernameChange = (e) => {
    const { value } = e.target;
    const sanitizedValue = value.replace(/[^A-Za-z0-9]/g, "");
    setUsername(sanitizedValue);
    setError("");
  };

  const handleConfirm = async () => {
    if (pin.length !== 6) return;
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Veuillez entrer votre nom d'utilisateur.");
      setPin("");
      return;
    }
    // Sauvegarde du username selon le choix
    if (remember) {
      localStorage.setItem("savedUsername", trimmedUsername);
    } else {
      localStorage.removeItem("savedUsername");
    }
    setIsVerifying(true);
    try {
      const response = await fetch("http://localhost:5000/auth/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, pin }),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        // data reste vide
      }
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Identifiants invalides");
      }
    } catch (err) {
      setError("Erreur réseau lors de la connexion");
    } finally {
      setIsVerifying(false);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center overflow-hidden">
      <div className="bg-gray-800 rounded-3xl shadow-xl p-8 max-w-xl w-full relative flex flex-col items-center">
        <motion.h1
          className="text-3xl font-extrabold mb-2 text-center text-gray-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {remember && username ? (
            <>
              Bienvenue <span className="text-greenLight">{username}</span> !
            </>
          ) : (
            <>
              Bienvenue sur Invest<span className="text-greenLight">Track</span> !
            </>
          )}
        </motion.h1>
        {!(remember && username) && (
          <div className="w-full mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1 text-center">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Votre nom d'utilisateur"
              className="w-full p-2 border border-gray-600 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-gray-100"
              maxLength={20}
            />
          </div>
        )}
        <motion.p
          className="text-center text-gray-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Veuillez entrer votre code PIN pour continuer
        </motion.p>
        {/* Affichage des cercles du PIN */}
        <div className="flex items-center justify-center mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-6 h-6 mx-2 rounded-full border border-gray-600 ${
                index < pin.length ? "bg-gray-100" : "bg-transparent"
              }`}
            />
          ))}
        </div>
        {/* Clavier numérique */}
        <div className="grid grid-cols-3 gap-8 text-2xl font-semibold mb-8 text-white">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-gray-800 shadow-xl flex items-center justify-center hover:bg-gray-700 transition"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            onClick={() => handleDigitClick("0")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-gray-800 shadow-xl flex items-center justify-center hover:bg-gray-700 transition"
          >
            0
          </motion.button>
          <motion.button
            onClick={handleBackspace}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-gray-800 shadow-xl flex items-center justify-center hover:bg-gray-700 transition"
          >
            <ArrowLeft size={24} className="text-gray-100"/>
          </motion.button>
        </div>
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full bg-green-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1.3 }}
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
        <p className="mt-4 text-center text-gray-400">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-greenLight hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
