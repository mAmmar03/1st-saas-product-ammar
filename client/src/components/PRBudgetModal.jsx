import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Lock,
  Edit3,
  Save,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function PRBudgetModal({ isOpen, onClose }) {
  const { isSuperAdmin, currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [activePeriod, setActivePeriod] = useState('monthly'); // 'monthly' | 'weekly'
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit target state (Super Admin only)
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBudget();
    }
  }, [isOpen]);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const res = await api.getBudgetOverview();
      setBudgetData(res.data);
    } catch (e) {
      console.error('Error fetching budget overview', e);
      showAlert('Failed to load PR budget data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentPeriodData = activePeriod === 'monthly' ? budgetData?.monthly : budgetData?.weekly;
  const isOverrun = currentPeriodData?.isOverrun || false;
  const overrunAmount = currentPeriodData?.overrunAmount || 0;
  const allocated = currentPeriodData?.allocatedBudget || 0;
  const committed = currentPeriodData?.committedSpend || 0;
  const remaining = currentPeriodData?.remainingBudget || 0;
  const utilization = currentPeriodData?.utilizationPercent || 0;
  const deals = currentPeriodData?.deals || [];

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showAlert('Only Super Admin (Ammar) has authority to adjust the PR budget.', 'error');
      return;
    }

    const num = Number(newTargetAmount);
    if (isNaN(num) || num < 0) {
      showAlert('Please enter a valid non-negative amount for the budget.', 'error');
      return;
    }

    setSavingTarget(true);
    try {
      await api.setBudget({
        periodType: activePeriod,
        periodKey: currentPeriodData.periodKey,
        periodLabel: currentPeriodData.periodLabel,
        allocatedBudget: num,
        notes: budgetNotes,
      });
      showAlert(`PR Budget updated to Rs. ${num.toLocaleString()}`, 'success');
      setIsEditingTarget(false);
      loadBudget();
    } catch (e) {
      showAlert(e.response?.data?.error || 'Failed to update budget', 'error');
    } finally {
      setSavingTarget(false);
    }
  };

  const startEditing = () => {
    setNewTargetAmount(allocated.toString());
    setBudgetNotes(currentPeriodData?.notes || '');
    setIsEditingTarget(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOverrun ? 'bg-rose-50 text-rose-600' : 'bg-slate-900 text-white'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  PR Budget & Spending Controller
                </h3>
                {isOverrun ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                    Budget Overrun
                  </span>
                ) : allocated > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    Within Budget
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                    Target Unset
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Track weekly & monthly PR financials, Barter PR consignments, and prevent campaign overruns
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

        {/* Period Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActivePeriod('monthly');
                setIsEditingTarget(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activePeriod === 'monthly'
                  ? 'bg-slate-900 text-white shadow-subtle'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Monthly PR Budget
            </button>
            <button
              onClick={() => {
                setActivePeriod('weekly');
                setIsEditingTarget(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activePeriod === 'weekly'
                  ? 'bg-slate-900 text-white shadow-subtle'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Weekly PR Budget
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentPeriodData?.periodLabel || 'Active Period'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading PR budget analytics...
            </div>
          ) : (
            <>
              {/* 1. OVERRUN ALERT BANNER */}
              {isOverrun && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 space-y-1.5 animate-bounce-subtle">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      PR Budget Overrun Alert!
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-800">
                    You have exceeded your targeted PR budget limit by{' '}
                    <strong className="font-extrabold text-rose-900">
                      Rs. {overrunAmount.toLocaleString()}
                    </strong>
                    . Total committed spend has reached{' '}
                    <strong>Rs. {committed.toLocaleString()}</strong> against the approved budget of{' '}
                    <strong>Rs. {allocated.toLocaleString()}</strong> ({utilization}% utilized).
                  </p>
                </div>
              )}

              {/* 2. Top Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Target Budget Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-subtle relative group">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Target Budget
                    </span>
                    {isSuperAdmin && !isEditingTarget && (
                      <button
                        onClick={startEditing}
                        title="Edit Target Budget (Super Admin Only)"
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    Rs. {allocated.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {currentPeriodData?.updatedBy ? `Set by: ${currentPeriodData.updatedBy}` : 'Click edit to set limit'}
                  </div>
                </div>

                {/* Committed PR Spend Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-subtle">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Committed PR Spend
                  </span>
                  <div className={`text-lg font-bold ${isOverrun ? 'text-rose-600' : 'text-slate-900'}`}>
                    Rs. {committed.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{currentPeriodData?.paidDealsCount || 0} Paid Collabs</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">
                      {currentPeriodData?.barterDealsCount || 0} Barter PR
                    </span>
                  </div>
                </div>

                {/* Remaining Balance Card */}
                <div className={`p-4 rounded-xl border shadow-subtle ${
                  isOverrun
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-slate-200/80 bg-white'
                }`}>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {isOverrun ? 'Overrun Amount' : 'Remaining Balance'}
                  </span>
                  <div className={`text-lg font-bold ${isOverrun ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isOverrun
                      ? `+ Rs. ${overrunAmount.toLocaleString()}`
                      : `Rs. ${remaining.toLocaleString()}`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {allocated > 0 ? `${utilization}% of budget utilized` : 'No budget set yet'}
                  </div>
                </div>
              </div>

              {/* Progress Utilization Bar */}
              {allocated > 0 && (
                <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">
                      Budget Utilization Progress
                    </span>
                    <span className={`font-bold ${isOverrun ? 'text-rose-600' : 'text-slate-800'}`}>
                      {utilization}% ({committed.toLocaleString()} / {allocated.toLocaleString()} PKR)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverrun
                          ? 'bg-rose-500'
                          : utilization > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 3. Super Admin Edit Target Form */}
              {isEditingTarget && (
                <form
                  onSubmit={handleSaveBudget}
                  className="p-4 rounded-xl border border-slate-900 bg-slate-50/60 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Set Targeted PR Budget Limit for {currentPeriodData?.periodLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTarget(false)}
                      className="text-xs text-slate-400 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Allocated Budget (PKR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        placeholder="e.g. 200000"
                        value={newTargetAmount}
                        onChange={(e) => setNewTargetAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Campaign / Budget Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Winter Pret Launch PR budget"
                        value={budgetNotes}
                        onChange={(e) => setBudgetNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingTarget(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingTarget}
                      className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingTarget ? 'Saving...' : 'Save Approved Budget'}
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Active Period Deals & Consignments Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">
                    PR Collaborations In This Period ({deals.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Includes both Paid Commercials & Zero-Fee Barter PR
                  </span>
                </div>

                {deals.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-slate-100 text-slate-400 text-xs">
                    No PR collaborations recorded for this period yet.
                  </div>
                ) : (
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-subtle">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Influencer</th>
                          <th className="py-2.5 px-3">Campaign</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Articles Dispatched</th>
                          <th className="py-2.5 px-3 text-right">Agreed Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deals.map((deal) => {
                          const isBarter = deal.dealType === 'Barter PR';
                          return (
                            <tr key={deal._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-2 px-3">
                                <div className="font-semibold text-slate-900 truncate">
                                  {deal.influencer?.name || 'Creator'}
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {deal.influencer?.instagramHandle || '-'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 truncate">
                                {deal.campaignName || 'PR Collab'}
                              </td>
                              <td className="py-2 px-3">
                                {isBarter ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                                    Barter PR
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    Paid Collab
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3 text-slate-400" />
                                  <span>{deal.prArticles?.length || 0} Article(s)</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                {isBarter ? (
                                  <span className="text-slate-400 text-[11px] font-normal">
                                    Rs. 0 (Product Only)
                                  </span>
                                ) : (
                                  <span className="text-slate-900">
                                    Rs. {(deal.agreedRate || 0).toLocaleString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-[11px] text-slate-400">
            {isSuperAdmin
              ? 'Super Admin Authority: You can edit or override target budgets anytime.'
              : 'View Only: Only Super Admin can adjust the PR budget limits.'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
