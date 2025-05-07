// src/components/BillsSection.jsx
import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { Loader } from './Loader';
import { formatAmount, formatDate } from '../utils/format';
import { Plus, Trash2 } from 'lucide-react';

const initialForm = { title: '', amount: '', file: null };
function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialForm;
    default:
      return state;
  }
}

function BillsSection({
  bills,
  loading,
  addBill,
  deleteBill,
  travauxEstimes,
  totalBills,
  budgetRestant,
}) {
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [showForm, setShowForm] = React.useState(false);

  const onSubmit = e => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('amount', form.amount);
    data.append('file', form.file);
    addBill(data);
    dispatch({ type: 'RESET' });
    setShowForm(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Résumé financier */}
      <div className="space-y-1 text-gray-300">
        <div>
          <strong>Travaux estimés :</strong><br/>
          <span className="ml-2">{formatAmount(travauxEstimes)}</span>
        </div>
        <div>
          <strong>Total factures :</strong><br/>
          <span className="ml-2">{formatAmount(totalBills)}</span>
        </div>
        <div>
          <strong>Budget restant :</strong><br/>
          <span className="ml-2">{formatAmount(budgetRestant)}</span>
        </div>
      </div>

      {/* Liste des factures */}
      {bills.length > 0 ? bills.map(b => (
        <div
          key={b.id}
          className="flex justify-between items-center bg-gray-700 p-2 rounded"
        >
          <div>
            <div className="font-semibold text-white">{b.title}</div>
            <div className="text-gray-300 text-sm">
              {formatDate(b.date)} — {formatAmount(b.amount)}
            </div>
          </div>
          <button
            onClick={() => deleteBill(b.id)}
            className="p-1 hover:bg-gray-600 rounded"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )) : (
        <p className="text-gray-400">Aucune facture pour le moment.</p>
      )}

      {/* Formulaire / bouton d’ajout */}
      {showForm ? (
        <form onSubmit={onSubmit} className="bg-gray-700 p-4 rounded-2xl space-y-2">
          {['title', 'amount', 'file'].map(field => (
            <div key={field}>
              <label className="block text-gray-400">
                {field === 'file'
                  ? 'Document'
                  : field === 'amount'
                  ? 'Montant (€)'
                  : 'Titre'}
              </label>
              <input
                type={field === 'amount' ? 'number' : field === 'file' ? 'file' : 'text'}
                step={field === 'amount' ? '.01' : undefined}
                value={field === 'file' ? undefined : form[field]}
                onChange={e =>
                  dispatch({
                    type: 'FIELD',
                    field,
                    value: field === 'file' ? e.target.files[0] : e.target.value,
                  })
                }
                className="w-full bg-gray-600 p-2 rounded-2xl text-white"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); dispatch({ type: 'RESET' }); }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-2xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-greenLight text-white hover:bg-green-500 rounded-2xl"
            >
              Envoyer
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-greenLight rounded-2xl hover:bg-green-500 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter</span>
        </button>
      )}
    </div>
  );
}

BillsSection.propTypes = {
  bills:          PropTypes.array.isRequired,
  loading:        PropTypes.bool.isRequired,
  addBill:        PropTypes.func.isRequired,
  deleteBill:     PropTypes.func.isRequired,
  travauxEstimes: PropTypes.number.isRequired,
  totalBills:     PropTypes.number.isRequired,
  budgetRestant:  PropTypes.number.isRequired,
};

export default React.memo(BillsSection);
