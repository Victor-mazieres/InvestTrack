// src/pages/components/TenantTab.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader } from './Loader';
import DetailItem from './DetailItem';

const TenantTab = ({ ownerId, active }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!active || !ownerId) return;

    setLoading(true);
    fetch(`/api/tenants/${ownerId}`, {
      headers: { Accept: 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTenant(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [active, ownerId]);

  if (loading) return <Loader />;
  if (error)   return <div className="text-red-500">Erreur : {error}</div>;
  if (!tenant) return <div className="text-gray-400">Aucun locataire sélectionné.</div>;

  return (
    <div className="space-y-2">
      <DetailItem label="Nom"       value={`${tenant.firstName} ${tenant.name}`} />
      <DetailItem label="Email"     value={tenant.email} />
      <DetailItem label="Téléphone" value={tenant.phone} />
      {/* Ajouter d'autres champs si nécessaire */}
    </div>
  );
};

TenantTab.propTypes = {
  ownerId: PropTypes.string,
  active:  PropTypes.bool.isRequired,
};

export default TenantTab;
