// src/pages/TenantDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash,
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  FileText,
  User2
} from 'lucide-react';
import { motion } from 'framer-motion';
import PrimaryButton from '../../../Reutilisable/PrimaryButton';

// Animation standard
const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: 'easeOut' } },
});

export default function TenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/tenants/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then((data) => setTenant(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="p-6 bg-noir-780 min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 bg-noir-780 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  const imageUrl = tenant.profilePicture
    ? tenant.profilePicture.startsWith('http')
      ? tenant.profilePicture
      : `http://localhost:5000/${tenant.profilePicture}`
    : null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-b from-[#0b0f14] to-[#05080a] text-gray-100 p-6"
    >
      {/* HEADER */}
      <motion.header
        variants={fadeInUp(0)}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-full shadow-md hover:bg-checkgreen transition"
        >
          <ArrowLeft className="w-6 h-6 text-greenLight" />
        </button>
        <h1 className="ml-4 text-2xl font-bold text-white">Retour</h1>
      </motion.header>

      {/* PHOTO + HEADER INFO */}
      <motion.div
        variants={fadeInUp(0.1)}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-[#0a1016]/70 rounded-3xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_20px_-12px_rgba(0,0,0,0.6)] p-6"
      >
        <div className="flex items-center gap-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${tenant.firstName || ''} ${tenant.name || ''}`}
              crossOrigin="anonymous"
              className="w-28 h-28 rounded-full object-cover border border-white/10 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
              <User2 className="w-8 h-8" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {tenant.firstName} {tenant.name}
            </h2>
            <p className="text-gray-400">{tenant.occupation || 'Profession non renseignée'}</p>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
          <QuickAction icon={<Mail className="w-4 h-4" />} label="Email" />
          <QuickAction icon={<Phone className="w-4 h-4" />} label="Appeler" />
          <QuickAction icon={<FileText className="w-4 h-4" />} label="Contrat" />
        </div>
      </motion.div>

      {/* SECTION DÉTAILS */}
      <motion.div
        variants={fadeInUp(0.2)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <SpecTile label="Email" value={tenant.email} icon={<Mail className="w-4 h-4" />} />
        <SpecTile label="Téléphone" value={tenant.phone} icon={<Phone className="w-4 h-4" />} />
        <SpecTile
          label="Date de naissance"
          value={tenant.dateOfBirth || "Non renseignée"}
          icon={<CalendarDays className="w-4 h-4" />}
        />
        <SpecTile
          label="Profession"
          value={tenant.occupation || "—"}
          icon={<Briefcase className="w-4 h-4" />}
        />
        <SpecTile
          label="Biographie"
          value={tenant.bio || "Aucune biographie"}
          icon={<FileText className="w-4 h-4" />}
        />
      </motion.div>

      {/* ACTIONS */}
      <motion.div
        variants={fadeInUp(0.3)}
        className="mt-10 flex justify-end gap-3"
      >
        <PrimaryButton onClick={() => navigate(`/tenants/edit/${tenant.id}`)}>
          Modifier
        </PrimaryButton>

        <button
          onClick={() => alert('Suppression du locataire...')}
          className="px-5 py-2 rounded-3xl font-medium text-red-400 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-2"
        >
          <Trash className="w-5 h-5" /> Supprimer
        </button>
      </motion.div>
    </motion.div>
  );
}

/* === Composants réutilisables === */
function SpecTile({ icon, label, value }) {
  return (
    <div
      className={[
        "rounded-2xl p-4 bg-[#0a1016]/60 border border-white/10 ring-1 ring-black/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_-10px_rgba(0,0,0,0.6)]"
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide">
        <span className="text-gray-300/80">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-white font-medium">{value ?? "—"}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100 text-sm transition"
    >
      <span className="text-gray-300">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
