// src/components/Pages/Errors/InternalServerError.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import robotAnimation from "../../../assets/lottie/500-robot.json";

const InternalServerError = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main
      role="alert"
      className="min-h-screen w-full bg-white flex flex-col items-center justify-start px-4 text-center py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs mb-2"
      >
        <Lottie animationData={robotAnimation} loop />
      </motion.div>

      <h1 className="text-4xl font-bold text-greenLight mb-2">Erreur serveur</h1>
      <p className="text-gray-600 mb-2">
        Quelque chose s'est mal passé.
      </p>
      <p className="text-gray-600 mb-6">
       Réessaie dans un instant.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleReload}
          className="bg-primary hover:bg-primary text-white px-6 py-2 rounded-full shadow-xl transition"
        >
          Réessayer
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-greenLight hover:underline underline-offset-2 transition"
        >
          Retour au dashboard
        </button>
      </div>
    </main>
  );
};

export default InternalServerError;
