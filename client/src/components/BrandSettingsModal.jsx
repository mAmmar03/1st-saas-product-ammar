import React, { useState, useEffect } from 'react';
import { X, Building2, Camera, Trash2, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';

export default function BrandSettingsModal({ isOpen, onClose, onSuccess, brandProfile }) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: brandProfile?.brandName || '',
    tagline: brandProfile?.tagline || '',
    brandLogo: brandProfile?.brandLogo || '',
    phone: brandProfile?.phone || '',
    email: brandProfile?.email || '',
    city: brandProfile?.city || '',
    address: brandProfile?.address || '',
    instagramHandle: brandProfile?.instagramHandle || '',
    authorizedSignatory: brandProfile?.authorizedSignatory || 'Super Admin',
  });

  useEffect(() => {
    if (isOpen) {
      if (brandProfile) {
        setFormData((prev) => ({ ...prev, ...brandProfile }));
      }
      loadBrandProfile();
    }
  }, [isOpen, brandProfile]);

  const loadBrandProfile = async () => {
    try {
      const res = await api.getBrandProfile();
      if (res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      console.error('Failed to load brand profile', err);
    }
  };

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Logo image file must be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, brandLogo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateBrandProfile(formData);
      showAlert('Brand profile updated successfully! All slips and sheets will use this branding.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showAlert(err.response?.data?.error || 'Failed to update brand profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Brand & Company Profile
              </h3>
              <p className="text-xs text-slate-400">
                Configure brand identity for vouchers, slips & reports
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Logo Upload - Clean, Unframed Display */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center gap-4">
            <div className="h-16 w-24 flex items-center justify-center shrink-0">
              {formData.brandLogo ? (
                <img
                  src={formData.brandLogo}
                  alt="Brand Logo"
                  className="max-h-16 max-w-24 object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <span className="text-[10px] text-slate-400 block font-medium">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="block text-xs font-semibold text-slate-800">
                Company Brand Logo
              </span>
              <p className="text-[11px] text-slate-500">
                Upload your brand's transparent PNG or JPG logo.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition shadow-xs active:scale-[0.98]">
                  Select Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {formData.brandLogo && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, brandLogo: '' }))}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand Name & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Apparel"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none font-semibold text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Sub-heading
              </label>
              <input
                type="text"
                placeholder="e.g. Premium Fashion & Lifestyle"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Instagram Handle
              </label>
              <input
                type="text"
                placeholder="@brandhandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="City, Country"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Signatory Title
              </label>
              <input
                type="text"
                placeholder="e.g. Brand Director / PR Lead"
                value={formData.authorizedSignatory}
                onChange={(e) => setFormData({ ...formData, authorizedSignatory: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch / Return Address (For Courier Slips)
            </label>
            <textarea
              rows={2}
              placeholder="Office / Warehouse dispatch address for PR parcels"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-subtle active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving Settings...' : 'Save Brand Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
