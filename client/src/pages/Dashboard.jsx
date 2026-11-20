import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  Calendar,
  CreditCard,
  Video,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, onOpenNewDeal, onOpenDossier }) {
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, dealsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getDeals(),
      ]);
      setStats(statsRes.data);
      setDeals(dealsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-medium text-slate-400">
          Loading metrics...
        </div>
      </div>
    );
  }

  // Get upcoming video schedules
  const upcomingVideos = [];
  deals.forEach((deal) => {
    deal.videos.forEach((vid) => {
      if (vid.status !== 'Video Live') {
        upcomingVideos.push({
          dealId: deal._id,
          spNumber: deal.spNumber,
          influencer: deal.influencer,
          campaign: deal.campaignName,
          videoType: vid.videoType,
          scheduledDate: vid.scheduledDate,
          status: vid.status,
          notes: vid.notes,
        });
      }
    });
  });

  upcomingVideos.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner - Soft, Modern Unlisted Trade SaaS Style */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Overview Hub
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Influencer Collaborations & PR Operations
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time PR piece deductions, creator bio-data dossiers, video shoot dates & payment vouchers
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('inventory')}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs active:scale-[0.98] text-center"
          >
            Check PR Stock
          </button>
          <button
            onClick={onOpenNewDeal}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 shadow-subtle active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Collab
          </button>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: PR Stock */}
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>PR Stock Available</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {stats?.inventory?.remaining || 0}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                / {stats?.inventory?.totalQuota || 0} remaining
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{stats?.inventory?.sent || 0} pcs</strong> dispatched to creators
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600">
              {stats?.inventory?.totalQuota > 0
                ? Math.round((stats.inventory.sent / stats.inventory.totalQuota) * 100)
                : 0}
              % Allotted
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              Stock <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2: Financial Spend */}
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Agreed Collab Spend</span>
              <CreditCard className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              Rs. {(stats?.finance?.agreed || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Paid: <strong className="text-emerald-600">Rs. {(stats?.finance?.paid || 0).toLocaleString()}</strong></span>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200/60">
                {stats?.barterDealsCount || 0} Barter PR
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              Pending: Rs. {(stats?.finance?.pending || 0).toLocaleString()}
            </span>
            <button
              onClick={() => setActiveTab('deals')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              Deals <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Video Deliverables */}
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Deliverables Status</span>
              <Video className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {stats?.videos?.live || 0}
              <span className="text-xs font-normal text-emerald-600 ml-1.5 font-semibold">Live</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{stats?.videos?.pending || 0}</strong> videos in progress
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              {(stats?.videos?.live || 0) + (stats?.videos?.pending || 0)} Total Deliverables
            </span>
            <button
              onClick={() => setActiveTab('deals')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              Schedule <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Influencers */}
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Creators</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {stats?.influencers || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Deals: <strong>{stats?.deals || 0}</strong>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              Bio-Data Dossiers
            </span>
            <button
              onClick={() => setActiveTab('influencers')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Live Dates & Latest Collaborations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Deliverables */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-slate-600" />
              Upcoming Video Live Dates
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {upcomingVideos.length}
            </span>
          </div>

          {upcomingVideos.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">
              No upcoming videos queued.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingVideos.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {item.influencer?.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200 text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span className="font-medium text-slate-800">{item.videoType}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  {item.spNumber && (
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Ref: {item.spNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Collaborations List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              Active Collaborations & Deals
            </h3>
            <button
              onClick={() => setActiveTab('deals')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              See All Deals <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {deals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No collaborations entered yet. Click "New Collab" in the sidebar to add!
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">SP# & Influencer</th>
                    <th className="p-2.5">Agreed Price</th>
                    <th className="p-2.5">Rate / Video</th>
                    <th className="p-2.5">PR Pieces</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.slice(0, 6).map((deal) => (
                    <tr key={deal._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          {deal.spNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-medium text-[10px]">
                              {deal.spNumber}
                            </span>
                          )}
                          <button
                            onClick={() => onOpenDossier(deal.influencer?._id)}
                            className="text-left font-semibold text-slate-900 hover:underline block"
                          >
                            {deal.influencer?.name}
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {deal.influencer?.instagramHandle}
                        </span>
                      </td>

                      <td className="p-2.5 font-semibold text-slate-900">
                        Rs. {deal.agreedRate?.toLocaleString()}
                      </td>

                      <td className="p-2.5 text-slate-600">
                        Rs. {deal.ratePerVideo?.toLocaleString()}
                      </td>

                      <td className="p-2.5 text-slate-600">
                        {deal.prArticles?.length || 0} dress(es)
                      </td>

                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          deal.payment?.status === 'Fully Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : deal.payment?.status === 'Partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {deal.payment?.status}
                        </span>
                      </td>

                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => onOpenDossier(deal.influencer?._id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98]"
                        >
                          Bio-Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
