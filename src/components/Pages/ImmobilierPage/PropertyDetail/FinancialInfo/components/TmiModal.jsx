import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getTmiRate } from '../../utils/format';

export default function TmiModal({ isOpen, annualIncome, onChangeIncome, onClose, onApply }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-gray-700 text-gray-100 rounded-3xl p-6 w-11/12 max-w-md"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-white">Calculateur de TMI</h3>
            <label className="block text-sm text-gray-300 mb-2">
              Revenu imposable annuel (€)
            </label>
            <input
              type="number"
              className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-3xl px-4 py-2 mb-4"
              placeholder="ex. 35000"
              value={annualIncome}
              onChange={e => onChangeIncome(e.target.value)}
            />
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => onApply(getTmiRate(parseFloat(annualIncome)))}
                className="bg-greenLight text-gray-900 px-4 py-2 rounded-3xl shadow hover:bg-green-400"
              >
                Appliquer
              </button>
              <span className="font-semibold">
                Votre TMI :{' '}
                <span className="text-greenLight">
                  {getTmiRate(parseFloat(annualIncome))}%
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
