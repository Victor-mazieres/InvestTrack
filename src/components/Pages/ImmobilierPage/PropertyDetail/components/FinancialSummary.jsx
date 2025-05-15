// src/components/FinancialSummary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatAmount } from '../utils/format';

function FinancialSummary({ travauxEstimes, totalBills, budgetRestant }) {
  return (
    <div className="space-y-1 text-gray-300">
      <div><strong>Travaux estimés :</strong><br/><span className="ml-2">{formatAmount(travauxEstimes)}</span></div>
      <div><strong>Total factures :</strong><br/><span className="ml-2">{formatAmount(totalBills)}</span></div>
      <div><strong>Budget restant :</strong><br/><span className="ml-2">{formatAmount(budgetRestant)}</span></div>
    </div>
  );
}

FinancialSummary.propTypes = {
  travauxEstimes: PropTypes.number.isRequired,
  totalBills:    PropTypes.number.isRequired,
  budgetRestant: PropTypes.number.isRequired,
};

export default React.memo(FinancialSummary);