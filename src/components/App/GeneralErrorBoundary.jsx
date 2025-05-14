// src/components/Pages/Errors/GenralErrorBoundary.jsx
import React from 'react';
import { useRouteError } from 'react-router-dom';

/**
 * Composant de fallback par défaut pour les erreurs
 */
const DefaultErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-red-50 rounded-lg m-4">
      <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-4 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Une erreur est survenue</h2>
        <p className="text-sm mb-4">{error?.message || "Erreur inconnue"}</p>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Error Boundary amélioré avec support pour react-router et reset
 */
class GeneralErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Possibilité d'ajouter un logging d'erreur ici
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null });
    
    // Appel du handler de reset personnalisé si fourni
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      // Utilisation du fallback personnalisé ou du fallback par défaut
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour utiliser l'error boundary avec react-router
 */
export const useErrorHandler = () => {
  const routeError = useRouteError();
  
  if (routeError) {
    return <DefaultErrorFallback error={routeError} />;
  }
  
  return null;
};

export default GeneralErrorBoundary;