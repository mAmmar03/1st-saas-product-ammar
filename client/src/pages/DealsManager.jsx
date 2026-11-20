import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Truck,
  Video,
  CreditCard,
  ExternalLink,
  Calendar,
  RotateCcw,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  Scissors,
  Receipt,
  FileText,
  Upload,
} from 'lucide-react';
import { api } from '../services/api';
import DispatchModal from '../components/DispatchModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';
import ScheduleReelModal from '../components/ScheduleReelModal';
import { useAlert } from '../context/AlertContext';
import { useRole } from '../context/RoleContext';

export default function DealsManager({ onOpenNewDeal, onOpenDossier }) {
  const { showAlert, showConfirm } = useAlert();
  const { hasPermission, isSuperAdmin } = useRole();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Paid Collab' | 'Barter PR'

  // Modals state
  const [dispatchModalItem, setDispatchModalItem] = useState(null);
  const [receiptModalDeal, setReceiptModalDeal] = useState(null);
  const [schedulingModalItem, setSchedulingModalItem] = useState(null);

  const [paymentEditDeal, setPaymentEditDeal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    advancePaid: 0,
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    slipImage: '',
  });

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

  const handleOpenDispatch = (deal, prItem) => {
    setDispatchModalItem({
      dealId: deal._id,
      prItemId: prItem._id,
      influencerName: deal.influencer?.name,
      articleName: prItem.article?.name,
      quantity: prItem.quantity,
      size: prItem.size || deal.influencer?.preferredSize || 'Medium',
      shippingAddress: deal.influencer?.shippingAddress,
      currentSpNumber: deal.spNumber || '',
    });
  };

  const handleMarkDelivered = async (dealId, prItemId) => {
    try {
      await api.deliverPR(dealId, prItemId);
      showAlert('PR Parcel marked as Delivered! Ready for reel scheduling.', 'success');
      loadDeals();
    } catch (err) {
      showAlert('Failed to update delivery status', 'error');
    }
  };

  const handleRevertPR = (dealId, prItemId) => {
    showConfirm({
      title: 'Revert PR Dispatch?',
      message: 'Are you sure you want to revert this dispatch? It will restore the deducted pieces back to PR inventory.',
      confirmText: 'Yes, Revert Stock',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.revertPR(dealId, prItemId);
          showAlert('PR Dispatch reverted & inventory restored successfully!', 'success');
          loadDeals();
        } catch (err) {
          showAlert(err.response?.data?.error || 'Failed to revert dispatch', 'error');
        }
      },
    });
  };

  const handleSetDeliverableStatus = async (dealId, videoId, newStatus) => {
    try {
      await api.updateVideo(dealId, videoId, { status: newStatus });
      showAlert(`Deliverable updated to: ${newStatus}`, 'success');
      loadDeals();
    } catch (err) {
      showAlert('Failed to update deliverable status', 'error');
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
      showAlert('Live Instagram post URL saved!', 'success');
      setVideoLinkModal(null);
      setVideoLinkUrl('');
      loadDeals();
    } catch (err) {
      showAlert('Failed to save live post link', 'error');
    }
  };

  const handleOpenPaymentEdit = (deal) => {
    setPaymentEditDeal(deal);
    setPaymentForm({
      advancePaid: deal.payment?.advancePaid || 0,
      paymentMethod: deal.payment?.paymentMethod || 'Bank Transfer',
      transactionId: deal.payment?.transactionId || '',
      slipImage: deal.payment?.slipImage || '',
    });
  };

  const handlePaymentSlipUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentForm((prev) => ({
        ...prev,
        slipImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleQuickMarkFullyPaid = (deal) => {
    showConfirm({
      title: 'Mark Full Payment as Paid?',
      message: `Confirm that full agreed amount (Rs. ${deal.agreedRate?.toLocaleString()}) has been paid to ${deal.influencer?.name}?`,
      confirmText: 'Yes, Mark Paid',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.updatePayment(deal._id, {
            advancePaid: deal.agreedRate,
            status: 'Fully Paid',
          });
          showAlert('Payment marked as Fully Paid!', 'success');
          loadDeals();
        } catch (err) {
          showAlert('Failed to update payment', 'error');
        }
      },
    });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentEditDeal) return;

    try {
      await api.updatePayment(paymentEditDeal._id, {
        advancePaid: Number(paymentForm.advancePaid),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        slipImage: paymentForm.slipImage,
      });
      showAlert('Payment record updated!', 'success');
      setPaymentEditDeal(null);
      loadDeals();
    } catch (err) {
      showAlert('Failed to update payment', 'error');
    }
  };

  const handleDeleteDeal = (id) => {
    showConfirm({
      title: 'Delete Collaboration Deal?',
      message: 'Are you sure you want to delete this collaboration deal? Any dispatched stock will be restored to inventory.',
      confirmText: 'Yes, Delete Deal',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.deleteDeal(id);
          showAlert('Deal deleted and stock restored!', 'success');
          loadDeals();
        } catch (err) {
          showAlert('Failed to delete deal', 'error');
        }
      },
    });
  };

  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.influencer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.influencer?.instagramHandle?.toLowerCase().includes(search.toLowerCase()) ||
      d.campaignName?.toLowerCase().includes(search.toLowerCase()) ||
      d.spNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || d.dealStatus === filterStatus;
    const matchesType = filterType === 'All' || (d.dealType || 'Paid Collab') === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const paidCount = deals.filter((d) => d.dealType !== 'Barter PR').length;
  const barterCount = deals.filter((d) => d.dealType === 'Barter PR').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold uppercase text-zinc-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-zinc-700" />
            Campaigns & Deals Manager
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage parcel dispatches, generate payment vouchers/slips, and track creator collabs.
          </p>
        </div>

        <button
          onClick={onOpenNewDeal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 transition shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Collab
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2.5 bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-subtle">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, SP# (e.g. SP# 17778), or influencer handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
            />
          </div>

          {/* Deal Type Switcher Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setFilterType('All')}
              className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition ${
                filterType === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All ({deals.length})
            </button>
            <button
              onClick={() => setFilterType('Paid Collab')}
              className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition ${
                filterType === 'Paid Collab'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Paid ({paidCount})
            </button>
            <button
              onClick={() => setFilterType('Barter PR')}
              className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition ${
                filterType === 'Barter PR'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Barter ({barterCount})
            </button>
          </div>
        </div>

        {/* Status Filter Sub-row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-medium mr-1">Status:</span>
          {['All', 'Agreed', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-0.5 rounded transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Collaborations Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading collaborations...
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200/80 text-center space-y-3 shadow-subtle">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No Collaborations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a collaboration to record garment sizes, rates, and schedule content deliverables.
          </p>
          <button
            onClick={onOpenNewDeal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            Create New Collab
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal._id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Card Top Banner - Unframed Avatar & Clean Typography */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {deal.influencer?.profileImage ? (
                    <img
                      src={deal.influencer.profileImage}
                      alt={deal.influencer.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                      {deal.influencer?.name?.charAt(0) || 'I'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {deal.spNumber && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono font-medium text-[11px] rounded">
                          {deal.spNumber}
                        </span>
                      )}
                      {deal.dealType === 'Barter PR' ? (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-full border border-purple-200">
                          Barter PR (Product Only)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full border border-emerald-200">
                          Paid Collab
                        </span>
                      )}
                      <h3
                        onClick={() => onOpenDossier(deal.influencer?._id)}
                        className="font-bold text-sm text-slate-900 hover:underline cursor-pointer"
                      >
                        {deal.influencer?.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {deal.influencer?.instagramHandle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Campaign: <strong className="text-slate-700">{deal.campaignName}</strong></span>
                      <span>•</span>
                      <span>Agreed: {new Date(deal.agreedDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Commercials Box & Top Actions */}
                <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {deal.dealType === 'Barter PR' ? (
                    <div className="text-left md:text-right bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200/70">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block">
                        Barter PR Exchange
                      </span>
                      <span className="text-xs font-mono font-extrabold text-purple-900">
                        Rs. 0 (Nil Fees)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Agreed Total
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          Rs. {deal.agreedRate?.toLocaleString()}
                        </span>
                      </div>

                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Rate / Video
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Rs. {deal.ratePerVideo?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                    {/* Payment Voucher / Slip Button */}
                    <button
                      onClick={() => setReceiptModalDeal(deal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
                      title={deal.dealType === 'Barter PR' ? 'View Barter PR Consignment Voucher' : 'View payment voucher and slip'}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{deal.dealType === 'Barter PR' ? 'Consignment Slip' : 'Payment Slip'}</span>
                      <span className="sm:hidden">Slip</span>
                    </button>

                    <button
                      onClick={() => onOpenDossier(deal.influencer?._id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition"
                    >
                      Bio-Data
                    </button>

                    {(hasPermission('canDeleteRecords') || hasPermission('canDeleteDeals') || isSuperAdmin) && (
                      <button
                        onClick={() => handleDeleteDeal(deal._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                        title="Delete deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body: 3 Interactive Modules (PR, Deliverables, Payment) */}
              <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 text-xs">
                {/* 1. PR Articles & Dispatch Deduction Tracker */}
                <div className="space-y-3 pt-3 lg:pt-0">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 font-mono">
                    <span className="font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5 text-xs">
                      <Truck className="w-3.5 h-3.5 text-zinc-600" />
                      PR Articles ({deal.prArticles?.length || 0})
                    </span>
                    <span className="text-[10px] text-zinc-400">Stock auto-deducts</span>
                  </div>

                  {deal.prArticles?.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No PR dresses assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {deal.prArticles.map((item) => (
                        <div
                          key={item._id}
                          className="p-2.5 border border-zinc-200 bg-zinc-50/50 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-xs text-zinc-900 block">
                                {item.article?.name || 'Unknown Article'}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-zinc-500">
                                <span>SKU: {item.article?.articleCode}</span>
                                <span>•</span>
                                <span className="font-bold text-zinc-800 flex items-center gap-0.5">
                                  <Scissors className="w-3 h-3 text-zinc-400" />
                                  Size: {item.size || 'Medium'}
                                </span>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>

                            <span
                              className={`border px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase ${
                                item.dispatchStatus === 'Delivered'
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : item.dispatchStatus === 'Dispatched'
                                  ? 'bg-white text-zinc-900 border-zinc-400'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                              }`}
                            >
                              {item.dispatchStatus}
                            </span>
                          </div>

                          {/* Tracking & Separate Dedicated Action Buttons */}
                          <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-1.5">
                            {item.dispatchStatus === 'Pending' ? (
                              <button
                                onClick={() => handleOpenDispatch(deal, item)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900 text-white hover:bg-zinc-800 font-bold uppercase text-[10px] transition"
                              >
                                <Send className="w-3 h-3" />
                                Dispatch Parcel ({deal.spNumber || 'SP#'})
                              </button>
                            ) : (
                              <div className="w-full space-y-1.5">
                                <div className="text-[10px] font-mono text-zinc-700 flex justify-between">
                                  <span>{item.courierName}</span>
                                  <strong>{item.trackingNumber || deal.spNumber}</strong>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 pt-1">
                                  {item.dispatchStatus === 'Dispatched' && (
                                    <button
                                      onClick={() => handleMarkDelivered(deal._id, item._id)}
                                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                                    >
                                      ✓ Mark Delivered
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleRevertPR(deal._id, item._id)}
                                    className="px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-500 hover:text-red-600 hover:underline flex items-center gap-1"
                                    title="Revert dispatch and restore stock"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" /> Revert
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Video Deliverables Tracker */}
                <div className="space-y-3 pt-3 lg:pt-0 lg:pl-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 font-mono">
                    <span className="font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5 text-xs">
                      <Video className="w-3.5 h-3.5 text-zinc-600" />
                      Deliverables ({deal.videos?.length || 0})
                    </span>
                    <span className="text-[10px] text-zinc-400">Content schedule</span>
                  </div>

                  {deal.videos?.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No video deliverables scheduled.</p>
                  ) : (
                    <div className="space-y-2">
                      {deal.videos.map((vid) => (
                        <div
                          key={vid._id}
                          className="p-2.5 border border-zinc-200 bg-zinc-50/50 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{vid.videoType}</span>
                            {vid.status === 'Video Live' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-900 text-white border border-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Fulfilled
                              </span>
                            ) : vid.status === 'Draft Received' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-white text-slate-800 border border-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                Draft Received
                              </span>
                            ) : vid.status === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-white text-slate-800 border border-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                                Pending Shoot
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-zinc-600 font-mono text-[11px]">
                            {vid.scheduledDate ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                Live: <strong>{new Date(vid.scheduledDate).toLocaleDateString()}</strong>
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic">Live date not scheduled yet</span>
                            )}

                            {vid.liveUrl && (
                              <a
                                href={vid.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold uppercase text-zinc-900 hover:underline flex items-center gap-1 text-[10px]"
                              >
                                View Post <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          {/* Separate Action Buttons */}
                          <div className="pt-1.5 border-t border-zinc-200 flex flex-wrap items-center justify-end gap-1">
                            {!vid.scheduledDate ? (
                              <button
                                onClick={() => setSchedulingModalItem({ deal, video: vid })}
                                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800"
                              >
                                🗓️ Schedule Date
                              </button>
                            ) : (
                              <button
                                onClick={() => setSchedulingModalItem({ deal, video: vid })}
                                className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700"
                              >
                                Change Date
                              </button>
                            )}

                            {vid.status === 'Pending' && (
                              <button
                                onClick={() => handleSetDeliverableStatus(deal._id, vid._id, 'Draft Received')}
                                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800"
                              >
                                Draft Received
                              </button>
                            )}

                            {vid.status === 'Draft Received' && (
                              <button
                                onClick={() => handleSetDeliverableStatus(deal._id, vid._id, 'Approved')}
                                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800"
                              >
                                Approve Draft
                              </button>
                            )}

                            {vid.status !== 'Video Live' && (
                              <button
                                onClick={() => {
                                  setVideoLinkModal({ dealId: deal._id, videoId: vid._id });
                                  setVideoLinkUrl(vid.liveUrl || '');
                                }}
                                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800"
                              >
                                + Mark Live & Link
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Payment Status & Clearance */}
                <div className="space-y-3 pt-3 lg:pt-0 lg:pl-5 font-mono">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <span className="font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
                      {deal.dealType === 'Barter PR' ? 'Barter PR Terms' : 'Payment Clearance'}
                    </span>
                    {deal.dealType !== 'Barter PR' && (hasPermission('canSettlePayment') || isSuperAdmin) && (
                      <button
                        onClick={() => handleOpenPaymentEdit(deal)}
                        className="text-[10px] font-bold uppercase text-zinc-900 hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Update
                      </button>
                    )}
                  </div>

                  {deal.dealType === 'Barter PR' ? (
                    <div className="p-3 border border-purple-200 bg-purple-50/50 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800 font-semibold">Model:</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Barter PR
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Cash Fee:</span>
                        <strong className="text-purple-950 font-bold">Rs. 0 (Nil Consideration)</strong>
                      </div>
                      <p className="text-[11px] text-purple-800 leading-snug">
                        Creator receives complimentary PR suits only. No bank transfer required.
                      </p>
                      {deal.payment?.slipImage && (
                        <div className="pt-1 text-[10px] text-purple-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Consignment / Parcel Slip Attached
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border border-zinc-200 bg-zinc-50/50 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Agreed Total:</span>
                        <strong className="text-zinc-900">Rs. {deal.agreedRate?.toLocaleString()}</strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-500">Advance Paid:</span>
                        <strong className="text-zinc-900">
                          Rs. {(deal.payment?.advancePaid || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-zinc-200">
                        <span className="text-zinc-500">Remaining Due:</span>
                        <strong className="text-zinc-900 font-bold">
                          Rs. {(deal.payment?.remainingAmount || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-200 text-[11px]">
                        <span className="text-zinc-500">
                          {deal.payment?.paymentMethod || 'Bank Transfer'}
                        </span>
                        <span className="border border-zinc-300 px-1.5 py-0.2 text-[9px] font-bold uppercase bg-white">
                          {deal.payment?.status || 'Unpaid'}
                        </span>
                      </div>

                      {/* Attached Slip Indicator */}
                      {deal.payment?.slipImage && (
                        <div className="pt-1 text-[10px] text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Slip image attached
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment / Voucher Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setReceiptModalDeal(deal)}
                      className={`flex-1 px-2.5 py-1 text-[10px] font-bold uppercase text-white text-center flex items-center justify-center gap-1 ${
                        deal.dealType === 'Barter PR'
                          ? 'bg-purple-900 hover:bg-purple-800'
                          : 'bg-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      <Receipt className="w-3 h-3" />
                      {deal.dealType === 'Barter PR' ? 'Consignment Slip' : 'View Slip'}
                    </button>

                    {deal.dealType !== 'Barter PR' && (hasPermission('canSettlePayment') || isSuperAdmin) && (
                      deal.payment?.status !== 'Fully Paid' ? (
                        <button
                          onClick={() => handleQuickMarkFullyPaid(deal)}
                          className="flex-1 px-2.5 py-1 text-[10px] font-bold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-center"
                        >
                          ✓ Mark Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentEdit(deal)}
                          className="flex-1 px-2.5 py-1 text-[10px] font-bold uppercase bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-center"
                        >
                          Edit Payment
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Receipt / Settlement Slip Modal */}
      {receiptModalDeal && (
        <PaymentReceiptModal
          deal={receiptModalDeal}
          onClose={() => setReceiptModalDeal(null)}
          onRefresh={loadDeals}
        />
      )}

      {/* Schedule Reel Modal */}
      {schedulingModalItem && (
        <ScheduleReelModal
          deal={schedulingModalItem.deal}
          videoItem={schedulingModalItem.video}
          onClose={() => setSchedulingModalItem(null)}
          onSuccess={loadDeals}
        />
      )}

      {/* Dispatch Modal Triggered on "Dispatch Parcel" */}
      {dispatchModalItem && (
        <DispatchModal
          itemData={dispatchModalItem}
          onClose={() => setDispatchModalItem(null)}
          onSuccess={loadDeals}
        />
      )}

      {/* Video URL Modal */}
      {videoLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="bg-white border border-zinc-300 max-w-sm w-full p-4 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold uppercase text-zinc-900 text-xs">Save Live Instagram Post Link</h3>
            <form onSubmit={handleSaveVideoUrl} className="space-y-3 font-mono">
              <input
                type="url"
                required
                placeholder="https://instagram.com/reel/C8xYz..."
                value={videoLinkUrl}
                onChange={(e) => setVideoLinkUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 focus:border-zinc-800 focus:outline-none rounded-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVideoLinkModal(null)}
                  className="px-3 py-1 text-xs font-semibold border border-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Save & Mark Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Edit Modal with Slip Upload */}
      {paymentEditDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="bg-white border border-zinc-300 max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h3 className="font-bold uppercase text-zinc-900 text-xs">Update Payment & Attach Slip</h3>
              <button onClick={() => setPaymentEditDeal(null)} className="text-zinc-400 hover:text-zinc-800">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-zinc-500 font-mono text-[11px]">
              Total Deal Amount: <strong>Rs. {paymentEditDeal.agreedRate?.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleSavePayment} className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                  Amount Paid (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  max={paymentEditDeal.agreedRate}
                  value={paymentForm.advancePaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, advancePaid: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 focus:border-zinc-800 focus:outline-none rounded-none font-bold text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 focus:border-zinc-800 focus:outline-none rounded-none bg-white font-medium"
                  >
                    <option value="Bank Transfer">Bank Transfer (Raast / IBFT)</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                    Transaction TID / Raast
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TID-109283"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 focus:border-zinc-800 focus:outline-none rounded-none"
                  />
                </div>
              </div>

              {/* Upload Slip Image */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                  Attach Payment Slip Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentSlipUpload}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-zinc-300 file:bg-white file:text-xs file:font-semibold hover:file:bg-zinc-100"
                />
                {paymentForm.slipImage && (
                  <div className="mt-2 p-1 border border-zinc-200 bg-zinc-50 max-h-32 overflow-hidden flex items-center justify-center">
                    <img src={paymentForm.slipImage} alt="Slip Preview" className="max-h-28 object-contain" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setPaymentEditDeal(null)}
                  className="px-3 py-1 text-xs font-semibold border border-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Save Payment & Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
