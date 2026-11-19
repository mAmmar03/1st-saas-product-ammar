import React, { useState } from 'react';
import { X, Send, Truck, AlertCircle, Package } from 'lucide-react';
import { api } from '../services/api';

export default function DispatchModal({ itemData, onClose, onSuccess }) {
  const [courierName, setCourierName] = useState('TCS Courier');
  const [spNumber, setSpNumber] = useState(itemData.currentSpNumber || '');
  const [trackingNumber, setTrackingNumber] = useState(itemData.currentSpNumber || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!itemData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.dispatchPR(itemData.dealId, itemData.prItemId, {
        courierName,
        trackingNumber: trackingNumber || spNumber,
        spNumber,
        deliveryNotes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch PR article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-md w-full overflow-hidden text-xs font-sans animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Dispatch PR Parcel & Deduct Stock
              </h3>
              <p className="text-xs text-slate-400">
                Record parcel dispatch and track delivery status
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Details summary */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Influencer:</span>
              <strong className="text-slate-900 font-semibold">{itemData.influencerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Article to Ship:</span>
              <strong className="text-slate-900">{itemData.articleName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Size & Quantity:</span>
              <span className="font-semibold text-slate-900">
                {itemData.size || 'Medium'} — {itemData.quantity} pc(s)
              </span>
            </div>
            {itemData.shippingAddress && (
              <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">PR Delivery Address:</span>
                <span className="text-xs mt-0.5 block">{itemData.shippingAddress}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch / SP# Number
              </label>
              <input
                type="text"
                placeholder="e.g. SP# 17778"
                value={spNumber}
                onChange={(e) => setSpNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none font-mono font-semibold text-slate-900 bg-slate-50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Courier Service
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-xs focus:outline-none transition"
              >
                <option value="TCS Courier">TCS Courier</option>
                <option value="Leopard Courier">Leopard Courier</option>
                <option value="PostEx">PostEx</option>
                <option value="Trax Courier">Trax Courier</option>
                <option value="Rider / Hand Delivered">Rider / Hand Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Courier Tracking # / Slip Reference
            </label>
            <input
              type="text"
              placeholder="e.g. 7748291039"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs font-mono transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Sent via express delivery, tracking shared on WhatsApp"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
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
              {loading ? 'Processing...' : 'Confirm Dispatch & Deduct Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
