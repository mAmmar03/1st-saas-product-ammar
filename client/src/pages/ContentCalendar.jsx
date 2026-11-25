import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  FileText,
  Camera,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';

export default function ContentCalendar({
  deals = [],
  onOpenScheduleModal,
  onOpenDossier,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState('all'); // 'all' | 'reels' | 'drafts' | 'shoots'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Flatten all calendar events from deals
  const allEvents = useMemo(() => {
    const events = [];

    deals.forEach((deal) => {
      deal.videos?.forEach((video, vIdx) => {
        // 1. Scheduled Live Date
        if (video.scheduledDate) {
          events.push({
            id: `reel_${deal._id}_${vIdx}`,
            dateStr: new Date(video.scheduledDate).toISOString().split('T')[0],
            type: 'reel',
            title: video.videoType || 'Instagram Reel',
            status: video.status || 'Scheduled',
            influencerName: deal.influencer?.name || 'Unknown Influencer',
            influencerHandle: deal.influencer?.instagramHandle || '',
            influencerAvatar: deal.influencer?.avatar || null,
            campaignName: deal.campaignName || 'General Campaign',
            spNumber: deal.spNumber || '',
            deal,
            video,
            videoIndex: vIdx,
          });
        }

        // 2. Draft Due Date
        if (video.draftDate) {
          events.push({
            id: `draft_${deal._id}_${vIdx}`,
            dateStr: new Date(video.draftDate).toISOString().split('T')[0],
            type: 'draft',
            title: `Draft Due: ${video.videoType || 'Reel'}`,
            status: video.status === 'Draft Received' || video.status === 'Approved' ? 'Received' : 'Pending Draft',
            influencerName: deal.influencer?.name || 'Unknown Influencer',
            influencerHandle: deal.influencer?.instagramHandle || '',
            influencerAvatar: deal.influencer?.avatar || null,
            campaignName: deal.campaignName || 'General Campaign',
            spNumber: deal.spNumber || '',
            deal,
            video,
            videoIndex: vIdx,
          });
        }

        // 3. Shoot Date
        if (video.shootDate) {
          events.push({
            id: `shoot_${deal._id}_${vIdx}`,
            dateStr: new Date(video.shootDate).toISOString().split('T')[0],
            type: 'shoot',
            title: `Video Shoot: ${video.videoType || 'Content'}`,
            status: 'Shoot Scheduled',
            influencerName: deal.influencer?.name || 'Unknown Influencer',
            influencerHandle: deal.influencer?.instagramHandle || '',
            influencerAvatar: deal.influencer?.avatar || null,
            campaignName: deal.campaignName || 'General Campaign',
            spNumber: deal.spNumber || '',
            deal,
            video,
            videoIndex: vIdx,
          });
        }
      });
    });

    return events;
  }, [deals]);

  // Filter events based on active category & search string
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (eventTypeFilter !== 'all') {
        if (eventTypeFilter === 'reels' && ev.type !== 'reel') return false;
        if (eventTypeFilter === 'drafts' && ev.type !== 'draft') return false;
        if (eventTypeFilter === 'shoots' && ev.type !== 'shoot') return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = ev.influencerName.toLowerCase().includes(query);
        const matchesHandle = ev.influencerHandle.toLowerCase().includes(query);
        const matchesCampaign = ev.campaignName.toLowerCase().includes(query);
        const matchesSP = ev.spNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesHandle && !matchesCampaign && !matchesSP) return false;
      }
      return true;
    });
  }, [allEvents, eventTypeFilter, searchTerm]);

  // Map events by dateStr ('YYYY-MM-DD')
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((ev) => {
      if (!map[ev.dateStr]) map[ev.dateStr] = [];
      map[ev.dateStr].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Calendar Grid Days Calculation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate[dateStr] || [],
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      // Format as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: eventsByDate[dateStr] || [],
      });
    }

    // Next month padding to fill a complete 35 or 42 grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextD = 1; nextD <= remaining; nextD++) {
      const nextDate = new Date(year, month + 1, nextD);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({
        dayNumber: nextD,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate[dateStr] || [],
      });
    }

    return cells;
  }, [year, month, eventsByDate]);

  // Month Statistics
  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    let reels = 0;
    let drafts = 0;
    let shoots = 0;

    allEvents.forEach((ev) => {
      if (ev.dateStr.startsWith(monthPrefix)) {
        if (ev.type === 'reel') reels++;
        if (ev.type === 'draft') drafts++;
        if (ev.type === 'shoot') shoots++;
      }
    });

    return { total: reels + drafts + shoots, reels, drafts, shoots };
  }, [allEvents, year, month]);

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    if (onOpenScheduleModal) {
      onOpenScheduleModal({
        deal: event.deal,
        videoIndex: event.videoIndex,
        video: event.video,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Top Header & Month Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-subtle">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Content & Deliverables Calendar
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                  {monthStats.total} Events This Month
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-page schedule view of live reels, video shoot dates, and creator draft deadlines
              </p>
            </div>
          </div>
        </div>

        {/* Month Navigation & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-xs transition active:scale-95"
          >
            Today
          </button>

          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl shadow-xs p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-800 tracking-wide min-w-[140px] text-center select-none">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Deliverables
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {monthStats.total}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-rose-100 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Live Reels Scheduled
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {monthStats.reels}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-violet-100 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider block">
              Drafts Expected
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {monthStats.drafts}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block">
              Shoots Scheduled
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {monthStats.shoots}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setEventTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              eventTypeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Scheduled ({allEvents.length})
          </button>

          <button
            onClick={() => setEventTypeFilter('reels')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              eventTypeFilter === 'reels'
                ? 'bg-rose-600 text-white shadow-subtle'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70 border border-rose-200/50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Live Reels
          </button>

          <button
            onClick={() => setEventTypeFilter('drafts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              eventTypeFilter === 'drafts'
                ? 'bg-violet-700 text-white shadow-subtle'
                : 'bg-violet-50 text-violet-800 hover:bg-violet-100/70 border border-violet-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Drafts Tracked
          </button>

          <button
            onClick={() => setEventTypeFilter('shoots')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              eventTypeFilter === 'shoots'
                ? 'bg-sky-700 text-white shadow-subtle'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100/70 border border-sky-200/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Shoots
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creator or campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
          />
        </div>
      </div>

      {/* Main Full-Page Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 text-center text-xs font-bold tracking-wider uppercase ${
                idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Day Boxes Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/40">
          {calendarCells.map((cell, idx) => {
            const hasEvents = cell.events.length > 0;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayEvents(cell)}
                className={`min-h-[125px] sm:min-h-[145px] p-2 bg-white flex flex-col justify-between transition-colors group cursor-pointer ${
                  !cell.isCurrentMonth ? 'bg-slate-50/50 text-slate-400 opacity-60' : 'hover:bg-slate-50/70'
                } ${cell.isToday ? 'ring-2 ring-inset ring-slate-900' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      cell.isToday
                        ? 'bg-slate-900 text-white'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-700 transition">
                      {cell.events.length} event{cell.events.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day Events Pills */}
                <div className="space-y-1.5 overflow-y-auto max-h-[85px] sm:max-h-[105px] pr-0.5 custom-scrollbar flex-1">
                  {cell.events.slice(0, 3).map((ev) => {
                    let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                    let Icon = Video;

                    if (ev.type === 'reel') {
                      badgeStyle = 'bg-rose-50 hover:bg-rose-100/80 text-rose-900 border-rose-200/80';
                      Icon = Video;
                    } else if (ev.type === 'draft') {
                      badgeStyle = 'bg-violet-50 hover:bg-violet-100/80 text-violet-900 border-violet-200/80';
                      Icon = FileText;
                    } else if (ev.type === 'shoot') {
                      badgeStyle = 'bg-sky-50 hover:bg-sky-100/80 text-sky-900 border-sky-200/80';
                      Icon = Camera;
                    }

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => handleEventClick(e, ev)}
                        title={`${ev.influencerName} — ${ev.title} (${ev.status})`}
                        className={`px-1.5 py-1 rounded-md text-[10px] border flex items-center gap-1.5 truncate cursor-pointer transition shadow-2xs font-medium ${badgeStyle}`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="truncate font-semibold">{ev.influencerName}</span>
                        <span className="text-[9px] opacity-80 shrink-0 hidden sm:inline">
                          ({ev.type === 'reel' ? 'Reel' : ev.type === 'draft' ? 'Draft' : 'Shoot'})
                        </span>
                      </div>
                    );
                  })}

                  {cell.events.length > 3 && (
                    <div className="text-[10px] text-center font-bold text-slate-500 py-0.5 bg-slate-50 rounded border border-slate-200/60">
                      +{cell.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Modal Details Popover */}
      {selectedDayEvents && selectedDayEvents.events.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scheduled Deliverables: {selectedDayEvents.dateStr}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayEvents.events.length} item(s) booked for this day
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayEvents.events.map((ev) => {
                const isReel = ev.type === 'reel';
                const isDraft = ev.type === 'draft';

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isReel
                        ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                        : isDraft
                        ? 'bg-violet-50/50 border-violet-200 text-violet-950'
                        : 'bg-sky-50/50 border-sky-200 text-sky-950'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isReel
                            ? 'bg-rose-100 text-rose-700'
                            : isDraft
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {isReel ? (
                          <Video className="w-4 h-4" />
                        ) : isDraft ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {ev.influencerName}
                          </h4>
                          {ev.spNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                              SP# {ev.spNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {ev.title} • {ev.campaignName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          setSelectedDayEvents(null);
                          handleEventClick(e, ev);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs"
                      >
                        Manage
                      </button>

                      {onOpenDossier && ev.deal.influencer?._id && (
                        <button
                          onClick={() => {
                            setSelectedDayEvents(null);
                            onOpenDossier(ev.deal.influencer._id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition"
                          title="View Creator Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
