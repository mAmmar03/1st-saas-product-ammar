import React, { useState } from 'react';
import { X, Download, Upload, Database, FileSpreadsheet, Check, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';

export default function DataBackupModal({ isOpen, onClose, onSuccess }) {
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);

  if (!isOpen) return null;

  // 1. Export JSON Full Backup
  const handleExportJSON = async () => {
    try {
      setLoading(true);
      const res = await api.exportBackup();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `AmmarDev_CRM_Backup_${date}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showAlert('Complete backup exported successfully as JSON file!', 'success');
    } catch (err) {
      showAlert('Failed to export backup: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Export Deals to CSV (for Excel)
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const res = await api.getDeals();
      const deals = res.data;

      const headers = ['SP Number', 'Influencer Name', 'Handle', 'Phone', 'City', 'Articles', 'Agreed Rate (PKR)', 'Rate Per Reel', 'Advance Paid', 'Remaining Amount', 'Payment Status', 'Dispatch Status', 'Delivery Date'];
      const rows = deals.map((d) => [
        `"${d.spNumber || ''}"`,
        `"${d.influencer?.name || ''}"`,
        `"${d.influencer?.instagramHandle || ''}"`,
        `"${d.influencer?.phone || ''}"`,
        `"${d.influencer?.city || ''}"`,
        `"${d.prArticles?.map((a) => `${a.article?.name} (${a.size || 'M'})`).join('; ') || ''}"`,
        d.agreedRate || 0,
        d.ratePerVideo || 0,
        d.payment?.advancePaid || 0,
        d.payment?.remainingAmount || 0,
        `"${d.payment?.status || ''}"`,
        `"${d.prArticles?.[0]?.dispatchStatus || ''}"`,
        `"${d.prArticles?.[0]?.deliveredDate ? new Date(d.prArticles[0].deliveredDate).toLocaleDateString() : ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `AmmarDev_Deals_Report_${date}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showAlert('Deals report exported as Excel CSV file!', 'success');
    } catch (err) {
      showAlert('Failed to export CSV: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Select Import File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.data) {
          showAlert('Invalid backup file format: Missing "data" container.', 'error');
          return;
        }
        setImportFile(file.name);
        setImportPreview(json);
      } catch (err) {
        showAlert('Could not parse JSON file. Please ensure it is a valid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // 4. Trigger Restore
  const handleRestore = () => {
    if (!importPreview) return;

    showConfirm({
      title: 'Overwrite System Data?',
      message: `Are you sure you want to restore? This will import ${importPreview.data?.influencers?.length || 0} influencers, ${importPreview.data?.articles?.length || 0} articles, and ${importPreview.data?.deals?.length || 0} deals into your database.`,
      confirmText: 'Yes, Restore Now',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.importBackup(importPreview.data, 'overwrite');
          showAlert('All system data restored successfully!', 'success');
          if (onSuccess) onSuccess();
          onClose();
        } catch (err) {
          showAlert('Failed to restore data: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-modal text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Data Import, Export & Backup
              </h3>
              <p className="text-xs text-slate-400">
                Safe offline backups, Excel CSV reports and restoration
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Export Data */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-zinc-800 text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4 text-zinc-600" />
              1. Export Data (Download Backup)
            </h4>
            <p className="text-zinc-500 font-mono text-[11px]">
              Export all creators, PR inventory records, active deals, payment slips, and settings to transfer to another computer or keep a safe offline backup.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={loading}
                className="p-3 border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-left transition space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-zinc-700" /> Full System JSON
                  </span>
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Complete backup of all collections & settings.
                </p>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={loading}
                className="p-3 border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-left transition space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-700" /> Excel CSV Export
                  </span>
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Spreadsheet of all deals, SP numbers, and payments.
                </p>
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-200"></div>

          {/* Section 2: Import Data */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-zinc-800 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-zinc-600" />
              2. Import Data (Restore From Backup)
            </h4>
            <p className="text-zinc-500 font-mono text-[11px]">
              Upload a previously exported <code className="text-zinc-800">.json</code> backup file to restore records on this computer.
            </p>

            <div className="p-4 border-2 border-dashed border-zinc-300 bg-zinc-50 text-center space-y-2">
              <Upload className="w-6 h-6 text-zinc-400 mx-auto" />
              <div>
                <label className="cursor-pointer px-3 py-1.5 bg-zinc-900 text-white font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-800 transition inline-block">
                  Select Backup JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {importFile && (
                <div className="text-[11px] font-mono text-zinc-700 font-semibold">
                  Selected: {importFile}
                </div>
              )}
            </div>

            {/* Import Preview Card */}
            {importPreview && (
              <div className="p-3 bg-zinc-100 border border-zinc-300 space-y-2 font-mono text-[11px]">
                <div className="font-bold uppercase text-zinc-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Backup Ready to Restore:
                </div>
                <div className="grid grid-cols-3 gap-2 text-zinc-700">
                  <div className="bg-white p-2 border border-zinc-200">
                    <span className="block text-[10px] text-zinc-500 uppercase">Influencers</span>
                    <strong className="text-zinc-900 text-xs">
                      {importPreview.data?.influencers?.length || 0}
                    </strong>
                  </div>
                  <div className="bg-white p-2 border border-zinc-200">
                    <span className="block text-[10px] text-zinc-500 uppercase">Articles</span>
                    <strong className="text-zinc-900 text-xs">
                      {importPreview.data?.articles?.length || 0}
                    </strong>
                  </div>
                  <div className="bg-white p-2 border border-zinc-200">
                    <span className="block text-[10px] text-zinc-500 uppercase">Deals</span>
                    <strong className="text-zinc-900 text-xs">
                      {importPreview.data?.deals?.length || 0}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={loading}
                  className="w-full mt-2 py-2 bg-zinc-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 transition shadow-sm"
                >
                  {loading ? 'Restoring System...' : 'Restore Data Into Database'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold uppercase text-zinc-600 hover:bg-zinc-100 border border-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
