import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { createOrUpdateBudget, updateBudget } from '../../api/budgets';
import { getCategories } from '../../api/categories';

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  targetMonth,
  budgetToEdit = null,
}) {
  const isEditing = !!budgetToEdit;

  const [month, setMonth] = useState(targetMonth || new Date().toISOString().slice(0, 7));
  const [budgetType, setBudgetType] = useState('overall'); // 'overall' or 'category'
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExpenseCategories();
      if (budgetToEdit) {
        setMonth(budgetToEdit.month);
        setAmount(budgetToEdit.budgeted_amount || '');
        if (budgetToEdit.category_id) {
          setBudgetType('category');
          setCategoryId(budgetToEdit.category_id);
          setCategoryName(budgetToEdit.category_name);
        } else {
          setBudgetType('overall');
          setCategoryId('');
          setCategoryName('Overall Budget');
        }
      } else {
        setMonth(targetMonth || new Date().toISOString().slice(0, 7));
        setBudgetType('overall');
        setCategoryId('');
        setCategoryName('Overall Budget');
        setAmount('');
      }
      setError('');
    }
  }, [isOpen, budgetToEdit, targetMonth]);

  const loadExpenseCategories = async () => {
    try {
      const data = await getCategories('expense');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Budget amount must be a positive number greater than 0.');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && budgetToEdit.id) {
        await updateBudget(budgetToEdit.id, { amount: numAmount.toFixed(2) });
      } else {
        const payload = {
          month,
          amount: numAmount.toFixed(2),
          category_id: budgetType === 'category' ? parseInt(categoryId, 10) : null,
          category_name: budgetType === 'category' ? categoryName : 'Overall Budget',
        };
        await createOrUpdateBudget(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Budget' : 'Set Monthly Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Target Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Target Month <span className="text-rose-500">*</span>
          </label>
          <input
            type="month"
            required
            disabled={isEditing}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
          />
        </div>

        {/* Budget Scope: Overall vs Category */}
        {!isEditing && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Budget Scope
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setBudgetType('overall');
                  setCategoryId('');
                  setCategoryName('Overall Budget');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  budgetType === 'overall'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall Monthly
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('category')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  budgetType === 'category'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Category Specific
              </button>
            </div>
          </div>
        )}

        {/* Category Selector (if category specific) */}
        {budgetType === 'category' && !isEditing && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Select Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => {
                const selected = categories.find((c) => `${c.id}` === e.target.value);
                setCategoryId(e.target.value);
                setCategoryName(selected ? selected.name : '');
              }}
              className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Expense Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Budget Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Budget Limit (₹ INR) <span className="text-rose-500">*</span>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25000.00"
              className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

