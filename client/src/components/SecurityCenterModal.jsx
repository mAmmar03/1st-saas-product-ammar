import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Trash2,
  User,
  Shield,
  Clock,
  Eye,
  EyeOff,
  Sliders,
  CheckSquare,
  Square,
  Building2,
  FileSpreadsheet,
  Package,
  Users as UsersIcon,
  Video,
  DollarSign,
  Database,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const PERMISSION_CONFIGS = [
  {
    category: '1. Module & Page Access (Kon Kon Sa System Khol Sakta Hai)',
    items: [
      {
        key: 'canAccessDashboard',
        label: 'Dashboard Overview',
        desc: 'Can view business metrics, KPI summary, and PR progress',
        icon: 'LayoutDashboard',
      },
      {
        key: 'canAccessDeals',
        label: 'Campaigns & Deals Manager',
        desc: 'Can open collaborations list, PR article dispatches, and deliverables',
        icon: 'FileSpreadsheet',
      },
      {
        key: 'canAccessSchedule',
        label: 'Reel Scheduling & Deliverables',
        desc: 'Can access content calendar, shooting dates, and live video links',
        icon: 'Video',
      },
      {
        key: 'canAccessInventory',
        label: 'PR Articles & Quota Inventory',
        desc: 'Can view suit designs, sent/remaining pieces, and stock levels',
        icon: 'Package',
      },
      {
        key: 'canAccessInfluencers',
        label: 'Influencer Directory & Profiles',
        desc: 'Can view influencer contact details, addresses, and sizes',
        icon: 'Users',
      },
      {
        key: 'canAccessCompany',
        label: 'Company Brand Profile',
        desc: 'Can view brand credentials, addresses, and official signatories',
        icon: 'Building2',
      },
      {
        key: 'canAccessBudget',
        label: 'PR Budget Controller',
        desc: 'Can view weekly & monthly PR budget targets and spending analytics',
        icon: 'DollarSign',
      },
    ],
  },
  {
    category: '2. Operational Authorities (Kya Kar Sakta Hai / Kya Cheez Nikal Sakta Hai)',
    items: [
      {
        key: 'canDispatchPR',
        label: 'Dispatch PR Parcels & Deduct Stock',
        desc: 'Authority to dispatch parcels via courier and deduct inventory quota',
      },
      {
        key: 'canSettlePayment',
        label: 'Settle Commercials & Upload Payment Slips',
        desc: 'Authority to record advance/final bank transfers and attach receipts',
      },
      {
        key: 'canDeleteRecords',
        label: 'Delete Sensitive Records (Deals / Articles / Influencers)',
        desc: 'Authority to permanently remove deals, articles, or influencers from database',
      },
      {
        key: 'canExportData',
        label: 'Export Backups & Print PR Sheets',
        desc: 'Authority to download full system database JSON and export A4 PR sheets',
      },
    ],
  },
];

const DEFAULT_STAFF_PERMS = {
  canAccessDashboard: true,
  canAccessInventory: true,
  canAccessDeals: true,
  canAccessSchedule: true,
  canAccessInfluencers: true,
  canAccessCompany: false,
  canAccessBudget: false,
  canDispatchPR: true,
  canSettlePayment: false,
  canDeleteRecords: false,
  canExportData: false,
};

export default function SecurityCenterModal({ isOpen, onClose }) {
  const { isSuperAdmin } = useAuth();
  const { showAlert, showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState('superadmin'); // 'superadmin' | 'staff'

  // Super Admin security state
  const [newSuperPassword, setNewSuperPassword] = useState('');
  const [confirmSuperPassword, setConfirmSuperPassword] = useState('');
  const [newMasterPin, setNewMasterPin] = useState('');
  const [loadingSuper, setLoadingSuper] = useState(false);
  const [showSuperPass, setShowSuperPass] = useState(false);

  // Staff members state
  const [usersList, setUsersList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffActive, setStaffActive] = useState(true);
  const [editPermissions, setEditPermissions] = useState({ ...DEFAULT_STAFF_PERMS });
  const [loadingStaffUpdate, setLoadingStaffUpdate] = useState(false);

  // Create Staff state
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPermissions, setCreatePermissions] = useState({ ...DEFAULT_STAFF_PERMS });
  const [loadingCreate, setLoadingCreate] = useState(false);

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      loadUsers();
    }
  }, [isOpen, isSuperAdmin]);

  const loadUsers = async () => {
    try {
      const res = await api.getUsersList();
      setUsersList(res.data || []);
      const firstAdmin = res.data?.find((u) => u.role === 'admin');
      if (firstAdmin) {
        selectStaffMember(firstAdmin);
      } else {
        setSelectedStaff(null);
      }
    } catch (e) {
      console.error('Error fetching users for security center', e);
    }
  };

  const selectStaffMember = (staff) => {
    setSelectedStaff(staff);
    setStaffName(staff.name || '');
    setStaffActive(staff.isActive !== false);
    setNewStaffPassword('');
    setEditPermissions({
      ...DEFAULT_STAFF_PERMS,
      ...(staff.permissions || {}),
    });
  };

  if (!isOpen) return null;

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-sm w-full p-6 text-center space-y-4 animate-modal-in">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-500">
            Only Super Admin (Ammar) has authority to manage passwords, budgets, and staff accounts.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle Super Admin Password Update
  const handleUpdateSuperAdmin = async (e) => {
    e.preventDefault();
    if (!newSuperPassword && !newMasterPin) {
      showAlert('Please enter a new password or master PIN.', 'error');
      return;
    }

    if (newSuperPassword && newSuperPassword !== confirmSuperPassword) {
      showAlert('Passwords do not match. Please re-check.', 'error');
      return;
    }

    setLoadingSuper(true);
    try {
      await api.setSuperAdminPassword({
        newPassword: newSuperPassword || undefined,
        newMasterPin: newMasterPin || undefined,
      });
      showAlert('Super Admin credentials updated successfully!', 'success');
      setNewSuperPassword('');
      setConfirmSuperPassword('');
      setNewMasterPin('');
      onClose();
    } catch (err) {
      showAlert(err.response?.data?.error || 'Failed to update credentials', 'error');
    } finally {
      setLoadingSuper(false);
    }
  };

  // Handle Create Staff Member
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!createUsername || !createPassword) {
      showAlert('Username and password are required.', 'error');
      return;
    }

    setLoadingCreate(true);
    try {
      await api.createAdmin({
        username: createUsername,
        name: createName || 'PR Staff Member',
        password: createPassword,
        permissions: createPermissions,
      });
      showAlert(`Staff account "${createUsername}" provisioned with custom permissions!`, 'success');
      setCreateUsername('');
      setCreateName('');
      setCreatePassword('');
      setCreatePermissions({ ...DEFAULT_STAFF_PERMS });
      setIsCreatingStaff(false);
      loadUsers();
    } catch (err) {
      showAlert(err.response?.data?.error || 'Failed to create staff account', 'error');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Handle Update Staff Member
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setLoadingStaffUpdate(true);
    try {
      await api.manageAdminAccount({
        adminId: selectedStaff._id,
        newPassword: newStaffPassword || undefined,
        name: staffName,
        isActive: staffActive,
        permissions: editPermissions,
      });
      showAlert(`Staff member "${selectedStaff.username}" permissions and settings updated!`, 'success');
      setNewStaffPassword('');
      loadUsers();
    } catch (err) {
      showAlert(err.response?.data?.error || 'Failed to update staff account', 'error');
    } finally {
      setLoadingStaffUpdate(false);
    }
  };

  // Handle Delete Staff Member
  const handleDeleteStaff = (id, name) => {
    showConfirm({
      title: 'Remove Staff Account?',
      message: `Are you sure you want to permanently revoke and delete the account for "${name}"? Only Super Admin will retain access.`,
      confirmText: 'Yes, Remove Staff',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.deleteAdmin(id);
          showAlert(`Staff account "${name}" removed successfully.`, 'success');
          loadUsers();
        } catch (err) {
          showAlert('Failed to remove staff account', 'error');
        }
      },
    });
  };

  // Preset permission helpers
  const applyPreset = (setter, preset) => {
    if (preset === 'full') {
      setter({
        canAccessDashboard: true,
        canAccessInventory: true,
        canAccessDeals: true,
        canAccessSchedule: true,
        canAccessInfluencers: true,
        canAccessCompany: true,
        canAccessBudget: true,
        canDispatchPR: true,
        canSettlePayment: true,
        canDeleteRecords: true,
        canExportData: true,
      });
    } else if (preset === 'dispatch_only') {
      setter({
        canAccessDashboard: true,
        canAccessInventory: true,
        canAccessDeals: true,
        canAccessSchedule: true,
        canAccessInfluencers: true,
        canAccessCompany: false,
        canAccessBudget: false,
        canDispatchPR: true,
        canSettlePayment: false,
        canDeleteRecords: false,
        canExportData: false,
      });
    } else if (preset === 'readonly') {
      setter({
        canAccessDashboard: true,
        canAccessInventory: true,
        canAccessDeals: true,
        canAccessSchedule: true,
        canAccessInfluencers: true,
        canAccessCompany: false,
        canAccessBudget: false,
        canDispatchPR: false,
        canSettlePayment: false,
        canDeleteRecords: false,
        canExportData: false,
      });
    }
  };

  const staffMembers = usersList.filter((u) => u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Staff & Security Governance
              </h3>
              <p className="text-xs text-slate-400">
                Master Super Admin Control & Per-Staff Granular Permissions Matrix
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6 gap-3 sm:gap-6 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('superadmin')}
            className={`py-3 border-b-2 transition shrink-0 ${
              activeTab === 'superadmin'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Super Admin Password & PIN
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'staff'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Staff Accounts & Permissions</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold">
              {staffMembers.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Super Admin Master Password */}
          {activeTab === 'superadmin' && (
            <form onSubmit={handleUpdateSuperAdmin} className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-900 block">
                  Super Admin Master Credentials
                </span>
                <p className="leading-relaxed">
                  As Super Admin, you have supreme authority to provision staff, configure granular access rights, set PR budgets, and approve disbursements. Keep your credentials safe.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showSuperPass ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 characters)..."
                    value={newSuperPassword}
                    onChange={(e) => setNewSuperPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuperPass(!showSuperPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showSuperPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type={showSuperPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password to confirm..."
                  value={confirmSuperPassword}
                  onChange={(e) => setConfirmSuperPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Master Security PIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 4-digit PIN"
                  value={newMasterPin}
                  onChange={(e) => setNewMasterPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs tracking-wider transition"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Leave blank to retain existing master security PIN.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingSuper}
                  className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle disabled:opacity-50"
                >
                  {loadingSuper ? 'Saving Credentials...' : 'Save Super Admin Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Staff Accounts & Granular Permissions */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-fade-in">
              {/* If no staff exists and not in create mode */}
              {staffMembers.length === 0 && !isCreatingStaff && (
                <div className="p-8 bg-slate-50/70 rounded-xl border border-slate-100 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400 shadow-subtle">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      No Staff Accounts Configured
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Only Super Admin (Ammar) currently has access. You can add a team member below and customize exactly which pages and actions they can access.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingStaff(true)}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition inline-flex items-center gap-1.5 shadow-subtle active:scale-[0.98]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Provision New Staff Account
                  </button>
                </div>
              )}

              {/* Form to Provision New Staff */}
              {isCreatingStaff && (
                <form onSubmit={handleCreateStaff} className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                    <div>
                      <span className="font-semibold text-sm text-slate-900 block">
                        Add New Staff Member
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Create login credentials and choose permissions for this staff member
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingStaff(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Username / Login ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. staff_ali or manager_pr"
                        value={createUsername}
                        onChange={(e) => setCreateUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Staff Member Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ali (PR Dispatch Manager)"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Set Password for Staff *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password (min 6 characters)..."
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                    />
                  </div>

                  {/* Permissions Selection Matrix */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-slate-600" />
                        Permissions Matrix for this Staff Member
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => applyPreset(setCreatePermissions, 'full')}
                          className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                        >
                          All Access
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(setCreatePermissions, 'dispatch_only')}
                          className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                        >
                          Dispatch Team
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(setCreatePermissions, 'readonly')}
                          className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                        >
                          View Only
                        </button>
                      </div>
                    </div>

                    {PERMISSION_CONFIGS.map((section, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block">
                          {section.category}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.items.map((item) => {
                            const isChecked = Boolean(createPermissions[item.key]);
                            return (
                              <label
                                key={item.key}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-slate-50 border-slate-900/30'
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    setCreatePermissions((prev) => ({
                                      ...prev,
                                      [item.key]: e.target.checked,
                                    }))
                                  }
                                  className="mt-0.5 w-3.5 h-3.5 rounded text-slate-900 accent-slate-900 cursor-pointer"
                                />
                                <div className="min-w-0">
                                  <span className="font-semibold text-xs text-slate-800 block">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block leading-tight">
                                    {item.desc}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loadingCreate}
                    className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition shadow-subtle active:scale-[0.98] disabled:opacity-50"
                  >
                    {loadingCreate ? 'Saving Staff Account...' : 'Provision Staff Account with Permissions'}
                  </button>
                </form>
              )}

              {/* Staff List & Management */}
              {staffMembers.length > 0 && !isCreatingStaff && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">
                      Configured Staff Accounts ({staffMembers.length})
                    </span>
                    <button
                      onClick={() => setIsCreatingStaff(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Another Staff
                    </button>
                  </div>

                  <div className="space-y-2">
                    {staffMembers.map((staff) => (
                      <div
                        key={staff._id}
                        onClick={() => selectStaffMember(staff)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedStaff?._id === staff._id
                            ? 'bg-slate-50 border-slate-900 shadow-subtle'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700 shrink-0">
                            {staff.name?.[0] || 'S'}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs font-semibold text-slate-900 block truncate">
                              {staff.name}
                            </strong>
                            <span className="text-[11px] text-slate-400 block truncate">
                              @{staff.username} • Role: Admin Staff
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              staff.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {staff.isActive ? 'Active' : 'Suspended'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStaff(staff._id, staff.name || staff.username);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="Delete staff account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Selected Staff Form & Granular Permissions */}
                  {selectedStaff && (
                    <form onSubmit={handleUpdateStaff} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3.5 mt-4">
                      <div className="border-b border-slate-200/60 pb-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">
                            Manage Permissions: {selectedStaff.name} (@{selectedStaff.username})
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Super Admin can modify what this staff member can open or execute anytime.
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Staff Display Name
                          </label>
                          <input
                            type="text"
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Change Password
                          </label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep unchanged..."
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="staffActiveToggle"
                          checked={staffActive}
                          onChange={(e) => setStaffActive(e.target.checked)}
                          className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                        />
                        <label htmlFor="staffActiveToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                          Account is Active (Uncheck to immediately suspend this staff member from logging in)
                        </label>
                      </div>

                      {/* Permissions Matrix for Selected Staff */}
                      <div className="pt-2 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-slate-600" />
                            Assigned Authority & Page Access
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() => applyPreset(setEditPermissions, 'full')}
                              className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                            >
                              All Access
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset(setEditPermissions, 'dispatch_only')}
                              className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                            >
                              Dispatch Team
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset(setEditPermissions, 'readonly')}
                              className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-slate-700"
                            >
                              View Only
                            </button>
                          </div>
                        </div>

                        {PERMISSION_CONFIGS.map((section, sIdx) => (
                          <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block">
                              {section.category}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {section.items.map((item) => {
                                const isChecked = Boolean(editPermissions[item.key]);
                                return (
                                  <label
                                    key={item.key}
                                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                                      isChecked
                                        ? 'bg-slate-50 border-slate-900/30'
                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        setEditPermissions((prev) => ({
                                          ...prev,
                                          [item.key]: e.target.checked,
                                        }))
                                      }
                                      className="mt-0.5 w-3.5 h-3.5 rounded text-slate-900 accent-slate-900 cursor-pointer"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-semibold text-xs text-slate-800 block">
                                        {item.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block leading-tight">
                                        {item.desc}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={loadingStaffUpdate}
                        className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle disabled:opacity-50"
                      >
                        {loadingStaffUpdate ? 'Updating Permissions...' : 'Save Updated Permissions & Settings'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
