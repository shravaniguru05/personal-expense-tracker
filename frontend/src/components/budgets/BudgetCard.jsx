import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import ConfirmDialog from '../ui/ConfirmDialog';
import { deleteBudget } from '../../api/budgets';

export default function BudgetCard({ budget, onEdit, onRefresh, showToast }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isExceeded = budget.percentage_used >= 100;
  const isWarning = budget.percentage_used >= 80 && !isExceeded;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBudget(budget.id);
      showToast('Budget deleted successfully.');
      setShowConfirm(false);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete budget', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Progress bar clamped to 100 for visual width, but badge displays real percentage
  const progressWidth = Math.min(100, Math.max(0, budget.percentage_used));

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all ${
        isExceeded
          ? 'border-rose-300 shadow-rose-100 shadow-md ring-1 ring-rose-200'
          : isWarning
          ? 'border-amber-300 shadow-amber-50 shadow-md ring-1 ring-amber-200'
          : 'border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-800 text-base">
            {budget.category_name}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            Month: {budget.month}
          </span>
        </div>

        {/* Warning Badge */}
        <div>
          {isExceeded && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Exceeded ({formatPercentage(budget.percentage_used)})
            </span>
          )}
          {isWarning && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warning 80%+ ({formatPercentage(budget.percentage_used)})
            </span>
          )}
          {!isExceeded && !isWarning && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {formatPercentage(budget.percentage_used)} Used
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isExceeded
                ? 'bg-rose-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Budgeted</span>
          <span className="font-bold text-slate-800 text-sm">
            {formatCurrency(budget.budgeted_amount)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Spent</span>
          <span
            className={`font-bold text-sm ${
              isExceeded ? 'text-rose-600' : 'text-slate-700'
            }`}
          >
            {formatCurrency(budget.spent_amount)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Remaining</span>
          <span
            className={`font-bold text-sm ${
              budget.remaining_amount < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(budget.remaining_amount)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-slate-100">
        <button
          onClick={() => onEdit(budget)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          title="Edit Budget"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete Budget"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for ${budget.category_name}? Your transactions will not be deleted.`}
        confirmText="Delete Budget"
        isLoading={isDeleting}
      />
    </div>
  );
}

