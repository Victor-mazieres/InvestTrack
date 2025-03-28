// src/components/Pages/Errors/GeneralErrorBoundary.jsx
import React, { Component } from 'react';
import { motion } from 'framer-motion';

export default class GeneralErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur capturée par l'Error Boundary :", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center h-screen bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-red-700">Quelque chose s'est mal passé.</h1>
          <p className="mb-8">Veuillez actualiser la page ou contacter le support si le problème persiste.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
          >
            Actualiser
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
