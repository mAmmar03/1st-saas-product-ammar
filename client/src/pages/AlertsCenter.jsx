import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  PackageCheck,
  Video,
  FileText,
  X,
  CheckCheck,
  Search,
  ExternalLink,
  Phone,
  Sparkles,
} from 'lucide-react';

export default function AlertsCenter({
  deals = [],
  dismissedAlertIds = [],
  onDismissAlert,
  onDismissAllAlerts,
  onOpenScheduleModal,
  onOpenDossier,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'drafts' | 'awaiting' | 'upcoming' | 'overdue'
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueToday = [];
  const draftAlerts = [];
  const upcomingWeek = [];
  const awaitingDate = [];
  const overdue = [];

  deals.forEach((deal) => {
    // 1. Check PR delivery without scheduled reel
    const isDelivered = deal.prArticles?.some((p) => p.dispatchStatus === 'Delivered');
    const hasUnscheduledVideo = deal.videos?.some((v) => !v.scheduledDate && v.status !== 'Video Live');

    const alertIdAwaiting = `awaiting_${deal._id}`;
    if (isDelivered && hasUnscheduledVideo && !dismissedAlertIds.includes(alertIdAwaiting)) {
      awaitingDate.push({
        id: alertIdAwaiting,
        type: 'awaiting',
        deal,
        influencer: deal.influencer,
        article: deal.prArticles?.[0]?.article?.name || 'PR Garment',
        spNumber: deal.spNumber,
      });
    }

    // 2. Check scheduled reels & drafts
    deal.videos?.forEach((video, vIdx) => {
      // 2a. Drafts Alert
      if (
        video.draftDate &&
        video.status !== 'Draft Received' &&
        video.status !== 'Approved' &&
        video.status !== 'Video Live'
      ) {
        const draftDate = new Date(video.draftDate);
        draftDate.setHours(0, 0, 0, 0);
        const draftStr = draftDate.toISOString().split('T')[0];
        const draftDiffDays = Math.round((draftDate - now) / (1000 * 60 * 60 * 24));
        const draftAlertId = `draft_${deal._id}_${vIdx}`;

        if (!dismissedAlertIds.includes(draftAlertId)) {
          if (draftStr === todayStr) {
            draftAlerts.push({
              id: draftAlertId,
              type: 'draft_today',
              deal,
              video,
              videoIndex: vIdx,
              dateStr: draftStr,
            });
          } else if (draftDiffDays > 0 && draftDiffDays <= 7) {
            draftAlerts.push({
              id: draftAlertId,
              type: 'draft_upcoming',
              deal,
              video,
              videoIndex: vIdx,
              diffDays: draftDiffDays,
              dateStr: draftStr,
            });
          } else if (draftDiffDays < 0) {
            draftAlerts.push({
              id: draftAlertId,
              type: 'draft_overdue',
              deal,
              video,
              videoIndex: vIdx,
              daysOverdue: Math.abs(draftDiffDays),
              dateStr: draftStr,
            });
          }
        }
      }

      // 2b. Live Reel Posting Alert
      if (video.status === 'Video Live') return;

      if (video.scheduledDate) {
        const schedDate = new Date(video.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        const schedStr = schedDate.toISOString().split('T')[0];
        const diffDays = Math.round((schedDate - now) / (1000 * 60 * 60 * 24));

        const alertId = `reel_${deal._id}_${vIdx}`;
        if (dismissedAlertIds.includes(alertId)) return;

        if (schedStr === todayStr) {
          dueToday.push({ id: alertId, type: 'today', deal, video, videoIndex: vIdx });
        } else if (diffDays > 0 && diffDays <= 7) {
          upcomingWeek.push({ id: alertId, type: 'upcoming', deal, video, videoIndex: vIdx, diffDays });
        } else if (diffDays < 0) {
          overdue.push({ id: alertId, type: 'overdue', deal, video, videoIndex: vIdx, daysOverdue: Math.abs(diffDays) });
        }
      }
    });
  });

  const allAlerts = [...dueToday, ...draftAlerts, ...awaitingDate, ...upcomingWeek, ...overdue];

  const getFilteredList = () => {
    let list = [];
    if (activeTab === 'all') list = allAlerts;
    else if (activeTab === 'today') list = dueToday;
    else if (activeTab === 'drafts') list = draftAlerts;
    else if (activeTab === 'awaiting') list = awaitingDate;
    else if (activeTab === 'upcoming') list = upcomingWeek;
    else if (activeTab === 'overdue') list = overdue;

    if (!search.trim()) return list;
    const query = search.toLowerCase();
    return list.filter((item) =>
      item.deal.influencer?.name?.toLowerCase().includes(query) ||
      item.deal.campaignName?.toLowerCase().includes(query) ||
      item.deal.spNumber?.toLowerCase().includes(query)
    );
  };

  const currentList = getFilteredList();

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-800" />
            Schedule Alerts & Reminders Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track creator draft review deadlines, live reel postings due today, and delivered PR awaiting schedule dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allAlerts.length > 0 && (
            <button
              onClick={onDismissAllAlerts}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition active:scale-[0.98]"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
              Dismiss All Alerts
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            All Alerts ({allAlerts.length})
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-rose-600 text-white shadow-subtle'
                : 'bg-white text-slate-600 hover:bg-rose-50/50 border border-slate-200/80'
            }`}
          >
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            Reels Due Today ({dueToday.length})
          </button>

          {/* Dedicated Distinct Drafts Alert Tab */}
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'drafts'
                ? 'bg-violet-700 text-white shadow-subtle'
                : 'bg-white text-violet-700 hover:bg-violet-50/60 border border-violet-200/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Drafts Expected ({draftAlerts.length})
          </button>

          <button
            onClick={() => setActiveTab('awaiting')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'awaiting'
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Delivered → Date Needed ({awaitingDate.length})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Upcoming 7 Days ({upcomingWeek.length})
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'overdue'
                ? 'bg-red-700 text-white shadow-subtle'
                : 'bg-white text-red-600 hover:bg-red-50 border border-slate-200/80'
            }`}
          >
            Overdue ({overdue.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creator or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
          />
        </div>
      </div>

      {/* Alerts Grid */}
      {currentList.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-5 h-5 text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Active Alerts In This View</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All content schedules and drafts are on track, and all delivered parcels have live dates assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => {
            const isDraftAlert = item.type.startsWith('draft_');
            const isTodayReel = item.type === 'today';
            const isOverdue = item.type === 'overdue';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border bg-white shadow-subtle flex flex-col justify-between transition-all hover:shadow-md ${
                  isDraftAlert
                    ? 'border-violet-200/90 bg-gradient-to-br from-violet-50/30 to-white'
                    : isTodayReel
                    ? 'border-rose-200/90 bg-gradient-to-br from-rose-50/30 to-white'
                    : isOverdue
                    ? 'border-red-200/90 bg-gradient-to-br from-red-50/30 to-white'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Creator Info & Dismiss */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                          isDraftAlert
                            ? 'bg-violet-100 text-violet-800'
                            : isTodayReel
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {isDraftAlert ? (
                          <FileText className="w-4 h-4" />
                        ) : isTodayReel ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <PackageCheck className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {item.deal.influencer?.name}
                          </h4>
                          <span className="text-xs text-slate-400 truncate">
                            {item.deal.influencer?.instagramHandle}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Campaign: <strong className="text-slate-700">{item.deal.campaignName}</strong>
                          {item.deal.spNumber && (
                            <span className="ml-2 font-mono text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 border border-slate-200/60">
                              SP# {item.deal.spNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDismissAlert(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Distinct Drafts Alert Card Details */}
                  {isDraftAlert && (
                    <div className="p-3.5 bg-violet-50/70 rounded-xl border border-violet-200/70 text-violet-950 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-violet-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                          Draft Review: {item.video.videoType || 'Reel'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'draft_today'
                              ? 'bg-violet-600 text-white'
                              : item.type === 'draft_overdue'
                              ? 'bg-red-600 text-white'
                              : 'bg-violet-100 text-violet-800 border border-violet-300'
                          }`}
                        >
                          {item.type === 'draft_today'
                            ? 'Draft Expected Today'
                            : item.type === 'draft_overdue'
                            ? `${item.daysOverdue}d Overdue`
                            : `Due in ${item.diffDays} Days`}
                        </span>
                      </div>
                      <p className="text-[11px] text-violet-800 leading-relaxed">
                        Draft submission scheduled for <strong>{item.dateStr}</strong>. Current status: <strong>{item.video.status || 'Draft Pending'}</strong>. Review video preview once received from creator.
                      </p>
                    </div>
                  )}

                  {/* 2. Live Reel Due Today */}
                  {item.type === 'today' && (
                    <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/70 text-rose-950 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold block text-rose-900">
                          Live Reel scheduled for today!
                        </span>
                        <span className="text-[11px] text-rose-700 block mt-0.5">
                          Deliverable: <strong>{item.video.videoType}</strong>
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px] tracking-wide shadow-xs shrink-0">
                        Due Today
                      </span>
                    </div>
                  )}

                  {/* 3. Delivered PR Awaiting Date */}
                  {item.type === 'awaiting' && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs space-y-1">
                      <p className="font-semibold text-slate-800">
                        PR parcel containing <strong>{item.article}</strong> was confirmed Delivered.
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Please contact creator to lock in shoot and reel publishing target dates.
                      </p>
                    </div>
                  )}

                  {/* 4. Upcoming Reels */}
                  {item.type === 'upcoming' && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold block text-slate-800">
                          Reel Deliverable: <strong>{item.video.videoType}</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Scheduled: {item.video.scheduledDate}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        In {item.diffDays} days
                      </span>
                    </div>
                  )}

                  {/* 5. Overdue Reels */}
                  {item.type === 'overdue' && (
                    <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200/70 text-red-900 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold block text-red-950">
                          Publish date was <strong>{item.video.scheduledDate}</strong>
                        </span>
                        <span className="text-[11px] text-red-700 block mt-0.5">
                          Deliverable is not marked Live yet!
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg shrink-0">
                        {item.daysOverdue} Days Overdue
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.deal.influencer?.phone || 'No phone recorded'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenDossier && item.deal.influencer?._id && (
                      <button
                        onClick={() => onOpenDossier(item.deal.influencer._id)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition"
                      >
                        Dossier
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onOpenScheduleModal) {
                          onOpenScheduleModal({
                            deal: item.deal,
                            videoIndex: item.videoIndex !== undefined ? item.videoIndex : 0,
                            video: item.video || item.deal.videos?.[0],
                          });
                        }
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
                    >
                      {item.type === 'awaiting'
                        ? 'Set Schedule'
                        : isDraftAlert
                        ? 'Review Draft'
                        : 'Update Reel'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
