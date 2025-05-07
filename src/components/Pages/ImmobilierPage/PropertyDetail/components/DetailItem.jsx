// src/components/DetailItem.jsx
import React from 'react';
import PropTypes from 'prop-types';

function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <p className="font-bold text-gray-400">{label}</p>
      <span className="text-greenLight">{value ?? 'Non défini'}</span>
    </div>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default React.memo(DetailItem);
