// src/components/SectionLoader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from './Loader';

export default function SectionLoader({ loading, error, children }) {
  if (loading) return <Loader />;
  if (error)   return <div className="p-4 text-red-500">{error}</div>;
  return <>{children}</>;
}

SectionLoader.propTypes = {
  loading: PropTypes.bool,
  error:   PropTypes.string,
  children: PropTypes.node.isRequired,
};

SectionLoader.defaultProps = {
  loading: false,
  error:   null,
};
