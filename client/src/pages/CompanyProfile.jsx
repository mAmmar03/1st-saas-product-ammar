import React from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Edit,
  Shield,
  Package,
  Users,
  CreditCard,
  Printer,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

export default function CompanyProfile({
  brandProfile,
  deals = [],
  articles = [],
  onOpenEditSettings,
  onOpenPermissions,
  onOpenWeeklySheet,
}) {
  const { isSuperAdmin, hasPermission } = useRole();

  const brandName = brandProfile?.brandName || 'Brand Workspace';
  const tagline = brandProfile?.tagline || 'Luxury Pret & Influencer PR Management';

  // Aggregate stats for this company
  let totalDressesSent = 0;
  let totalBudget = 0;
  let totalPaid = 0;
  const uniqueInfluencerIds = new Set();

  deals.forEach((deal) => {
    totalBudget += deal.agreedRate || 0;
    totalPaid += deal.payment?.advancePaid || 0;
    if (deal.influencer?._id) uniqueInfluencerIds.add(deal.influencer._id);

    deal.prArticles?.forEach((p) => {
      if (p.dispatchStatus === 'Dispatched' || p.dispatchStatus === 'Delivered') {
        totalDressesSent += p.quantity || 1;
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header - Unframed Natural Brand Showcase */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Brand Logo - Pure Natural Display Without Boxed Frames */}
          <div className="flex items-center justify-center shrink-0">
            {brandProfile?.brandLogo ? (
              <img
                src={brandProfile.brandLogo}
                alt={brandName}
                className="h-16 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Building2 className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {brandName}
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
                Active Brand
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {tagline}
            </p>

            <div className="pt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              {brandProfile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {brandProfile.phone}
                </span>
              )}
              {brandProfile?.instagramHandle && (
                <span className="flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-slate-400" /> {brandProfile.instagramHandle}
                </span>
              )}
              {brandProfile?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {brandProfile.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('canEditBrandProfile') && (
            <button
              onClick={onOpenEditSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-subtle active:scale-[0.98]"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Brand Details & Logo
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={onOpenPermissions}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-xs active:scale-[0.98]"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              Role Authority Settings
            </button>
          )}

          <button
            onClick={onOpenWeeklySheet}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-xs active:scale-[0.98]"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Weekly Sheet
          </button>
        </div>
      </div>

      {/* Brand Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-slate-400 font-medium block">
            Creators Engaged
          </span>
          <span className="text-2xl font-bold text-slate-900">
            {uniqueInfluencerIds.size}
          </span>
          <p className="text-[11px] text-slate-500">
            Total creators on brand roster
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-slate-400 font-medium block">
            PR Garments Sent
          </span>
          <span className="text-2xl font-bold text-slate-900">
            {totalDressesSent} <span className="text-sm font-normal text-slate-400">pcs</span>
          </span>
          <p className="text-[11px] text-slate-500">
            Dispatched via courier packages
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-slate-400 font-medium block">
            Total Collab Budget
          </span>
          <span className="text-2xl font-bold text-slate-900">
            Rs. {totalBudget.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500">
            Agreed influencer spend
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-slate-400 font-medium block">
            Paid Disbursements
          </span>
          <span className="text-2xl font-bold text-emerald-600">
            Rs. {totalPaid.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500">
            Verified with attached bank slips
          </p>
        </div>
      </div>

      {/* Brand Profile Details & Courier Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            Official Brand Record
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Company Name</span>
              <strong className="text-slate-900 text-sm font-semibold">{brandName}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Tagline</span>
              <span className="text-slate-700">{tagline}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Phone / WhatsApp</span>
              <span className="text-slate-700">{brandProfile?.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Instagram</span>
              <span className="text-slate-700">{brandProfile?.instagramHandle || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">City</span>
              <span className="text-slate-700">{brandProfile?.city || 'Lahore, Pakistan'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Authorized Signatory</span>
              <strong className="text-slate-900 font-semibold">{brandProfile?.authorizedSignatory || 'Ammar / PR Manager'}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">
              Return / Warehouse Address (Printed on Consignment Slips):
            </span>
            <p className="text-xs text-slate-700 mt-1">
              {brandProfile?.address || 'No return address configured yet. Click "Edit Brand Details" to enter your warehouse address.'}
            </p>
          </div>
        </div>

        {/* Active PR Articles for this Brand */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            Active PR Garment Lines ({articles.length})
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {articles.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No articles registered yet.</p>
            ) : (
              articles.map((art) => (
                <div key={art._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block font-semibold">{art.name}</strong>
                    <span className="text-[11px] text-slate-400">
                      Code: {art.articleCode} ? {art.category}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="block text-slate-800 font-medium">
                      <strong>{art.sentPieces || 0}</strong> / {art.totalPRQuota} Sent
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {art.remainingPieces || 0} remaining in PR
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
