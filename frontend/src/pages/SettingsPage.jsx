import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Database,
  Coins,
  ShieldCheck,
  Server,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getCategories, deleteCategory } from '../api/categories';
import { seedDemoData, resetData } from '../api/dashboard';
import { getCategoryIcon } from '../utils/icons';
import apiClient from '../api/client';

export default function SettingsPage() {
  const { showToast, refreshTrigger, setRefreshTrigger } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiHealthy, setApiHealthy] = useState(null);

  // Category modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Delete category
  const [deleteCatId, setDeleteCatId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadData();
    checkHealth();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await apiClient.get('/api/health');
      setApiHealthy(res.data.status === 'healthy');
    } catch (err) {
      setApiHealthy(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      setIsDeleting(true);
      await deleteCategory(deleteCatId);
      showToast('Category deleted successfully.');
      setDeleteCatId(null);
      loadData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const res = await resetData();
      showToast(res.message || 'All data reset.');
      setShowResetConfirm(false);
      loadData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to reset data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await seedDemoData();
      showToast(res.message || 'Demo data loaded.');
      loadData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to load demo data', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Settings & Categories
          </h2>
          <p className="text-xs text-slate-500">
            Manage spending categories, view system health, and control demo database state.
          </p>
        </div>

        <button
          onClick={() => {
            setCategoryToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* System Health & Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Backend Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  apiHealthy ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                }`}
              />
              <span className="font-extrabold text-slate-800 text-sm">
                {apiHealthy ? 'FastAPI Connected (Healthy)' : 'Offline / Error'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Port 8000 REST API</p>
          </div>
        </div>

        {/* Currency Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Default Currency
            </span>
            <div className="font-extrabold text-slate-800 text-sm mt-1">
              Indian Rupee — INR (₹)
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Formatted using Indian Lakhs & Crores standard
            </p>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Database Engine
            </span>
            <div className="font-extrabold text-slate-800 text-sm mt-1">
              SQLite (SQLAlchemy ORM)
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Persistent storage in expense_tracker.db
            </p>
          </div>
        </div>
      </div>

      {/* Categories Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Expense & Income Categories</h3>
            <p className="text-xs text-slate-400">
              Categories used to tag and summarize financial operations.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
            {categories.length} Total
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading categories..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Icon & Color</th>
                  <th className="py-3 px-5">Category Name</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Classification</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: c.color || '#64748B' }}
                        >
                          {getCategoryIcon(c.icon, { className: 'w-4 h-4' })}
                        </div>
                        <span className="text-xs font-mono text-slate-400">{c.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                          c.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : c.type === 'expense'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap text-xs text-slate-500">
                      {c.is_default ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          System Default
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">User Custom</span>
                      )}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setCategoryToEdit(c);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!c.is_default && (
                          <button
                            onClick={() => setDeleteCatId(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demo Data & Danger Zone Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Database Management & Demo Tools</h3>
          <p className="text-xs text-slate-400">
            For academic and DevOps demonstration, you can load realistic demo records or reset the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSeedDemo}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Transactions & Budgets</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear / Reset All Database Records</span>
          </button>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSuccess={() => {
          showToast(
            categoryToEdit
              ? 'Category updated successfully!'
              : 'Category created successfully!'
          );
          setIsModalOpen(false);
          setCategoryToEdit(null);
          loadData();
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Confirm Category Delete */}
      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this custom category? Existing transactions with this category will have their category link unassigned."
        confirmText="Delete Category"
        isLoading={isDeleting}
      />

      {/* Confirm Reset Database */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Entire Database"
        message="Warning: This will permanently delete all transactions, budgets, and user-created custom categories. Default categories will be restored."
        confirmText="Reset Entire Database"
        isLoading={isResetting}
      />
    </div>
  );
}
