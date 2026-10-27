import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { createCategory, updateCategory } from '../../api/categories';
import { AVAILABLE_ICONS, getCategoryIcon } from '../../utils/icons';

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit = null,
}) {
  const isEditing = !!categoryToEdit;

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: 'Tag',
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name || '',
          type: categoryToEdit.type || 'expense',
          icon: categoryToEdit.icon || 'Tag',
          color: categoryToEdit.color || '#3B82F6',
        });
      } else {
        setFormData({
          name: '',
          type: 'expense',
          icon: 'Tag',
          color: '#3B82F6',
        });
      }
      setError('');
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateCategory(categoryToEdit.id, formData);
      } else {
        await createCategory(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create Custom Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Category Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Subscriptions or Gym"
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Category Type
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            {['expense', 'income', 'both'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                  formData.type === t
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData({ ...formData, color: c })}
                className={`w-7 h-7 rounded-full transition-transform ${
                  formData.color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Icon Identifier
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded-xl">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setFormData({ ...formData, icon: iconName })}
                className={`p-2.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                  formData.icon === iconName
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getCategoryIcon(iconName, { className: 'w-5 h-5' })}
              </button>
            ))}
          </div>
        </div>

        {/* Submit and Cancel */}
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
            {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

