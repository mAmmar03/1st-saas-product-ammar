import React, { useEffect, useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  CheckCircle,
  Truck,
  Edit,
  Search,
  AlertCircle,
  Sparkles,
  Package,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import ScheduleReelModal from '../components/ScheduleReelModal';
import { useAlert } from '../context/AlertContext';

export default function ContentSchedule({ onOpenDossier }) {
  const { showAlert } = useAlert();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'pending' | 'in_review' | 'fulfilled'

  // Schedule modal state
  const [schedulingItem, setSchedulingItem] = useState(null);

  // Link modal
  const [videoLinkModal, setVideoLinkModal] = useState(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState('');

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await api.getDeals();
      setDeals(res.data);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract all video items with deal metadata
  const allVideoItems = [];
  deals.forEach((deal) => {
    deal.videos?.forEach((vid, vIdx) => {
      allVideoItems.push({
        deal,
        video: vid,
        index: vIdx,
        isBarter: deal.dealType === 'Barter PR',
      });
    });
  });

  // Categorize
  const pendingList = allVideoItems.filter(
    (item) => item.video.status === 'Pending' || !item.video.scheduledDate
  );
  const inReviewList = allVideoItems.filter(
    (item) =>
      item.video.status === 'Draft Received' || item.video.status === 'Approved'
  );
  const fulfilledList = allVideoItems.filter(
    (item) => item.video.status === 'Video Live'
  );

  const totalCount = allVideoItems.length;
  const pendingCount = pendingList.length;
  const inReviewCount = inReviewList.length;
  const fulfilledCount = fulfilledList.length;

  // Filter current displayed list by activeSubTab and search query
  const getFilteredList = () => {
    let baseList = allVideoItems;
    if (activeSubTab === 'pending') baseList = pendingList;
    else if (activeSubTab === 'in_review') baseList = inReviewList;
    else if (activeSubTab === 'fulfilled') baseList = fulfilledList;

    if (!search.trim()) return baseList;

    const q = search.toLowerCase();
    return baseList.filter(
      (item) =>
        item.deal.influencer?.name?.toLowerCase().includes(q) ||
        item.deal.influencer?.instagramHandle?.toLowerCase().includes(q) ||
        item.deal.campaignName?.toLowerCase().includes(q) ||
        item.deal.spNumber?.toLowerCase().includes(q) ||
        item.video.videoType?.toLowerCase().includes(q)
    );
  };

  const displayedList = getFilteredList();

  const handleUpdateStatus = async (dealId, videoId, status) => {
    try {
      await api.updateVideo(dealId, videoId, { status });
      showAlert(`Video status updated to: ${status}`, 'success');
      loadDeals();
    } catch (err) {
      showAlert('Failed to update status', 'error');
    }
  };

  const handleSaveVideoUrl = async (e) => {
    e.preventDefault();
    if (!videoLinkModal) return;

    try {
      await api.updateVideo(videoLinkModal.dealId, videoLinkModal.videoId, {
        liveUrl: videoLinkUrl,
        status: 'Video Live',
      });
      showAlert('Live video published and marked as Fulfilled!', 'success');
      setVideoLinkModal(null);
      setVideoLinkUrl('');
      loadDeals();
    } catch (err) {
      showAlert('Failed to save live link', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold uppercase text-slate-900 tracking-tight flex items-center gap-2">
              <Video className="w-5 h-5 text-slate-700" />
              Reel Scheduling & Deliverables Hub
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-800 border border-slate-300">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lock in shoot dates, review received video drafts, track pending vs fulfilled creator reels
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creator, SP#, or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition bg-white"
          />
        </div>
      </div>

      {/* 2. Top KPI Counters - Clean Enterprise Monochrome Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* All Deliverables */}
        <div
          onClick={() => setActiveSubTab('all')}
          className={`p-4 rounded-xl border transition cursor-pointer select-none ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white shadow-subtle border-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider block ${
                activeSubTab === 'all' ? 'text-slate-300' : 'text-slate-400'
              }`}
            >
              All Deliverables
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeSubTab === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {totalCount}
            </span>
          </div>
          <div className={`text-2xl font-bold mt-1 tracking-tight ${activeSubTab === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {totalCount}
          </div>
          <span
            className={`text-[11px] block mt-0.5 ${
              activeSubTab === 'all' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Total reels in system
          </span>
        </div>

        {/* Pending Reels Counter - Professional Monochrome */}
        <div
          onClick={() => setActiveSubTab('pending')}
          className={`p-4 rounded-xl border transition cursor-pointer select-none ${
            activeSubTab === 'pending'
              ? 'bg-slate-900 text-white shadow-subtle border-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                activeSubTab === 'pending' ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Pending Deliverables
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeSubTab === 'pending'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {pendingCount}
            </span>
          </div>
          <div
            className={`text-2xl font-bold mt-1 tracking-tight ${
              activeSubTab === 'pending' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {pendingCount} Pending
          </div>
          <span
            className={`text-[11px] block mt-0.5 ${
              activeSubTab === 'pending' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Awaiting shoot date or draft
          </span>
        </div>

        {/* In Review / Scheduled Counter */}
        <div
          onClick={() => setActiveSubTab('in_review')}
          className={`p-4 rounded-xl border transition cursor-pointer select-none ${
            activeSubTab === 'in_review'
              ? 'bg-slate-900 text-white shadow-subtle border-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                activeSubTab === 'in_review' ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Drafts & Pipeline
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeSubTab === 'in_review'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {inReviewCount}
            </span>
          </div>
          <div
            className={`text-2xl font-bold mt-1 tracking-tight ${
              activeSubTab === 'in_review' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {inReviewCount} In Review
          </div>
          <span
            className={`text-[11px] block mt-0.5 ${
              activeSubTab === 'in_review' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Draft received or scheduled
          </span>
        </div>

        {/* Fulfilled / Completed Live Counter */}
        <div
          onClick={() => setActiveSubTab('fulfilled')}
          className={`p-4 rounded-xl border transition cursor-pointer select-none ${
            activeSubTab === 'fulfilled'
              ? 'bg-slate-900 text-white shadow-subtle border-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                activeSubTab === 'fulfilled' ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Fulfilled Deliverables
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeSubTab === 'fulfilled'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {fulfilledCount}
            </span>
          </div>
          <div
            className={`text-2xl font-bold mt-1 tracking-tight ${
              activeSubTab === 'fulfilled' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {fulfilledCount} Fulfilled
          </div>
          <span
            className={`text-[11px] block mt-0.5 ${
              activeSubTab === 'fulfilled' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Video live & link verified
          </span>
        </div>
      </div>

      {/* 3. Filter Navigation Pills - Clean Monochrome */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition select-none ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Deliverables ({totalCount})
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 select-none ${
            activeSubTab === 'pending'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setActiveSubTab('in_review')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 select-none ${
            activeSubTab === 'in_review'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          In Review ({inReviewCount})
        </button>

        <button
          onClick={() => setActiveSubTab('fulfilled')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 select-none ${
            activeSubTab === 'fulfilled'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Fulfilled ({fulfilledCount})
        </button>
      </div>

      {/* 4. Content Deliverables Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading content schedule...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-2 shadow-subtle">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No Deliverables Found</h3>
          <p className="text-xs text-slate-400">
            {search
              ? 'No reels matched your search term.'
              : 'No items currently in this tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map(({ deal, video, isBarter }, idx) => {
            const isFulfilled = video.status === 'Video Live';
            const isDraftReceived = video.status === 'Draft Received';
            const isApproved = video.status === 'Approved';
            const isPending = !isFulfilled && (!video.scheduledDate || video.status === 'Pending');

            return (
              <div
                key={`${deal._id}_${video._id || idx}`}
                className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle space-y-3.5 transition-all hover:border-slate-300"
              >
                {/* Card Top: Influencer + Clean Monochrome Status Tag */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {deal.influencer?.profileImage ? (
                      <img
                        src={deal.influencer.profileImage}
                        alt={deal.influencer.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {deal.influencer?.name?.[0] || 'I'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {deal.spNumber && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-semibold text-[10px] rounded">
                            {deal.spNumber}
                          </span>
                        )}
                        <h3
                          onClick={() => onOpenDossier(deal.influencer?._id)}
                          className="font-bold text-xs text-slate-900 hover:underline cursor-pointer"
                        >
                          {deal.influencer?.name}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {deal.influencer?.instagramHandle}
                      </span>
                    </div>
                  </div>

                  {/* Clean Monochrome Status Badges */}
                  <div>
                    {isFulfilled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white border border-slate-900 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        Fulfilled / Live
                      </span>
                    ) : isDraftReceived ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        Draft In Review
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        Pending Shoot
                      </span>
                    )}
                  </div>
                </div>

                {/* Campaign & Garments Information */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Campaign:</span>
                    <strong className="text-slate-800">{deal.campaignName}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deliverable Type:</span>
                    <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {video.videoType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">PR Apparel:</span>
                    <span className="text-slate-700 font-medium truncate max-w-[200px]">
                      {deal.prArticles?.map((a) => `${a.article?.name} (${a.size || 'M'})`).join(', ') || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Commercials:</span>
                    {isBarter ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Barter PR (Product Only)
                      </span>
                    ) : (
                      <span className="font-mono font-semibold text-slate-800">
                        Rs. {(deal.ratePerVideo || 0).toLocaleString()} per reel
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Tracking Bar */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Live Date:</span>
                  </div>
                  {video.scheduledDate ? (
                    <strong className="font-mono font-bold text-slate-900">
                      {new Date(video.scheduledDate).toLocaleDateString()}
                    </strong>
                  ) : (
                    <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Not Scheduled Yet
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center justify-end gap-1.5">
                  {/* Schedule Date Button */}
                  {!video.scheduledDate ? (
                    <button
                      onClick={() => setSchedulingItem({ deal, video })}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      Schedule Live Date
                    </button>
                  ) : (
                    <button
                      onClick={() => setSchedulingItem({ deal, video })}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Change Date
                    </button>
                  )}

                  {/* Workflow buttons */}
                  {!isFulfilled && video.status === 'Pending' && video.scheduledDate && (
                    <button
                      onClick={() => handleUpdateStatus(deal._id, video._id, 'Draft Received')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition"
                    >
                      Draft Received
                    </button>
                  )}

                  {!isFulfilled && video.status === 'Draft Received' && (
                    <button
                      onClick={() => handleUpdateStatus(deal._id, video._id, 'Approved')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50 transition"
                    >
                      Approve Draft
                    </button>
                  )}

                  {!isFulfilled && (
                    <button
                      onClick={() => {
                        setVideoLinkModal({ dealId: deal._id, videoId: video._id });
                        setVideoLinkUrl(video.liveUrl || '');
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-subtle"
                    >
                      + Mark Live & Add URL
                    </button>
                  )}

                  {isFulfilled && video.liveUrl && (
                    <a
                      href={video.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-subtle"
                    >
                      View Live Post <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {isFulfilled && !video.liveUrl && (
                    <button
                      onClick={() => {
                        setVideoLinkModal({ dealId: deal._id, videoId: video._id });
                        setVideoLinkUrl('');
                      }}
                      className="text-xs text-slate-600 hover:underline"
                    >
                      + Add Link
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {schedulingItem && (
        <ScheduleReelModal
          deal={schedulingItem.deal}
          videoItem={schedulingItem.video}
          onClose={() => setSchedulingItem(null)}
          onSuccess={() => {
            setSchedulingItem(null);
            loadDeals();
          }}
        />
      )}

      {/* Video Live Link Modal */}
      {videoLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-sm w-full p-5 space-y-3.5 animate-modal-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Publish & Fulfill Video Deliverable
              </span>
              <button
                onClick={() => setVideoLinkModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideoUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram Reel / Post URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/..."
                  value={videoLinkUrl}
                  onChange={(e) => setVideoLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition shadow-subtle"
              >
                Save & Mark as Fulfilled (Live)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
