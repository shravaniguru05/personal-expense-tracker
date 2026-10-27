import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getBudgets } from '../api/budgets';
import { formatMonthName } from '../utils/formatters';

export default function BudgetsPage() {
  const { showToast, refreshTrigger, setRefreshTrigger } = useOutletContext();

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, [currentMonth, refreshTrigger]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await getBudgets(currentMonth);
      setBudgets(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch budgets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const overallBudget = budgets.find((b) => b.category_id === null);
  const categoryBudgets = budgets.filter((b) => b.category_id !== null);

  return (
    <div className="space-y-6">
      {/* Header and Month Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Budget Management
          </h2>
          <p className="text-xs text-slate-500">
            Set and track spending limits for {formatMonthName(currentMonth)}.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none"
            />
          </div>

          {/* Add Budget Button */}
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing budget limits and spending..." />
      ) : (
        <>
          {/* Overall Monthly Budget Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Overall Monthly Limit
            </h3>
            {overallBudget ? (
              <div className="max-w-2xl">
                <BudgetCard
                  budget={overallBudget}
                  onEdit={(b) => {
                    setEditingBudget(b);
                    setIsModalOpen(true);
                  }}
                  onRefresh={fetchBudgets}
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 max-w-2xl text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No overall budget set for {formatMonthName(currentMonth)}
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Define an overall spending ceiling to receive 80% threshold warnings and balance alerts.
                </p>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Set Overall Budget
                </button>
              </div>
            )}
          </div>

          {/* Category Budgets Section */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Category Budgets ({categoryBudgets.length})
            </h3>

            {categoryBudgets.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No category budgets defined for this month
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Set limits on Food & Dining, Shopping, Travel, etc., to monitor category-specific expenses.
                </p>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Set Category Budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBudgets.map((b) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    onEdit={(item) => {
                      setEditingBudget(item);
                      setIsModalOpen(true);
                    }}
                    onRefresh={fetchBudgets}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        targetMonth={currentMonth}
        budgetToEdit={editingBudget}
        onSuccess={() => {
          showToast(
            editingBudget
              ? 'Budget updated successfully!'
              : 'Budget configured successfully!'
          );
          setIsModalOpen(false);
          setEditingBudget(null);
          fetchBudgets();
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
