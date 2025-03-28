// src/components/Pages/Errors/NotFoundPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import astronautAnimation from "../../../assets/lottie/404-astronaut.json";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main
      role="alert"
      className="h-screen w-full bg-white flex flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs mb-6"
      >
        <Lottie animationData={astronautAnimation} loop />
      </motion.div>

      <h1 className="text-4xl font-bold text-greenLight mb-2">Page introuvable</h1>
      <p className="text-gray-600 mb-6">
        On dirait que tu es perdu dans l'espace…
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-primary hover:bg-primary text-white px-6 py-2 rounded-full shadow-xl transition"
        >
          Revenir en arrière
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-greenLight hover:underline underline-offset-2 transition"
        >
          Accueil
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
