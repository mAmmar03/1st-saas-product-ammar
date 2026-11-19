import React, { useState } from 'react';
import { X, Users, AlertCircle, Building, MapPin, Camera, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function AddInfluencerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    primaryPlatform: 'Instagram',
    instagramHandle: '',
    preferredSize: 'Medium',
    tiktok: '',
    youtube: '',
    facebook: '',
    snapchat: '',
    followers: 15000,
    phone: '',
    email: '',
    city: '',
    shippingAddress: '',
    niche: 'Fashion & Lifestyle',
    tier: 'Micro',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.instagramHandle) {
      setError('Please provide Name and Primary ID/Handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        profileImage: formData.profileImage,
        primaryPlatform: formData.primaryPlatform,
        instagramHandle: formData.instagramHandle.startsWith('@')
          ? formData.instagramHandle
          : `@${formData.instagramHandle}`,
        preferredSize: formData.preferredSize,
        otherAccounts: {
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          facebook: formData.facebook,
          snapchat: formData.snapchat,
        },
        followers: Number(formData.followers) || 0,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        shippingAddress: formData.shippingAddress,
        niche: formData.niche,
        tier: formData.tier,
        bankDetails: {
          bankName: formData.bankName,
          accountTitle: formData.accountTitle,
          accountNumber: formData.accountNumber,
          iban: formData.iban,
        },
        notes: formData.notes,
      };

      await api.createInfluencer(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save creator profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-modal text-xs font-sans animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Add New Creator Profile
              </h3>
              <p className="text-xs text-slate-400">
                Register creator bio-data, shipping address & rates
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo Upload - Clean, Unframed */}
          <div className="flex items-center gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Camera className="w-5 h-5 mx-auto text-slate-300" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <span className="block text-xs font-semibold text-slate-800">
                Creator Profile Photo (Optional)
              </span>
              <p className="text-[11px] text-slate-500">
                Upload image (JPG, PNG). Will be displayed on profile card & dossier.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition shadow-xs active:scale-[0.98]">
                  Select Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, profileImage: '' }))}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Primary Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Faiqa Waseem"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs font-medium transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Platform *
              </label>
              <select
                value={formData.primaryPlatform}
                onChange={(e) => setFormData({ ...formData, primaryPlatform: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs bg-white font-medium transition"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Snapchat">Snapchat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Handle / Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. @Faiqawaseem30"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          {/* Preferred Size, Followers, Niche */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Garment Size
              </label>
              <select
                value={formData.preferredSize}
                onChange={(e) => setFormData({ ...formData, preferredSize: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs bg-white font-semibold text-slate-900 transition"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="XL">XL</option>
                <option value="Free Size">Free Size</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Followers / Audience
              </label>
              <input
                type="number"
                min="0"
                placeholder="25000"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Niche / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Fashion & Lifestyle"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone / WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="e.g. 0308 0636093"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Hafizabad, Bahawalpur, Karachi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          {/* Shipping Address for PR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full PR Delivery / Shipping Address
            </label>
            <textarea
              rows={2}
              placeholder="Muhalla, Street, House #, City (Used for TCS / Leopard courier consignment)"
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
            />
          </div>

          {/* Bank details */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
            <span className="text-xs font-semibold text-slate-800 block">
              Bank Details (For Payments)
            </span>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Bank Name (e.g. Meezan Bank)"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Account Title"
                value={formData.accountTitle}
                onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none"
              />
              <input
                type="text"
                placeholder="IBAN Number"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rate Notes / Past Deals History
            </label>
            <input
              type="text"
              placeholder="e.g. Price as per previous 7k per reel"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {loading ? 'Saving Profile...' : 'Save Creator Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
