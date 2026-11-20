import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  TrendingDown,
} from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useRole } from '../context/RoleContext';
import AddArticleModal from '../components/AddArticleModal';

export default function PRInventory({ onOpenNewArticle, onOpenDossier }) {
  const { showAlert, showConfirm } = useAlert();
  const { hasPermission } = useRole();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await api.getArticles();
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  const handleDelete = (id, name) => {
    showConfirm({
      title: 'Delete PR Article?',
      message: `Are you sure you want to delete article "${name}"? Stock records will be removed.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.deleteArticle(id);
          showAlert(`Article "${name}" deleted successfully!`, 'success');
          loadArticles();
        } catch (err) {
          showAlert('Failed to delete article', 'error');
        }
      },
    });
  };

  const filtered = articles.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.articleCode.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalQuotaAll = articles.reduce((acc, curr) => acc + (curr.totalPRQuota || 0), 0);
  const totalSentAll = articles.reduce((acc, curr) => acc + (curr.sentPieces || 0), 0);
  const totalRemainingAll = articles.reduce((acc, curr) => acc + (curr.remainingPieces || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-700" />
            PR Stock & Quota Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track garment allocations, automatic deduction upon courier dispatch & recipient rosters
          </p>
        </div>

        <button
          onClick={onOpenNewArticle}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shrink-0 shadow-subtle active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add PR Article
        </button>
      </div>

      {/* Aggregate Overview Cards (Unlisted Trade Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle">
          <span className="text-xs font-medium text-slate-400 block">
            Total PR Quota (Allocated)
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalQuotaAll} <span className="text-xs font-normal text-slate-400">pieces</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total pieces reserved for marketing</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle">
          <span className="text-xs font-medium text-slate-400 block">
            Dispatched (Sent) Pieces
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalSentAll} <span className="text-xs font-normal text-slate-400">pieces</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Deducted from PR inventory</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-subtle">
          <span className="text-xs font-medium text-slate-400 block">
            Remaining Stock Available
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalRemainingAll} <span className="text-xs font-normal text-slate-400">pieces</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Available for upcoming creator deals</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by article name, SKU (e.g. PK-2PC), or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Articles List / Breakdown Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading inventory records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200/80 text-center space-y-3 shadow-subtle">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No PR Articles Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your articles with their allotted PR piece quota to track dispatches and remaining pieces.
          </p>
          <button
            onClick={onOpenNewArticle}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            Add Article
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((art) => {
            const isExpanded = expandedArticleId === art._id;
            const percentSent = art.totalPRQuota > 0 ? Math.round(((art.sentPieces || 0) / art.totalPRQuota) * 100) : 0;

            return (
              <div
                key={art._id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden hover:border-slate-300 transition-all"
              >
                {/* Article Header Row */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {art.articleCode}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900">{art.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                        {art.category}
                      </span>
                    </div>
                    {art.notes && (
                      <p className="text-xs text-slate-400">Notes: {art.notes}</p>
                    )}
                  </div>

                  {/* Stock Quota Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 w-full md:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-5 text-center bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
                      <div>
                        <span className="text-[10px] uppercase font-medium text-slate-400 block">
                          Quota
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {art.totalPRQuota} pcs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-medium text-slate-400 block">
                          Dispatched
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {art.sentPieces} pcs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-medium text-slate-400 block">
                          Remaining
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {art.remainingPieces} pcs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Expand Breakdown Button */}
                      <button
                        onClick={() => toggleExpand(art._id)}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                          isExpanded
                            ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">
                          Recipients ({art.dispatchedTo?.length || 0} sent, {art.pendingFor?.length || 0} queued)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </button>

                      <button
                        onClick={() => setEditingArticle(art)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition shrink-0"
                        title="Edit article details & quota"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {hasPermission('canDeleteArticles') && (
                        <button
                          onClick={() => handleDelete(art._id, art.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition shrink-0"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: "Kis Ko Gaye Hain" & "Kis Ko Jaane Hain" */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4 text-xs animate-fade-in">
                    {/* Part 1: Kis Ko Gaye Hain (Dispatched) */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Kis Ko Gaye Hain (Dispatched & Deducted: {art.dispatchedTo?.length || 0})
                      </h4>

                      {art.dispatchedTo?.length === 0 ? (
                        <p className="p-3 bg-white rounded-lg border border-slate-200/80 text-slate-400 italic text-center">
                          No pieces dispatched for this article yet.
                        </p>
                      ) : (
                        <div className="bg-white rounded-xl border border-slate-200/80 overflow-x-auto shadow-xs">
                          <table className="w-full text-left min-w-[550px]">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="p-2.5">Influencer</th>
                                <th className="p-2.5">Campaign</th>
                                <th className="p-2.5">Quantity</th>
                                <th className="p-2.5">Courier & Tracking / SP#</th>
                                <th className="p-2.5">Dispatch Date</th>
                                <th className="p-2.5 text-right">Dossier</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {art.dispatchedTo.map((rec, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 transition">
                                  <td className="p-2.5">
                                    <strong className="text-slate-900 font-semibold block">{rec.influencerName}</strong>
                                    <span className="text-[11px] text-slate-400">
                                      {rec.instagramHandle}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-600">{rec.campaignName}</td>
                                  <td className="p-2.5 font-semibold text-slate-900">
                                    {rec.quantity} pc(s)
                                  </td>
                                  <td className="p-2.5 text-slate-700 font-mono text-[11px]">
                                    {rec.trackingNumber ? (
                                      <span>
                                        {rec.courierName}: <strong>{rec.trackingNumber}</strong>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-sans">Dispatched</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-slate-500 text-[11px]">
                                    {rec.dispatchDate
                                      ? new Date(rec.dispatchDate).toLocaleDateString()
                                      : 'N/A'}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <button
                                      onClick={() => onOpenDossier(rec.influencerId)}
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

                    {/* Part 2: Kis Ko Jaane Hain (Allocated in Deals) */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Kis Ko Jaane Hain (Queued in Deals - Pending Dispatch: {art.pendingFor?.length || 0})
                      </h4>

                      {art.pendingFor?.length === 0 ? (
                        <p className="p-3 bg-white rounded-lg border border-slate-200/80 text-slate-400 italic text-center">
                          No pending dispatches queued for this article.
                        </p>
                      ) : (
                        <div className="bg-white rounded-xl border border-slate-200/80 overflow-x-auto shadow-xs">
                          <table className="w-full text-left min-w-[550px]">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="p-2.5">Influencer</th>
                                <th className="p-2.5">Campaign</th>
                                <th className="p-2.5">Reserved Qty</th>
                                <th className="p-2.5">Shipping Destination</th>
                                <th className="p-2.5 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {art.pendingFor.map((rec, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 transition">
                                  <td className="p-2.5">
                                    <strong className="text-slate-900 font-semibold block">{rec.influencerName}</strong>
                                    <span className="text-[11px] text-slate-400">
                                      {rec.instagramHandle}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-600">{rec.campaignName}</td>
                                  <td className="p-2.5 font-semibold text-slate-900">
                                    {rec.quantity} pc(s)
                                  </td>
                                  <td className="p-2.5 text-slate-600 max-w-xs truncate">
                                    {rec.shippingAddress || 'No address specified'}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <button
                                      onClick={() => onOpenDossier(rec.influencerId)}
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingArticle && (
        <AddArticleModal
          isOpen={Boolean(editingArticle)}
          articleToEdit={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSuccess={() => {
            setEditingArticle(null);
            loadArticles();
          }}
        />
      )}
    </div>
  );
}
