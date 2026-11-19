import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Check, Lock, UserCheck, Shield } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAlert } from '../context/AlertContext';

export default function RolePermissionsModal({ isOpen, onClose }) {
  const { isSuperAdmin, adminPermissions, updatePermissions } = useRole();
  const { showAlert } = useAlert();
  const [perms, setPerms] = useState({ ...adminPermissions });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePermissions(perms);
      showAlert('Admin role permissions updated successfully!', 'success');
      onClose();
    } catch (e) {
      showAlert('Failed to save permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const permissionList = [
    {
      key: 'canDispatchPR',
      label: 'Dispatch PR Parcels & Assign SP#',
      desc: 'Allows admin to dispatch items and auto-deduct inventory stock.',
    },
    {
      key: 'canScheduleReel',
      label: 'Schedule Reel Dates',
      desc: 'Allows admin to set shoot dates and live publish dates.',
    },
    {
      key: 'canEditFinancials',
      label: 'Record Payments & Attach Slips',
      desc: 'Allows admin to update advance paid and upload transaction slips.',
    },
    {
      key: 'canExportBackup',
      label: 'Export Data & Reports',
      desc: 'Allows admin to download Excel CSV and JSON backups.',
    },
    {
      key: 'canDeleteDeals',
      label: 'Delete Collaboration Deals',
      desc: 'High risk: Restores deducted inventory upon deletion.',
    },
    {
      key: 'canDeleteInfluencers',
      label: 'Delete Influencer Profiles',
      desc: 'High risk: Permanently deletes creator bio-data dossiers.',
    },
    {
      key: 'canDeleteArticles',
      label: 'Delete PR Garment Articles',
      desc: 'High risk: Deletes article records and inventory history.',
    },
    {
      key: 'canEditBrandProfile',
      label: 'Edit Brand Logo & Company Settings',
      desc: 'Allows changing brand name, company logo, and official details.',
    },
    {
      key: 'canImportBackup',
      label: 'Restore / Overwrite System Backup',
      desc: 'Super Admin only recommended: Overwrites full database.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-xs font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              User Roles & Admin Authority Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Role Comparison Banner */}
          <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="p-3 bg-slate-900 text-white border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase text-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Super Admin (Ammar)
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Full unrestricted master control. Has A to Z editing authority over all articles, deals, finances, brand settings, and deletions.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1 text-slate-800">
              <div className="flex items-center gap-1.5 font-bold uppercase text-slate-900">
                <UserCheck className="w-4 h-4 text-slate-600" /> Admin (PR Staff)
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Operational role with delegated permissions. Toggle permissions below to control what Admin can and cannot do.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
              Configure Admin Role Permissions:
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
              {permissionList.map((item) => {
                const isEnabled = Boolean(perms[item.key]);
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggle(item.key)}
                    className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition select-none"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-800 block">
                        {item.label}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className={`w-10 h-5 p-0.5 transition-colors duration-200 border flex items-center ${
                        isEnabled
                          ? 'bg-slate-900 border-slate-900 justify-end'
                          : 'bg-slate-200 border-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white shadow-sm"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            {isSuperAdmin ? 'Super Admin Mode Active' : 'Admin Mode Active'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-600 hover:bg-slate-100 border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
