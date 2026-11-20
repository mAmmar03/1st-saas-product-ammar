import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, Building, MapPin, Camera, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function AddInfluencerModal({ isOpen, onClose, onSuccess, influencerToEdit = null }) {
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

  useEffect(() => {
    if (influencerToEdit) {
      setFormData({
        name: influencerToEdit.name || '',
        profileImage: influencerToEdit.profileImage || '',
        primaryPlatform: influencerToEdit.primaryPlatform || 'Instagram',
        instagramHandle: influencerToEdit.instagramHandle || '',
        preferredSize: influencerToEdit.preferredSize || 'Medium',
        tiktok: influencerToEdit.otherAccounts?.tiktok || '',
        youtube: influencerToEdit.otherAccounts?.youtube || '',
        facebook: influencerToEdit.otherAccounts?.facebook || '',
        snapchat: influencerToEdit.otherAccounts?.snapchat || '',
        followers: influencerToEdit.followers ?? 15000,
        phone: influencerToEdit.phone || '',
        email: influencerToEdit.email || '',
        city: influencerToEdit.city || '',
        shippingAddress: influencerToEdit.shippingAddress || '',
        niche: influencerToEdit.niche || 'Fashion & Lifestyle',
        tier: influencerToEdit.tier || 'Micro',
        bankName: influencerToEdit.bankDetails?.bankName || '',
        accountTitle: influencerToEdit.bankDetails?.accountTitle || '',
        accountNumber: influencerToEdit.bankDetails?.accountNumber || '',
        iban: influencerToEdit.bankDetails?.iban || '',
        notes: influencerToEdit.notes || '',
      });
    } else {
      setFormData({
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
    }
    setError('');
  }, [influencerToEdit, isOpen]);

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

      if (influencerToEdit?._id) {
        await api.updateInfluencer(influencerToEdit._id, payload);
      } else {
        await api.createInfluencer(payload);
      }
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                {influencerToEdit ? 'Edit Creator Profile' : 'Add New Creator Profile'}
              </h3>
              <p className="text-xs text-slate-400">
                {influencerToEdit ? 'Update creator bio-data, shipping address & rates' : 'Register creator bio-data, shipping address & rates'}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center relative border border-slate-300 shrink-0">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-slate-800 block text-xs">Creator Photo / Avatar</span>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition font-medium text-[11px] shadow-2xs">
                  Upload Photo
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
                    onClick={() => setFormData({ ...formData, profileImage: '' })}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ayla Noor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Primary Instagram Handle *
              </label>
              <input
                type="text"
                required
                placeholder="@aylanoor.official"
                value={formData.instagramHandle}
                onChange={(e) =>
                  setFormData({ ...formData, instagramHandle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Preferred Apparel Size
              </label>
              <select
                value={formData.preferredSize}
                onChange={(e) => setFormData({ ...formData, preferredSize: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition font-semibold"
              >
                <option value="Small">Small (S)</option>
                <option value="Medium">Medium (M)</option>
                <option value="Large">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="Free Size">Free Size</option>
                <option value="Custom">Custom Measurements</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Followers Count
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 50000"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tier / Category
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              >
                <option value="Nano">Nano (1k - 10k)</option>
                <option value="Micro">Micro (10k - 50k)</option>
                <option value="Mid-Tier">Mid-Tier (50k - 200k)</option>
                <option value="Macro">Macro (200k - 1M)</option>
                <option value="Celebrity">Celebrity (1M+)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                placeholder="0300 1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Lahore, Karachi, Islamabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Courier Shipping Address (For PR Parcel Deliveries)
            </label>
            <textarea
              rows={2}
              placeholder="House/Apartment #, Street, Area, City, Nearest Landmark..."
              value={formData.shippingAddress}
              onChange={(e) =>
                setFormData({ ...formData, shippingAddress: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
            />
          </div>

          {/* Bank Payment Details */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5">
            <span className="font-semibold text-slate-800 block text-xs">
              Banking & Payment Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Bank Name (e.g. Meezan, HBL)"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Account Title / Beneficiary"
                value={formData.accountTitle}
                onChange={(e) =>
                  setFormData({ ...formData, accountTitle: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Account / IBAN Number"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              />
              <input
                type="text"
                placeholder="Alternate Platform (TikTok handle...)"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Internal PR Management Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Delivers high engagement on festive unboxings. Reliable with shoot deadlines."
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
              {loading ? 'Saving...' : influencerToEdit ? 'Save Changes' : 'Save Creator Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
