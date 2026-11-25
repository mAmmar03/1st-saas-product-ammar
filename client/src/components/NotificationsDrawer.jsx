import React from 'react';
import {
  X,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  PackageCheck,
  Video,
  FileText,
  Sparkles,
  CheckCircle,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';

export default function NotificationsDrawer({
  isOpen,
  onClose,
  deals = [],
  dismissedAlertIds = [],
  onDismissAlert,
  onDismissAllAlerts,
  onOpenScheduleModal,
  onOpenAlertsPage,
}) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueToday = [];
  const draftAlerts = [];
  const upcomingWeek = [];
  const awaitingDate = [];
  const overdue = [];

  deals.forEach((deal) => {
    // 1. Delivered PR parcels without scheduled reel date
    const isDelivered = deal.prArticles?.some((p) => p.dispatchStatus === 'Delivered');
    const hasUnscheduledVideo = deal.videos?.some((v) => !v.scheduledDate && v.status !== 'Video Live');

    const alertIdAwaiting = `awaiting_${deal._id}`;
    if (isDelivered && hasUnscheduledVideo && !dismissedAlertIds.includes(alertIdAwaiting)) {
      awaitingDate.push({
        id: alertIdAwaiting,
        deal,
        influencer: deal.influencer,
        article: deal.prArticles?.[0]?.article?.name || 'PR Garment',
        spNumber: deal.spNumber,
      });
    }

    // 2. Scheduled reels & drafts
    deal.videos?.forEach((video, vIdx) => {
      // 2a. Drafts alert
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
              type: 'today',
              deal,
              video,
              videoIndex: vIdx,
              dateStr: draftStr,
            });
          } else if (draftDiffDays > 0 && draftDiffDays <= 7) {
            draftAlerts.push({
              id: draftAlertId,
              type: 'upcoming',
              deal,
              video,
              videoIndex: vIdx,
              diffDays: draftDiffDays,
              dateStr: draftStr,
            });
          } else if (draftDiffDays < 0) {
            draftAlerts.push({
              id: draftAlertId,
              type: 'overdue',
              deal,
              video,
              videoIndex: vIdx,
              daysOverdue: Math.abs(draftDiffDays),
              dateStr: draftStr,
            });
          }
        }
      }

      // 2b. Scheduled live reel alert
      if (video.status === 'Video Live') return;

      if (video.scheduledDate) {
        const schedDate = new Date(video.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        const schedStr = schedDate.toISOString().split('T')[0];
        const diffDays = Math.round((schedDate - now) / (1000 * 60 * 60 * 24));

        const alertId = `reel_${deal._id}_${vIdx}`;
        if (dismissedAlertIds.includes(alertId)) return;

        if (schedStr === todayStr) {
          dueToday.push({ id: alertId, deal, video, videoIndex: vIdx });
        } else if (diffDays > 0 && diffDays <= 7) {
          upcomingWeek.push({ id: alertId, deal, video, videoIndex: vIdx, diffDays });
        } else if (diffDays < 0) {
          overdue.push({ id: alertId, deal, video, videoIndex: vIdx, daysOverdue: Math.abs(diffDays) });
        }
      }
    });
  });

  const totalAlerts =
    dueToday.length + draftAlerts.length + upcomingWeek.length + awaitingDate.length + overdue.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-backdrop-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200/80 shadow-2xl flex flex-col font-sans animate-drawer-in">
          {/* Drawer Top Header - Clean Luxury */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  Alerts & Notifications
                </h3>
                <p className="text-xs text-slate-400">
                  {totalAlerts} item{totalAlerts !== 1 ? 's' : ''} requiring review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {totalAlerts > 0 && (
                <button
                  onClick={onDismissAllAlerts}
                  title="Dismiss All Alerts"
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition text-xs font-semibold flex items-center gap-1 border border-slate-200/60"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* 1. Distinct Drafts Tracked Section */}
            {draftAlerts.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-violet-100">
                  <span className="font-bold text-violet-950 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
                    <FileText className="w-3.5 h-3.5 text-violet-700" />
                    Drafts Expected ({draftAlerts.length})
                  </span>
                  <span className="text-[10px] text-violet-700 font-semibold bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/60">
                    Review Required
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {draftAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {item.deal.influencer?.name}
                          </span>
                          <span className="text-[11px] text-violet-800">
                            Draft Due: <strong>{item.dateStr}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.type === 'today'
                                ? 'bg-violet-700 text-white'
                                : item.type === 'overdue'
                                ? 'bg-red-600 text-white'
                                : 'bg-violet-100 text-violet-800'
                            }`}
                          >
                            {item.type === 'today'
                              ? 'Due Today'
                              : item.type === 'overdue'
                              ? `${item.daysOverdue}d Late`
                              : `In ${item.diffDays}d`}
                          </span>
                          <button
                            onClick={() => onDismissAlert(item.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600">
                        Deliverable: {item.video.videoType || 'Reel'} • {item.deal.campaignName}
                      </p>

                      <div className="pt-1.5 border-t border-violet-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {item.deal.influencer?.phone || item.deal.influencer?.instagramHandle}
                        </span>
                        <button
                          onClick={() => {
                            if (onOpenScheduleModal) {
                              onOpenScheduleModal({
                                deal: item.deal,
                                videoIndex: item.videoIndex,
                                video: item.video,
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-violet-800 text-white font-semibold text-[11px] hover:bg-violet-900 transition active:scale-[0.98] shadow-2xs"
                        >
                          Review Draft
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Reels Due Today */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Reels Due Today ({dueToday.length})
                </span>
                <span className="text-[11px] text-slate-400">{todayStr}</span>
              </div>

              {dueToday.length === 0 ? (
                <p className="text-xs text-slate-400 py-2.5">
                  No reel live deliverables scheduled for today.
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {dueToday.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {item.deal.influencer?.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.video.videoType} • {item.deal.campaignName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                            Due Today
                          </span>
                          <button
                            onClick={() => onDismissAlert(item.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-rose-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {item.deal.influencer?.phone || item.deal.influencer?.instagramHandle}
                        </span>
                        <button
                          onClick={() => {
                            if (onOpenScheduleModal) {
                              onOpenScheduleModal({
                                deal: item.deal,
                                videoIndex: item.videoIndex,
                                video: item.video,
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition active:scale-[0.98] shadow-2xs"
                        >
                          Mark Live Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Delivered Parcels Awaiting Date Scheduling */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-slate-500" />
                  Delivered → Date Needed ({awaitingDate.length})
                </span>
              </div>

              {awaitingDate.length === 0 ? (
                <p className="text-xs text-slate-400 py-2.5">
                  All delivered parcels have target dates assigned.
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {awaitingDate.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {item.influencer?.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Parcel contains: <strong>{item.article}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                            {item.spNumber || 'SP Parcel'}
                          </span>
                          <button
                            onClick={() => onDismissAlert(item.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {item.influencer?.phone || item.influencer?.instagramHandle}
                        </span>
                        <button
                          onClick={() => {
                            if (onOpenScheduleModal) {
                              onOpenScheduleModal({
                                deal: item.deal,
                                videoIndex: 0,
                                video: item.deal.videos?.[0],
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition active:scale-[0.98] shadow-2xs"
                        >
                          Assign Dates
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Upcoming Deliverables (Next 7 Days) */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Upcoming Next 7 Days ({upcomingWeek.length})
                </span>
              </div>

              {upcomingWeek.length === 0 ? (
                <p className="text-xs text-slate-400 py-2.5">
                  No deliverables scheduled for next 7 days.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {upcomingWeek.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {item.deal.influencer?.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.video.videoType} • {item.video.scheduledDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {item.diffDays === 1 ? 'Tomorrow' : `In ${item.diffDays}d`}
                        </span>
                        <button
                          onClick={() => onDismissAlert(item.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Overdue Deliverables */}
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-red-100">
                  <span className="font-bold text-red-600 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Overdue Deliverables ({overdue.length})
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {overdue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-red-50/50 rounded-xl border border-red-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.deal.influencer?.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            {item.daysOverdue}d Late
                          </span>
                          <button
                            onClick={() => onDismissAlert(item.id)}
                            className="text-slate-400 hover:text-red-700 p-0.5 rounded transition"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Target date was {item.video.scheduledDate}. Deliverable not yet live.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
            <button
              onClick={() => {
                onClose();
                if (onOpenAlertsPage) onOpenAlertsPage();
              }}
              className="text-xs font-bold text-slate-800 hover:text-slate-950 underline"
            >
              Open Full Alerts Center →
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
