// src/components/Pages/Errors/UnauthorizedPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import lockAnimation from "../../../assets/lottie/401-lock.json";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <main
      role="alert"
      className="h-screen w-full bg-white flex flex-col items-center justify-start px-4 py-16 text-center gap-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs h-52"
      >
        <Lottie animationData={lockAnimation} loop />
      </motion.div>

      <h1 className="text-4xl font-bold text-yellow-500">Accès refusé</h1>
      <p className="text-gray-600">
        {isLoggedIn
          ? "Tu n'as pas l'autorisation pour accéder à cette page."
          : "Connecte-toi pour accéder à cette page sécurisée."}
      </p>

      {isLoggedIn ? (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full shadow-md transition"
          >
            Revenir en arrière
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-yellow-600 hover:underline underline-offset-2 transition text-sm"
          >
            Accueil
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => navigate("/connexion")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full shadow-md transition"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate("/inscription")}
            className="text-yellow-600 hover:underline underline-offset-2 transition text-sm"
          >
            Créer un compte
          </button>
        </div>
      )}
    </main>
  );
};

export default UnauthorizedPage;
