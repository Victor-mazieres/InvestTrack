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
    <div className="min-h-screen text-gray-100 flex flex-col overflow-hidden p-6">
      {/* Bouton de retour */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
      </div>
      {/* Haut de page */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mon compte</h1>
      </div>
      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        {/* Section Général */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Général
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-3">
                <User className="text-gray-400" />
                <span className="font-medium">Profil</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleNotifications}
              className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-3">
                <Bell className="text-gray-400" />
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleHelp}
              className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="text-gray-400" />
                <span className="font-medium">Aide</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          </div>
        </section>
        {/* Section Sécurité */}
        <section>
          <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Sécurité
          </h2>
          <div className="space-y-2">
            <button
              onClick={handlePrivacy}
              className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="text-gray-400" />
                <span className="font-medium">
                  Politique de confidentialité
                </span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={handleTerms}
              className="w-full flex items-center justify-between bg-gray-800 rounded-3xl p-3 shadow-sm hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-gray-400" />
                <span className="font-medium">Conditions générales</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          </div>
        </section>
      </div>
      {/* Bouton de déconnexion */}
      <div className="mt-auto mb-36 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-checkred text-white px-8 py-3 rounded-3xl font-semibold shadow-xl hover:bg-red-600 transition flex items-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
