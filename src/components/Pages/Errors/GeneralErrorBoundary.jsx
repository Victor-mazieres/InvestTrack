import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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
          className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <AlertTriangle className="w-20 h-20 text-red-500 mb-4" />
          <h1 className="text-5xl font-extrabold mb-4 text-red-500 text-center">
            Oups, une erreur est survenue.
          </h1>
          <p className="mb-8 text-lg text-gray-300 text-center max-w-md">
            Une erreur inattendue s'est produite. Veuillez actualiser la page ou contacter le support si le problème persiste.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-checkgreen transition duration-300"
              aria-label="Actualiser la page"
            >
              Actualiser
            </button>
            <a
              href="mailto:support@example.com"
              className="px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition duration-300"
              aria-label="Contacter le support"
            >
              Contacter le support
            </a>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
