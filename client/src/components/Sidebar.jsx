import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  Users,
  Video,
  Plus,
  Bell,
  Building2,
  Database,
  Printer,
  KeyRound,
  Lock,
  LogOut,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Keyboard,
  Sparkles,
  X,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import AmmarDevLogo from './AmmarDevLogo';

export default function Sidebar({
  isOpenMobile = false,
  onCloseMobile = () => {},
  activeTab,
  setActiveTab,
  brandProfile,
  hasUnreadAlerts = false,
  alertCount = 0,
  onOpenNotifications,
  onOpenWeeklySheet,
  onOpenBrandSettings,
  onOpenBackupModal,
  onOpenSecurityCenter,
  onOpenBudget,
  onOpenShortcutsGuide,
  onLockScreen,
  onLogout,
  onOpenNewDeal,
  onOpenNewInfluencer,
  onOpenNewArticle,
  onPreviewLanding,
  onOpenFounder,
}) {
  const { hasPermission } = useRole();
  const { currentUser, isSuperAdmin } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, perm: 'canAccessDashboard' },
    { id: 'deals', label: 'Campaigns & Deals', icon: FileSpreadsheet, perm: 'canAccessDeals' },
    { id: 'schedule', label: 'Reel Scheduling', icon: Video, perm: 'canAccessSchedule' },
    { id: 'inventory', label: 'PR Articles & Quotas', icon: Package, perm: 'canAccessInventory' },
    { id: 'influencers', label: 'Influencer Profiles', icon: Users, perm: 'canAccessInfluencers' },
    { id: 'company', label: 'Company Profile', icon: Building2, perm: 'canAccessCompany' },
    { id: 'alerts', label: 'Schedule Alerts', icon: Bell, hasBadge: hasUnreadAlerts, count: alertCount },
  ];

  const navItems = allNavItems.filter((item) => {
    if (!item.perm) return true;
    return hasPermission(item.perm);
  });

  const brandName = brandProfile?.brandName || 'Stylish Collection';

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleAction = (callback) => {
    if (callback) callback();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Container: Off-canvas on < lg, Static on lg+ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 h-screen shrink-0 bg-white text-slate-800 flex flex-col justify-between border-r border-slate-200/80 select-none overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Software Header */}
        <div>
          {/* 1. AmmarDev Agency Branding - Razor-Sharp Vector Monogram + Mobile Close Button */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <AmmarDevLogo className="w-7 h-7 shrink-0" animated={true} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold tracking-tight text-slate-900">
                    Ammar<span className="text-slate-500 font-semibold">Dev</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-100 text-slate-600">
                    CRM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Influencer & PR Control
                </p>
              </div>
            </div>

            {/* Mobile Close Drawer Button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 -mr-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden transition"
              title="Close Menu"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Client Company Card - Clean Natural Workspace Selector */}
          <div className="px-3 pb-2">
            <div
              onClick={() => handleNavClick('company')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                activeTab === 'company'
                  ? 'bg-slate-900 text-white shadow-subtle'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {brandProfile?.brandLogo ? (
                  <img
                    src={brandProfile.brandLogo}
                    alt={brandName}
                    className="h-6 w-auto max-w-[70px] object-contain shrink-0"
                  />
                ) : (
                  <Building2 className={`w-4 h-4 shrink-0 ${activeTab === 'company' ? 'text-slate-300' : 'text-slate-400'}`} />
                )}
                <div className="min-w-0">
                  <span className={`text-[9px] block leading-none font-medium uppercase tracking-wider ${activeTab === 'company' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Brand
                  </span>
                  <strong className="text-xs font-semibold truncate block mt-0.5 leading-snug">
                    {brandName}
                  </strong>
                </div>
              </div>

              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${activeTab === 'company' ? 'text-slate-300' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* 3. Super Admin / Staff Active Status Pill */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSuperAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                <div className="min-w-0 truncate">
                  <span className="font-semibold text-slate-800 block truncate leading-tight">
                    {currentUser?.name || (isSuperAdmin ? 'Super Admin (Ammar)' : 'Staff Member')}
                  </span>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    {isSuperAdmin ? 'Master Authority' : 'PR Staff Account'}
                  </span>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => handleAction(onOpenSecurityCenter)}
                  title="Super Admin Security & Password Settings"
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-3 mb-2" />

          {/* Navigation Menu */}
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-subtle'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.hasBadge && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Security & Tools Section */}
          <div className="px-3 pt-3 mt-3 space-y-0.5 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block px-3 py-1">
              System & Tools
            </span>

            {/* PR Budget Controller */}
            {(hasPermission('canAccessBudget') || isSuperAdmin) && (
              <button
                onClick={() => handleAction(onOpenBudget)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
              >
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PR Budget Controller</span>
              </button>
            )}

            {/* Master Super Admin Security (Hidden from staff) */}
            {isSuperAdmin && (
              <button
                onClick={() => handleAction(onOpenSecurityCenter)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
              >
                <KeyRound className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Staff & Security</span>
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenNotifications)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Alerts Drawer</span>
              </div>
              {hasUnreadAlerts ? (
                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold">
                  {alertCount}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">0</span>
              )}
            </button>

            <button
              onClick={() => handleAction(onOpenWeeklySheet)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Weekly PR Sheet (A4)</span>
            </button>

            {(hasPermission('canExportData') || isSuperAdmin) && (
              <button
                onClick={() => handleAction(onOpenBackupModal)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
              >
                <Database className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Backup & Export</span>
              </button>
            )}

            {onPreviewLanding && (
              <button
                onClick={() => handleAction(onPreviewLanding)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
                title="Preview the SaaS Public Landing Page"
              >
                <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                <span>SaaS Landing Page</span>
              </button>
            )}

            {onOpenFounder && (
              <button
                onClick={() => handleAction(onOpenFounder)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition"
                title="Founder & Lead Systems Architect (Muhammad Ammar)"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-slate-300">
                    <img
                      src="https://res.cloudinary.com/dh6td7vhx/image/upload/v1786349109/ammar-profile1_socote.png"
                      alt="Muhammad Ammar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>Founder Profile</span>
                </div>
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                  Ammar
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions & Session Lock Footer */}
        <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/40">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block px-1">
            Quick Actions
          </span>

          {(hasPermission('canAccessDeals') || hasPermission('canDispatchPR') || isSuperAdmin) && (
            <button
              onClick={() => handleAction(onOpenNewDeal)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              New Collaboration
            </button>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {(hasPermission('canAccessInventory') || isSuperAdmin) && (
              <button
                onClick={() => handleAction(onOpenNewArticle)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition active:scale-[0.98]"
              >
                <Package className="w-3.5 h-3.5 text-slate-500" />
                Add Article
              </button>
            )}

            {(hasPermission('canAccessInfluencers') || isSuperAdmin) && (
              <button
                onClick={() => handleAction(onOpenNewInfluencer)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition active:scale-[0.98]"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Add Influencer
              </button>
            )}
          </div>

          {/* Hotkeys, Lock Screen & Sign Out */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <button
              onClick={() => handleAction(onOpenShortcutsGuide)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-slate-100"
              title="Keyboard Shortcuts Guide (Press ?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-600" />
              <span>Hotkeys</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-500">
                ?
              </kbd>
            </button>

            <button
              onClick={() => handleAction(onLockScreen)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-slate-100"
              title="Temporarily lock system screen (Press L)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>

            <button
              onClick={() => handleAction(onLogout)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-red-50"
              title="Sign out of AmmarDev CRM"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
