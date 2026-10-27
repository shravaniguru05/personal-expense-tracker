import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { createTransaction, updateTransaction } from '../../api/transactions';
import { getCategories } from '../../api/categories';
import { toISODate } from '../../utils/formatters';

const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Bank Transfer',
  'Other',
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit = null,
}) {
  const isEditing = !!transactionToEdit;

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category_id: null,
    category_name: '',
    date: toISODate(),
    payment_method: 'UPI',
    notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories when opened
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (transactionToEdit) {
        setFormData({
          description: transactionToEdit.description || '',
          amount: transactionToEdit.amount || '',
          type: transactionToEdit.type || 'Expense',
          category_id: transactionToEdit.category_id || null,
          category_name: transactionToEdit.category_name || '',
          date: transactionToEdit.date || toISODate(),
          payment_method: transactionToEdit.payment_method || 'UPI',
          notes: transactionToEdit.notes || '',
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          type: 'Expense',
          category_id: null,
          category_name: '',
          date: toISODate(),
          payment_method: 'UPI',
          notes: '',
        });
      }
      setError('');
    }
  }, [isOpen, transactionToEdit]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Filter categories matching current transaction type
  const availableCategories = categories.filter(
    (c) => c.type === formData.type.toLowerCase() || c.type === 'both'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please provide a description.');
      return;
    }
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number greater than 0.');
      return;
    }
    if (!formData.category_name) {
      setError('Please select a category.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: numAmount.toFixed(2),
      };

      if (isEditing) {
        await updateTransaction(transactionToEdit.id, payload);
      } else {
        await createTransaction(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: 'Expense',
                  category_name: '',
                  category_id: null,
                }));
              }}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                formData.type === 'Expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: 'Income',
                  category_name: '',
                  category_id: null,
                }));
              }}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                formData.type === 'Income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Amount (₹ INR) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Supermarket Grocery or Monthly Salary"
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category & Payment Method in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.category_name}
              onChange={(e) => {
                const selectedCat = categories.find((c) => c.name === e.target.value);
                setFormData({
                  ...formData,
                  category_name: e.target.value,
                  category_id: selectedCat ? selectedCat.id : null,
                });
              }}
              className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any extra notes, tags, or invoice info..."
            className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit and Cancel */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
