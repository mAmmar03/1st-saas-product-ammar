import React, { useState } from 'react';
import { X, Calendar, Video, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';

export default function ScheduleReelModal({ deal, videoItem, onClose, onSuccess }) {
  const { showAlert } = useAlert();
  const [scheduledDate, setScheduledDate] = useState(
    videoItem?.scheduledDate ? new Date(videoItem.scheduledDate).toISOString().split('T')[0] : ''
  );
  const [shootDate, setShootDate] = useState(
    videoItem?.shootDate ? new Date(videoItem.shootDate).toISOString().split('T')[0] : ''
  );
  const [draftDate, setDraftDate] = useState(
    videoItem?.draftDate ? new Date(videoItem.draftDate).toISOString().split('T')[0] : ''
  );
  const [notes, setNotes] = useState(videoItem?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!deal || !videoItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.updateVideo(deal._id, videoItem._id, {
        scheduledDate: scheduledDate || null,
        shootDate: shootDate || null,
        draftDate: draftDate || null,
        notes,
      });
      showAlert('Reel schedule & draft target dates saved successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showAlert('Failed to update reel schedule: ' + (err.response?.data?.error || err.message), 'error');
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
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Schedule Reel / Video Dates
              </h3>
              <p className="text-xs text-slate-400">
                Plan creator shoot & target posting schedule
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
          {/* Creator & Parcel context */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1 text-xs">
            <p className="text-slate-700">Creator: <strong className="font-semibold text-slate-900">{deal.influencer?.name}</strong> ({deal.influencer?.instagramHandle})</p>
            <p className="text-slate-500">Ref: <strong className="text-slate-700">{deal.spNumber || 'SP#'}</strong> • Deliverable: <span className="font-semibold text-slate-900">{videoItem.videoType}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agreed Shoot Date (Optional)
            </label>
            <input
              type="date"
              value={shootDate}
              onChange={(e) => setShootDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              The date agreed with influencer to shoot the dresses
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Expected Video Draft Date (Optional)</span>
              <span className="text-[10px] text-violet-700 font-medium bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">
                Draft Alert Tracked
              </span>
            </label>
            <input
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Date influencer is scheduled to submit the video draft for review
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agreed Live / Posting Date *
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs font-semibold text-slate-900 transition"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              System alerts will trigger on this date to monitor the reel
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions or Content Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Creator will tag official brand handle and link in bio"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {loading ? 'Saving Schedule...' : 'Save Reel Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
