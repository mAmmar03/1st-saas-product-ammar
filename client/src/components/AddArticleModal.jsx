import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AddArticleModal({ isOpen, onClose, onSuccess, articleToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    articleCode: '',
    category: 'Kaftan',
    totalPRQuota: 6,
    unitCost: 3500,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (articleToEdit) {
      setFormData({
        name: articleToEdit.name || '',
        articleCode: articleToEdit.articleCode || '',
        category: articleToEdit.category || 'General',
        totalPRQuota: articleToEdit.totalPRQuota ?? 6,
        unitCost: articleToEdit.unitCost ?? 0,
        notes: articleToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        articleCode: '',
        category: 'Kaftan',
        totalPRQuota: 6,
        unitCost: 3500,
        notes: '',
      });
    }
    setError('');
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.articleCode || !formData.totalPRQuota) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (articleToEdit?._id) {
        await api.updateArticle(articleToEdit._id, {
          name: formData.name,
          category: formData.category,
          totalPRQuota: Number(formData.totalPRQuota),
          unitCost: Number(formData.unitCost) || 0,
          notes: formData.notes,
        });
      } else {
        await api.createArticle({
          ...formData,
          totalPRQuota: Number(formData.totalPRQuota),
          unitCost: Number(formData.unitCost) || 0,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-md w-full overflow-hidden text-xs font-sans animate-modal-in">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                {articleToEdit ? 'Edit PR Article & Stock' : 'Add PR Article & Stock Quota'}
              </h3>
              <p className="text-xs text-slate-400">
                {articleToEdit ? 'Modify garment information and PR quota' : 'Register garment and allocate PR giveaway units'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Article / Outfit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emerald Kaftan with Pearl Handwork"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Article Code / SKU *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(articleToEdit)}
                placeholder="e.g. SC-KAF-01"
                value={formData.articleCode}
                onChange={(e) =>
                  setFormData({ ...formData, articleCode: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 uppercase font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              >
                <option value="Kaftan">Kaftan</option>
                <option value="Pret">Pret 2-Piece / 3-Piece</option>
                <option value="Festive">Festive Luxury</option>
                <option value="Unstitched">Unstitched Lawn/Silk</option>
                <option value="Western">Western / Co-ords</option>
                <option value="Accessories">Accessories</option>
                <option value="General">General Apparel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Total PR Quota (Pieces) *
              </label>
              <input
                type="number"
                min={articleToEdit ? (articleToEdit.sentPieces || 0) : 1}
                max={500}
                required
                value={formData.totalPRQuota}
                onChange={(e) =>
                  setFormData({ ...formData, totalPRQuota: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition font-semibold"
              />
              {articleToEdit && (
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Already sent: {articleToEdit.sentPieces || 0}
                </span>
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Estimated Unit Cost (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="e.g. 4500"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Fabric & Design Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Pure raw silk, hand embroidered neckline. Reserve 2 for macro influencers..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-semibold shadow-subtle active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : articleToEdit ? 'Save Changes' : 'Save PR Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
