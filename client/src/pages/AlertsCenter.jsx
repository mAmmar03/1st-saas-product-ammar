import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  PackageCheck,
  Video,
  X,
  CheckCheck,
  Search,
  ExternalLink,
  Phone,
} from 'lucide-react';

export default function AlertsCenter({
  deals = [],
  dismissedAlertIds = [],
  onDismissAlert,
  onDismissAllAlerts,
  onOpenScheduleModal,
  onOpenDossier,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'awaiting' | 'upcoming' | 'overdue'
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueToday = [];
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

    // 2. Check scheduled reels
    deal.videos?.forEach((video, vIdx) => {
      if (video.status === 'Video Live') return;

      if (video.scheduledDate) {
        const schedDate = new Date(video.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        const schedStr = schedDate.toISOString().split('T')[0];
        const diffDays = Math.round((schedDate - now) / (1000 * 60 * 60 * 24));

        const alertId = `reel_${deal._id}_${vIdx}`;
        if (dismissedAlertIds.includes(alertId)) return;

        if (schedStr === todayStr) {
          dueToday.push({ id: alertId, type: 'today', deal, video });
        } else if (diffDays > 0 && diffDays <= 7) {
          upcomingWeek.push({ id: alertId, type: 'upcoming', deal, video, diffDays });
        } else if (diffDays < 0) {
          overdue.push({ id: alertId, type: 'overdue', deal, video, daysOverdue: Math.abs(diffDays) });
        }
      }
    });
  });

  const allAlerts = [...dueToday, ...awaitingDate, ...upcomingWeek, ...overdue];

  const getFilteredList = () => {
    let list = [];
    if (activeTab === 'all') list = allAlerts;
    else if (activeTab === 'today') list = dueToday;
    else if (activeTab === 'awaiting') list = awaitingDate;
    else if (activeTab === 'upcoming') list = upcomingWeek;
    else if (activeTab === 'overdue') list = overdue;

    if (!search) return list;
    return list.filter((item) =>
      item.deal.influencer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.deal.campaignName?.toLowerCase().includes(search.toLowerCase()) ||
      item.deal.spNumber?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const currentList = getFilteredList();

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            Schedule Alerts & Reminders Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor deliverables due today, upcoming shoots, and influencers awaiting reel dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allAlerts.length > 0 && (
            <button
              onClick={onDismissAllAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition active:scale-[0.98]"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
              Dismiss All Alerts
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Alerts ({allAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'today'
              ? 'bg-red-600 text-white shadow-subtle'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          Due Today ({dueToday.length})
        </button>

        <button
          onClick={() => setActiveTab('awaiting')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'awaiting'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Delivered ? Awaiting Date ({awaitingDate.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'upcoming'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Upcoming Next 7 Days ({upcomingWeek.length})
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'overdue'
              ? 'bg-red-900 text-white shadow-subtle'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Overdue ({overdue.length})
        </button>
      </div>

      {/* Alerts Grid */}
      {currentList.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200/80 text-center space-y-2 shadow-subtle">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-700 text-sm">No Active Alerts</h3>
          <p className="text-xs text-slate-400">
            All content schedules are up to date and all delivered parcels have dates assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl border bg-white shadow-subtle flex flex-col justify-between transition-all hover:border-slate-300 ${
                item.type === 'today'
                  ? 'border-red-200 bg-red-50/20'
                  : item.type === 'overdue'
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900">
                        {item.deal.influencer?.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {item.deal.influencer?.instagramHandle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Campaign: <strong>{item.deal.campaignName}</strong>
                      {item.spNumber && (
                        <span className="ml-2 font-mono text-[10px] bg-slate-100 rounded px-1.5 py-0.5">
                          SP# {item.spNumber}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Dismiss Cross (X) Button */}
                  <button
                    onClick={() => onDismissAlert(item.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Specific Alert Details */}
                {item.type === 'today' && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-950 text-xs flex items-center justify-between">
                    <span>
                      Reel deliverable <strong>{item.video.videoType}</strong> is scheduled for today!
                    </span>
                    <span className="px-2 py-0.5 bg-red-600 text-white font-semibold rounded text-[10px]">
                      Due Today
                    </span>
                  </div>
                )}

                {item.type === 'awaiting' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs space-y-1">
                    <p>
                      PR Parcel containing <strong>{item.article}</strong> was delivered to creator.
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Please contact creator on WhatsApp to finalize reel shoot & live dates.
                    </p>
                  </div>
                )}

                {item.type === 'upcoming' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs flex items-center justify-between">
                    <span>
                      Deliverable: <strong>{item.video.videoType}</strong>
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      Due: {item.video.scheduledDate} (in {item.diffDays} days)
                    </span>
                  </div>
                )}

                {item.type === 'overdue' && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-900 text-xs flex items-center justify-between">
                    <span>
                      Video target was <strong>{item.video.scheduledDate}</strong>. Not yet marked Live!
                    </span>
                    <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      {item.daysOverdue} Days Overdue
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.deal.influencer?.phone || 'No phone'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDossier(item.deal.influencer?._id)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                  >
                    Dossier
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenScheduleModal) {
                        onOpenScheduleModal(
                          item.deal,
                          item.video || item.deal.videos[0]
                        );
                      }
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
                  >
                    {item.type === 'awaiting' ? 'Set Dates' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
