import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Package, Video, AlertCircle, Info, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function NewDealModal({ isOpen, onClose, onSuccess }) {
  const [influencers, setInfluencers] = useState([]);
  const [articles, setArticles] = useState([]);

  const [formData, setFormData] = useState({
    spNumber: '',
    influencer: '',
    campaignName: 'Winter Launch 2026',
    dealType: 'Paid Collab', // 'Paid Collab' | 'Barter PR'
    agreedDate: new Date().toISOString().split('T')[0],
    agreedRate: 10000,
    ratePerVideo: 5000,
    pastDealNotes: '',
    prArticles: [],
    videos: [
      {
        videoType: 'Reel Collaboration',
        status: 'Pending',
        notes: '',
      },
      {
        videoType: 'Reel Collaboration',
        status: 'Pending',
        notes: '',
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  const loadDependencies = async () => {
    try {
      const [infRes, artRes] = await Promise.all([
        api.getInfluencers(),
        api.getArticles(),
      ]);
      setInfluencers(infRes.data);
      setArticles(artRes.data);
      if (infRes.data.length > 0 && !formData.influencer) {
        setFormData((prev) => ({
          ...prev,
          influencer: infRes.data[0]._id,
        }));
      }
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  const handleAddPRItem = () => {
    if (articles.length === 0) return;
    setFormData({
      ...formData,
      prArticles: [
        ...formData.prArticles,
        {
          article: articles[0]._id,
          quantity: 1,
          size: 'Medium',
          dispatchStatus: 'Pending',
        },
      ],
    });
  };

  const handleRemovePRItem = (index) => {
    const updated = [...formData.prArticles];
    updated.splice(index, 1);
    setFormData({ ...formData, prArticles: updated });
  };

  const handleAddDeliverable = (videoType = 'Reel Collaboration') => {
    setFormData({
      ...formData,
      videos: [
        ...formData.videos,
        {
          videoType,
          status: 'Pending',
          notes: '',
        },
      ],
    });
  };

  const handleRemoveDeliverable = (index) => {
    const updated = [...formData.videos];
    updated.splice(index, 1);
    setFormData({ ...formData, videos: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.influencer) {
      setError('Please select an influencer');
      return;
    }

    setLoading(true);
    setError('');

    const isBarter = formData.dealType === 'Barter PR';

    try {
      await api.createDeal({
        ...formData,
        dealType: formData.dealType,
        agreedRate: isBarter ? 0 : Number(formData.agreedRate || 0),
        ratePerVideo: isBarter ? 0 : Number(formData.ratePerVideo || 0),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-modal text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                New Influencer Collaboration
              </h3>
              <p className="text-xs text-slate-400">
                Lock rates, assign garments, and define agreed deliverables
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Influencer & SP# & Campaign */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch / SP# Tracking
              </label>
              <input
                type="text"
                placeholder="e.g. SP# 17778"
                value={formData.spNumber}
                onChange={(e) => setFormData({ ...formData, spNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none font-mono font-semibold text-slate-900 bg-slate-50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Influencer *
              </label>
              {influencers.length === 0 ? (
                <p className="text-red-600 font-medium py-1">No creators registered yet.</p>
              ) : (
                <select
                  value={formData.influencer}
                  onChange={(e) => setFormData({ ...formData, influencer: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none bg-white font-medium text-xs transition"
                >
                  {influencers.map((inf) => (
                    <option key={inf._id} value={inf._id}>
                      {inf.name} ({inf.instagramHandle})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kaftan Collection"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          {/* Deal Type Switcher: Paid vs Barter PR */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-xs text-slate-900 block">
                Collaboration Commercial Model
              </span>
              <span className="text-[11px] text-slate-400">
                Choose whether creator is paid cash fees or receives PR suits for free (Barter)
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, dealType: 'Paid Collab' })}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  formData.dealType === 'Paid Collab'
                    ? 'bg-slate-900 text-white shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid Collab
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    dealType: 'Barter PR',
                    agreedRate: 0,
                    ratePerVideo: 0,
                  })
                }
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  formData.dealType === 'Barter PR'
                    ? 'bg-purple-700 text-white shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Barter PR (Product Only)
              </button>
            </div>
          </div>

          {/* Pricing & Agreed Date */}
          {formData.dealType === 'Paid Collab' ? (
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.agreedDate}
                  onChange={(e) => setFormData({ ...formData, agreedDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Deal Price (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="10000"
                  value={formData.agreedRate}
                  onChange={(e) => setFormData({ ...formData, agreedRate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate Per Video (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="5000"
                  value={formData.ratePerVideo}
                  onChange={(e) => setFormData({ ...formData, ratePerVideo: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Barter PR Collaboration (No Cash Consideration)
                </span>
                <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  Rate: Rs. 0
                </span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Influencer is given free PR suits/garments in exchange for video reviews, reels, or unboxing stories. No cash payment will be owed or scheduled.
              </p>
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Agreed Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.agreedDate}
                  onChange={(e) => setFormData({ ...formData, agreedDate: e.target.value })}
                  className="w-full sm:w-48 px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* PR Articles Allocation Section with Sizes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-500" />
                PR Garments to Send
              </label>
              <button
                type="button"
                onClick={handleAddPRItem}
                className="flex items-center gap-1 text-xs font-semibold bg-slate-900 text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Article
              </button>
            </div>

            {formData.prArticles.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center">
                Click "+ Add Article" to attach garments and specify sizes.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.prArticles.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl border border-slate-200/80 bg-white shadow-xs"
                  >
                    <select
                      value={item.article}
                      onChange={(e) => {
                        const updated = [...formData.prArticles];
                        updated[idx].article = e.target.value;
                        setFormData({ ...formData, prArticles: updated });
                      }}
                      className="flex-1 w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none"
                    >
                      {articles.map((art) => (
                        <option key={art._id} value={art._id}>
                          {art.name} ({art.articleCode}) — {art.remainingPieces} left in PR
                        </option>
                      ))}
                    </select>

                    {/* Dress Size Selector */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-[11px] font-semibold text-slate-500">Size:</span>
                      <select
                        value={item.size}
                        onChange={(e) => {
                          const updated = [...formData.prArticles];
                          updated[idx].size = e.target.value;
                          setFormData({ ...formData, prArticles: updated });
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold focus:outline-none"
                      >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                        <option value="XL">XL</option>
                        <option value="Free Size">Free Size</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...formData.prArticles];
                          updated[idx].quantity = Number(e.target.value);
                          setFormData({ ...formData, prArticles: updated });
                        }}
                        className="w-14 text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-center focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePRItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                      title="Remove garment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agreed Deliverables List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-slate-500" />
                Deliverables ({formData.videos.length} videos)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddDeliverable('Reel Collaboration')}
                  className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition"
                >
                  + Reel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverable('Story Unboxing')}
                  className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition"
                >
                  + Story
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverable('Highlights')}
                  className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition"
                >
                  + Highlights
                </button>
              </div>
            </div>

            {/* Workflow Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-slate-600">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Schedule Workflow:</strong> Video shoot and upload dates are set after parcel delivery under <strong>"Reel Scheduling"</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              {formData.videos.map((vid, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200/80 bg-white"
                >
                  <span className="font-medium text-slate-800 text-xs">
                    #{idx + 1} — {vid.videoType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Scheduled upon delivery</span>
                    {formData.videos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Collab Notes / Agreement Summary
            </label>
            <input
              type="text"
              placeholder="e.g. 2 Dresses, 5k per reel, Total 10k"
              value={formData.pastDealNotes}
              onChange={(e) => setFormData({ ...formData, pastDealNotes: e.target.value })}
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
              {loading ? 'Creating Deal...' : 'Lock Collaboration Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
