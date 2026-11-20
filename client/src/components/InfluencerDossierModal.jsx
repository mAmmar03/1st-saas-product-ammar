import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Package,
  Video,
  CreditCard,
  ExternalLink,
  Calendar,
  FileText,
  Truck,
  Scissors,
  User,
  Camera,
} from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';

export default function InfluencerDossierModal({ influencerId, onClose, onRefresh }) {
  const { showAlert } = useAlert();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (influencerId) {
      loadDossier();
    }
  }, [influencerId]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      const res = await api.getInfluencerDossier(influencerId);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Photo must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        setUploadingPhoto(true);
        await api.updateInfluencer(influencerId, { profileImage: base64 });
        showAlert('Creator photo updated!', 'success');
        setData((prev) => ({
          ...prev,
          profile: { ...prev.profile, profileImage: base64 },
        }));
        if (onRefresh) onRefresh();
      } catch (err) {
        showAlert('Failed to update photo', 'error');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!influencerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-modal text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Influencer Bio-Data & Lifetime Dossier
              </h2>
              <p className="text-xs text-slate-400">
                Complete profile, lifetime collaborations & parcel history
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

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading bio-data dossier...
          </div>
        ) : !data ? (
          <div className="p-10 text-center text-slate-400 text-xs">Profile record not found.</div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
            {/* Top Influencer Profile Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {data.profile.profileImage ? (
                    <img
                      src={data.profile.profileImage}
                      alt={data.profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-slate-300" />
                  )}

                  <label
                    title="Upload / Change creator photo"
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[9px] font-semibold"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{data.profile.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="font-medium text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {data.profile.primaryPlatform || 'Instagram'}: {data.profile.instagramHandle}
                    </span>
                    <span className="text-slate-600 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {(data.profile.followers || 0).toLocaleString()} Followers
                    </span>
                    <span className="text-slate-600 px-2 py-0.5 rounded-md bg-white border border-slate-200 flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-slate-400" />
                      Size: <strong className="text-slate-900">{data.profile.preferredSize || 'Medium'}</strong>
                    </span>
                    {data.profile.niche && (
                      <span className="text-slate-600 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                        {data.profile.niche}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="text-xs space-y-1 font-mono text-zinc-700 md:text-right">
                {data.profile.phone && (
                  <p className="flex items-center gap-1.5 md:justify-end">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" /> {data.profile.phone}
                  </p>
                )}
                {data.profile.city && (
                  <p className="flex items-center gap-1.5 md:justify-end">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {data.profile.city}
                  </p>
                )}
                {data.profile.email && (
                  <p className="flex items-center gap-1.5 md:justify-end">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {data.profile.email}
                  </p>
                )}
              </div>
            </div>

            {/* Lifetime KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 border border-zinc-200 bg-white">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Collabs</span>
                <span className="text-2xl font-bold text-zinc-900 mt-1 block">
                  {data.stats.totalCollaborations}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Completed deals</span>
              </div>

              <div className="p-3.5 border border-zinc-200 bg-white">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Deal Value</span>
                <span className="text-2xl font-bold text-zinc-900 mt-1 block font-mono">
                  Rs. {data.stats.totalAgreedValue.toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Paid: Rs. {data.stats.totalPaidValue.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 border border-zinc-200 bg-white">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">PR Articles Received</span>
                <span className="text-2xl font-bold text-zinc-900 mt-1 block">
                  {data.stats.totalArticlesReceived} pcs
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Dispatched products</span>
              </div>

              <div className="p-3.5 border border-zinc-200 bg-white">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Live Videos</span>
                <span className="text-2xl font-bold text-zinc-900 mt-1 block">
                  {data.stats.videosDelivered}
                  <span className="text-xs text-zinc-400 font-normal ml-1">
                    / {data.stats.videosDelivered + data.stats.videosPending}
                  </span>
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {data.stats.videosPending} videos pending
                </span>
              </div>
            </div>

            {/* Section 1: PR Articles Sent to this Creator */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                PR Articles Sent to This Creator ({data.articlesList.length})
              </h4>
              {data.articlesList.length === 0 ? (
                <div className="p-3 border border-zinc-200 bg-zinc-50 text-xs text-zinc-500 text-center font-mono">
                  No PR parcels have been sent to this creator yet.
                </div>
              ) : (
                <div className="border border-zinc-200 overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[500px]">
                    <thead className="bg-zinc-50 border-b border-zinc-200 uppercase text-[10px] font-bold text-zinc-600 font-mono">
                      <tr>
                        <th className="p-2.5">Article Name & SKU</th>
                        <th className="p-2.5">Campaign</th>
                        <th className="p-2.5">Qty</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Tracking / Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.articlesList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/60">
                          <td className="p-2.5 font-semibold text-zinc-900">
                            {item.articleName}
                            <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                              SKU: {item.articleCode}
                            </span>
                          </td>
                          <td className="p-2.5 text-zinc-700">{item.dealCampaign}</td>
                          <td className="p-2.5 font-bold font-mono text-zinc-900">{item.quantity} pc(s)</td>
                          <td className="p-2.5">
                            <span className="border border-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase bg-white">
                              {item.dispatchStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-zinc-700 font-mono">
                            {item.trackingNumber ? (
                              <span>CN: <strong>{item.trackingNumber}</strong></span>
                            ) : (
                              <span className="text-zinc-400">No tracking #</span>
                            )}
                            {item.dispatchDate && (
                              <span className="block text-[10px] text-zinc-400">
                                {new Date(item.dispatchDate).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Deliverables & Video History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                Video Deliverables & Post Links ({data.allVideos.length})
              </h4>
              {data.allVideos.length === 0 ? (
                <div className="p-3 border border-zinc-200 bg-zinc-50 text-xs text-zinc-500 text-center font-mono">
                  No deliverables scheduled yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.allVideos.map((video, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-zinc-200 bg-white flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{video.videoType}</span>
                          <span className="border border-zinc-200 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-zinc-50">
                            {video.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">Campaign: {video.campaign}</p>
                        <p className="text-[11px] text-zinc-600 font-mono">
                          Live Date: {new Date(video.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>

                      {video.liveUrl && (
                        <a
                          href={video.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 text-[10px] font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1 shrink-0"
                        >
                          View Post <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Past Deals Commercials */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Collaboration Agreements & Rates History
              </h4>
              <div className="space-y-2">
                {data.deals.map((deal) => (
                  <div
                    key={deal._id}
                    className="p-3 border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {deal.spNumber && (
                          <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-mono font-bold text-[10px]">
                            {deal.spNumber}
                          </span>
                        )}
                        <span className="font-bold text-sm text-zinc-900">
                          {deal.campaignName}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          ({new Date(deal.agreedDate).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-700 mt-0.5">
                        Rate Per Video: <strong className="text-zinc-900">Rs. {deal.ratePerVideo.toLocaleString()}</strong>
                      </p>
                      {deal.pastDealNotes && (
                        <p className="text-[11px] text-zinc-500 italic mt-0.5">
                          "{deal.pastDealNotes}"
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right font-mono">
                      <div className="text-sm font-bold text-zinc-900">
                        Total: Rs. {deal.agreedRate.toLocaleString()}
                      </div>
                      <span className="inline-block border border-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase mt-1 bg-white">
                        {deal.payment?.status || 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Shipping Address & Bank Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 border border-zinc-200 bg-white text-xs">
              <div>
                <span className="font-bold uppercase text-zinc-800 block mb-1">
                  PR Delivery Address:
                </span>
                <p className="text-zinc-700 font-sans">
                  {data.profile.shippingAddress || 'No shipping address recorded.'}
                </p>
                {data.profile.city && <p className="text-zinc-500 mt-1 font-mono">City: {data.profile.city}</p>}
              </div>

              <div>
                <span className="font-bold uppercase text-zinc-800 block mb-1">
                  Bank Account Details:
                </span>
                {data.profile.bankDetails?.bankName ? (
                  <div className="space-y-0.5 text-zinc-700 font-mono text-[11px]">
                    <p>Bank: {data.profile.bankDetails.bankName}</p>
                    <p>Title: {data.profile.bankDetails.accountTitle}</p>
                    <p>Account #: {data.profile.bankDetails.accountNumber}</p>
                    {data.profile.bankDetails.iban && <p>IBAN: {data.profile.bankDetails.iban}</p>}
                  </div>
                ) : (
                  <p className="text-zinc-400 font-mono">No bank credentials added.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 transition"
          >
            Close Bio-Data
          </button>
        </div>
      </div>
    </div>
  );
}
