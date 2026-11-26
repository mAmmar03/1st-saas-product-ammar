import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Calendar,
  Package,
  DollarSign,
  FileSpreadsheet,
  CheckCircle,
  Truck,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';
import { printDocument } from '../utils/printHelper';

export default function WeeklyPRSheetModal({ isOpen, onClose }) {
  const [deals, setDeals] = useState([]);
  const [brandProfile, setBrandProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('this-week'); // 'this-week' | 'last-week' | 'this-month' | 'all'
  const sheetRef = useRef();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, brandRes] = await Promise.all([
        api.getDeals(),
        api.getBrandProfile(),
      ]);
      setDeals(dealsRes.data || []);
      setBrandProfile(brandRes.data || {});
    } catch (err) {
      console.error('Error loading PR sheet data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter deals based on period
  const now = new Date();
  const filteredDeals = deals.filter((deal) => {
    if (filterPeriod === 'all') return true;

    const dealDate = new Date(deal.agreedDate || deal.createdAt);
    const diffTime = Math.abs(now - dealDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filterPeriod === 'this-week') return diffDays <= 7;
    if (filterPeriod === 'last-week') return diffDays > 7 && diffDays <= 14;
    if (filterPeriod === 'this-month') return diffDays <= 30;
    return true;
  });

  // Calculate Aggregates
  let totalDressesSent = 0;
  let totalAgreedBudget = 0;
  let totalPaidAmount = 0;
  let totalRemainingAmount = 0;

  filteredDeals.forEach((deal) => {
    totalAgreedBudget += deal.agreedRate || 0;
    totalPaidAmount += deal.payment?.advancePaid || 0;
    totalRemainingAmount += deal.payment?.remainingAmount || 0;

    deal.prArticles?.forEach((p) => {
      if (p.dispatchStatus === 'Dispatched' || p.dispatchStatus === 'Delivered') {
        totalDressesSent += p.quantity || 1;
      }
    });
  });

  const handlePrint = () => {
    printDocument(
      'weekly-pr-print-area',
      `${brandProfile?.brandName || 'Brand Workspace'} - Weekly PR Audit Sheet`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-modal text-xs font-sans animate-modal-in">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Weekly PR Dispatch & Audit Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Official executive dispatch, deliverable & commercial report
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium bg-white focus:outline-none"
            >
              <option value="this-week">This Week (Last 7 Days)</option>
              <option value="last-week">Last Week (Days 8-14)</option>
              <option value="this-month">This Month (30 Days)</option>
              <option value="all">All Collaborations (Full Ledger)</option>
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition shadow-subtle active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5" />
              Print A4 Sheet
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview and Printable Container */}
        <div className="p-3 sm:p-6 overflow-y-auto" ref={sheetRef}>
          {/* Printable Sheet */}
          <div
            id="weekly-pr-print-area"
            className="border border-slate-200/90 rounded-xl p-4 sm:p-8 bg-white space-y-6 max-w-[210mm] mx-auto text-slate-900 shadow-xs"
          >
            {/* Sheet Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-zinc-900 pb-4 gap-3">
              <div className="flex items-center gap-3">
                {brandProfile?.brandLogo ? (
                  <img
                    src={brandProfile.brandLogo}
                    alt={brandProfile.brandName}
                    className="h-10 sm:h-12 w-auto max-w-[120px] object-contain"
                  />
                ) : (
                  <img
                    src="/logo-main.png"
                    alt="AmmarDev"
                    className="h-9 sm:h-10 w-auto max-w-[120px] object-contain"
                  />
                )}
                <div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
                    {brandProfile?.brandName || 'Brand Workspace'}
                  </h1>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    {brandProfile?.tagline || 'Influencer PR & Marketing Commercials Sheet'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                  DOCUMENT TYPE
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 uppercase">
                  WEEKLY PR AUDIT SHEET
                </span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  Generated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 sm:p-4 border border-zinc-200 font-mono">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">Total PR Sent</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900">{totalDressesSent} Pieces</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">Creators Engaged</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900">{filteredDeals.length} Influencers</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">Agreed Budget</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900">Rs. {totalAgreedBudget.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">Total Paid (Expense)</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900">Rs. {totalPaidAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Main Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-zinc-300 text-[11px] min-w-[650px]">
                <thead>
                  <tr className="bg-zinc-900 text-white font-mono uppercase text-[9px] tracking-wider">
                    <th className="p-2 border border-zinc-700">SP#</th>
                    <th className="p-2 border border-zinc-700">Influencer</th>
                    <th className="p-2 border border-zinc-700">City</th>
                    <th className="p-2 border border-zinc-700">Articles & Size</th>
                    <th className="p-2 border border-zinc-700">Dispatch Status</th>
                    <th className="p-2 border border-zinc-700">Deliverable Status</th>
                    <th className="p-2 border border-zinc-700 text-right">Charges (PKR)</th>
                    <th className="p-2 border border-zinc-700 text-right">Paid (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-zinc-400">
                        No collaborations found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal, idx) => {
                      const articleNames = deal.prArticles
                        ?.map((a) => `${a.article?.name} (${a.size || 'M'})`)
                        .join(', ');
                      const dispatchSt = deal.prArticles?.[0]?.dispatchStatus || 'Pending';
                      const vidSt = deal.videos?.[0]?.status || 'Agreed';

                      return (
                        <tr key={deal._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                          <td className="p-2 border border-zinc-200 font-bold text-zinc-900">
                            {deal.spNumber || 'N/A'}
                          </td>
                          <td className="p-2 border border-zinc-200 font-bold">
                            {deal.influencer?.name}
                            <span className="block text-[9px] text-zinc-500 font-normal">
                              {deal.influencer?.instagramHandle}
                            </span>
                          </td>
                          <td className="p-2 border border-zinc-200 text-zinc-600">
                            {deal.influencer?.city || 'N/A'}
                          </td>
                          <td className="p-2 border border-zinc-200 font-sans text-[10px]">
                            {articleNames || 'None'}
                          </td>
                          <td className="p-2 border border-zinc-200 text-[10px]">
                            {dispatchSt}
                          </td>
                          <td className="p-2 border border-zinc-200 text-[10px]">
                            {vidSt}
                          </td>
                          <td className="p-2 border border-zinc-200 text-right font-bold">
                            Rs. {(deal.agreedRate || 0).toLocaleString()}
                          </td>
                          <td className="p-2 border border-zinc-200 text-right font-bold text-zinc-900">
                            Rs. {(deal.payment?.advancePaid || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-100 font-mono font-bold text-zinc-900 text-xs">
                    <td colSpan={6} className="p-2.5 border border-zinc-300 uppercase text-right">
                      Total Commercials:
                    </td>
                    <td className="p-2.5 border border-zinc-300 text-right">
                      Rs. {totalAgreedBudget.toLocaleString()}
                    </td>
                    <td className="p-2.5 border border-zinc-300 text-right">
                      Rs. {totalPaidAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures & Approvals */}
            <div className="pt-10 grid grid-cols-2 gap-16 font-mono text-xs">
              <div className="border-t border-zinc-400 pt-2">
                <span className="block font-bold text-zinc-900 uppercase">PR Dispatch In-Charge</span>
                <span className="text-[10px] text-zinc-500">Verified inventory deduction & consignment vouchers</span>
              </div>
              <div className="border-t border-zinc-400 pt-2 text-right">
                <span className="block font-bold text-zinc-900 uppercase">
                  {brandProfile?.authorizedSignatory || 'Ammar / Brand Director'}
                </span>
                <span className="text-[10px] text-zinc-500">Approved for financial settlement & audit</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 border-t border-zinc-200 text-center text-[9px] font-mono text-zinc-400 uppercase">
              Generated via AmmarDev Influencer & PR Control System ? Official Brand Record
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
