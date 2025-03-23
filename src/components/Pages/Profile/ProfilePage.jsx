import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  ShieldAlert,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Fonctions d'action
  const handleProfile = () => navigate("/info-profile");
  const handleNotifications = () => console.log("Accéder aux Notifications");
  const handlePrivacy = () => console.log("Accéder à la Politique de confidentialité");
  const handleTerms = () => console.log("Accéder aux Conditions générales");
  const handleHelp = () => console.log("Accéder à l'Aide");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/connexion");
  };

  return (
    <div
      className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Bouton de retour */}
      <div className="px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
      </div>

      {/* Haut de page (header) */}
      <div className="flex-none px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Mon compte</h1>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 px-4 min-h-0">
        {/* Section Général */}
        <section className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Général
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center justify-between bg-white rounded-3xl p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <User className="text-gray-600" />
                <span className="text-gray-900 font-medium">Profil</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleNotifications}
              className="w-full flex items-center justify-between bg-white rounded-3xl p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <Bell className="text-gray-600" />
                <span className="text-gray-900 font-medium">Notifications</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleHelp}
              className="w-full flex items-center justify-between bg-white rounded-3xl p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="text-gray-600" />
                <span className="text-gray-900 font-medium">Aide</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Section Sécurité */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Sécurité
          </h2>
          <div className="space-y-2">
            <button
              onClick={handlePrivacy}
              className="w-full flex items-center justify-between bg-white rounded-3xl p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="text-gray-600" />
                <span className="text-gray-900 font-medium">
                  Politique de confidentialité
                </span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleTerms}
              className="w-full flex items-center justify-between bg-white rounded-3xl p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-gray-600" />
                <span className="text-gray-900 font-medium">
                  Conditions générales
                </span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          </div>
        </section>
      </div>

      {/* Bouton de déconnexion */}
      <div className="mt-auto flex-none px-4 py-3 mb-24">
        <button
          onClick={handleLogout}
          className="bg-checkred text-white w-full p-3 rounded-3xl font-bold hover:bg-red-600 transition"
        >
          <div className="flex items-center justify-center space-x-2">
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </div>
        </button>
      </div>
    </div>
  );
}
