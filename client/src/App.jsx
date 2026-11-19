import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DealsManager from './pages/DealsManager';
import ContentSchedule from './pages/ContentSchedule';
import PRInventory from './pages/PRInventory';
import InfluencersDirectory from './pages/InfluencersDirectory';
import CompanyProfile from './pages/CompanyProfile';
import AlertsCenter from './pages/AlertsCenter';
import LoginScreen from './pages/LoginScreen';
import LandingPage from './pages/LandingPage';
import FounderProfile from './pages/FounderProfile';

import NewDealModal from './components/NewDealModal';
import AddInfluencerModal from './components/AddInfluencerModal';
import AddArticleModal from './components/AddArticleModal';
import InfluencerDossierModal from './components/InfluencerDossierModal';
import BrandSettingsModal from './components/BrandSettingsModal';
import DataBackupModal from './components/DataBackupModal';
import WeeklyPRSheetModal from './components/WeeklyPRSheetModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import ScheduleReelModal from './components/ScheduleReelModal';
import SecurityCenterModal from './components/SecurityCenterModal';
import PRBudgetModal from './components/PRBudgetModal';
import EnterprisePreloader from './components/EnterprisePreloader';
import AmmarDevLogo from './components/AmmarDevLogo';
import CommandPaletteModal from './components/CommandPaletteModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';

import { AlertProvider } from './context/AlertContext';
import { RoleProvider, useRole } from './context/RoleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Bell, Building2, Printer, ShieldCheck, Lock, KeyRound, LogOut, DollarSign, Search, Keyboard, Command, ArrowRight } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLocked, currentUser, isSuperAdmin, lockScreen, logout, loading: authLoading } = useAuth();
  const { hasPermission } = useRole();

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Synchronize unauthenticated views with browser URL hash & history
  const getInitialUnauthView = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#login') return 'login';
    if (hash === '#founder') return 'founder';
    return 'landing';
  };

  const [unauthView, setUnauthView] = useState(getInitialUnauthView);
  const [previewLanding, setPreviewLanding] = useState(false);

  const navigateUnauth = (view, replace = false) => {
    setUnauthView(view);
    const hash = view === 'landing' ? '' : `#${view}`;
    const targetUrl = hash || window.location.pathname;
    try {
      if (replace) {
        window.history.replaceState({ view }, '', targetUrl);
      } else {
        window.history.pushState({ view }, '', targetUrl);
      }
    } catch (e) {
      // fallback
    }
  };

  const handleBackToLanding = () => {
    if (window.history.length > 1 && window.history.state?.view) {
      window.history.back();
    } else {
      navigateUnauth('landing', true);
    }
  };

  // Listen to browser Back/Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setUnauthView('login');
      } else if (hash === '#founder') {
        setUnauthView('founder');
      } else {
        setUnauthView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals state
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isNewInfluencerOpen, setIsNewInfluencerOpen] = useState(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);
  const [selectedDossierId, setSelectedDossierId] = useState(null);

  // Tools & Settings state
  const [isBrandSettingsOpen, setIsBrandSettingsOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isWeeklySheetOpen, setIsWeeklySheetOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsGuideOpen, setIsShortcutsGuideOpen] = useState(false);
  const [schedulingModalItem, setSchedulingModalItem] = useState(null);

  // Global Keyboard Shortcuts & Command Controller
  useEffect(() => {
    if (!isAuthenticated || isLocked) return;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable);

      // Escape always closes palette / guide
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsGuideOpen) {
          setIsShortcutsGuideOpen(false);
          return;
        }
      }

      // 1. Ctrl + Space OR Ctrl + K: Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ' || e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Ctrl + / OR Alt + / OR Shift + ?: Open Shortcuts Guide
      if (
        ((e.ctrlKey || e.metaKey || e.altKey) && (e.key === '/' || e.key === '?')) ||
        (!isInput && (e.key === '?' || (e.shiftKey && e.key === '/')))
      ) {
        e.preventDefault();
        setIsShortcutsGuideOpen(true);
        return;
      }

      // If user is currently typing inside an input/textarea, do NOT trigger any action
      if (isInput) return;

      // 3. Secured Modifier Hotkeys: MUST hold Alt (e.g. Alt+1, Alt+N) to prevent accidental clicks
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          if (hasPermission('canAccessDashboard')) setActiveTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          if (hasPermission('canAccessDeals')) setActiveTab('deals');
        } else if (e.key === '3') {
          e.preventDefault();
          if (hasPermission('canAccessSchedule')) setActiveTab('schedule');
        } else if (e.key === '4') {
          e.preventDefault();
          if (hasPermission('canAccessInventory')) setActiveTab('inventory');
        } else if (e.key === '5') {
          e.preventDefault();
          if (hasPermission('canAccessInfluencers')) setActiveTab('influencers');
        } else if (e.key === '6') {
          e.preventDefault();
          if (hasPermission('canAccessCompany')) setActiveTab('company');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('alerts');
        }

        // Action Hotkeys (Alt + N, Alt + C, Alt + A, Alt + B, Alt + W, Alt + L)
        else if (e.key === 'n' || e.key === 'N') {
          if (hasPermission('canDispatchPR') || isSuperAdmin) {
            e.preventDefault();
            setIsNewDealOpen(true);
          }
        } else if (e.key === 'c' || e.key === 'C') {
          if (hasPermission('canAccessInfluencers') || isSuperAdmin) {
            e.preventDefault();
            setIsNewInfluencerOpen(true);
          }
        } else if (e.key === 'a' || e.key === 'A') {
          if (hasPermission('canAccessInventory') || isSuperAdmin) {
            e.preventDefault();
            setIsNewArticleOpen(true);
          }
        } else if (e.key === 'b' || e.key === 'B') {
          if (hasPermission('canAccessBudget') || isSuperAdmin) {
            e.preventDefault();
            setIsBudgetModalOpen(true);
          }
        } else if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setIsWeeklySheetOpen(true);
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          lockScreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isLocked, isCommandPaletteOpen, isShortcutsGuideOpen, isSuperAdmin]);

  // Global data
  const [brandProfile, setBrandProfile] = useState(null);
  const [deals, setDeals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [budgetOverview, setBudgetOverview] = useState(null);

  // Dismissed alerts tracking
  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ammardev_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastSeenAlerts, setLastSeenAlerts] = useState(() => {
    return Number(localStorage.getItem('ammardev_last_seen_alerts') || 0);
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Auto-redirect if current staff lacks permission for the active tab
  useEffect(() => {
    const tabPermMap = {
      dashboard: 'canAccessDashboard',
      deals: 'canAccessDeals',
      schedule: 'canAccessSchedule',
      inventory: 'canAccessInventory',
      influencers: 'canAccessInfluencers',
      company: 'canAccessCompany',
    };

    if (activeTab in tabPermMap && !hasPermission(tabPermMap[activeTab])) {
      const allowed = ['dashboard', 'deals', 'schedule', 'inventory', 'influencers', 'company', 'alerts'].find(
        (t) => !tabPermMap[t] || hasPermission(tabPermMap[t])
      );
      if (allowed && allowed !== activeTab) {
        setActiveTab(allowed);
      }
    }
  }, [activeTab, currentUser, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated && !isLocked) {
      loadGlobalData();
    }
  }, [refreshKey, isAuthenticated, isLocked]);

  const loadGlobalData = async () => {
    try {
      const [brandRes, dealsRes, artRes, budgetRes] = await Promise.all([
        api.getBrandProfile(),
        api.getDeals(),
        api.getArticles(),
        api.getBudgetOverview().catch(() => ({ data: null })),
      ]);
      setBrandProfile(brandRes.data || {});
      setDeals(dealsRes.data || []);
      setArticles(artRes.data || []);
      if (budgetRes?.data) setBudgetOverview(budgetRes.data);
    } catch (e) {
      console.error('Error fetching global data', e);
    }
  };

  const isBudgetOverrun =
    Boolean(budgetOverview?.monthly?.isOverrun) || Boolean(budgetOverview?.weekly?.isOverrun);

  // Compute live active alerts
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeAlertsList = [];

  deals.forEach((deal) => {
    const isDelivered = deal.prArticles?.some((p) => p.dispatchStatus === 'Delivered');
    const hasUnscheduledVideo = deal.videos?.some((v) => !v.scheduledDate && v.status !== 'Video Live');
    const alertIdAwaiting = `awaiting_${deal._id}`;

    if (isDelivered && hasUnscheduledVideo && !dismissedAlertIds.includes(alertIdAwaiting)) {
      activeAlertsList.push(alertIdAwaiting);
    }

    deal.videos?.forEach((video, vIdx) => {
      if (video.status === 'Video Live') return;
      if (video.scheduledDate) {
        const schedDate = new Date(video.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        const schedStr = schedDate.toISOString().split('T')[0];
        const diffDays = Math.round((schedDate - now) / (1000 * 60 * 60 * 24));
        const alertId = `reel_${deal._id}_${vIdx}`;

        if (!dismissedAlertIds.includes(alertId)) {
          if (schedStr === todayStr || (diffDays > 0 && diffDays <= 7) || diffDays < 0) {
            activeAlertsList.push(alertId);
          }
        }
      }
    });
  });

  const alertCount = activeAlertsList.length;
  const hasUnreadAlerts = alertCount > 0 && lastSeenAlerts < Date.now() - 60000;

  const markAlertsAsRead = () => {
    const nowTs = Date.now();
    setLastSeenAlerts(nowTs);
    localStorage.setItem('ammardev_last_seen_alerts', nowTs.toString());
  };

  const handleDismissAlert = (id) => {
    setDismissedAlertIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('ammardev_dismissed_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDismissAllAlerts = () => {
    setDismissedAlertIds((prev) => {
      const updated = Array.from(new Set([...prev, ...activeAlertsList]));
      localStorage.setItem('ammardev_dismissed_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  const openAlertsPage = () => {
    markAlertsAsRead();
    setActiveTab('alerts');
  };

  const openAlertsDrawer = () => {
    markAlertsAsRead();
    setIsNotificationsDrawerOpen(true);
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-500">
        Verifying Security Credentials...
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (unauthView === 'landing') {
      return (
        <LandingPage
          onEnterLogin={() => navigateUnauth('login')}
          onOpenFounder={() => navigateUnauth('founder')}
          brandProfile={brandProfile}
        />
      );
    }
    if (unauthView === 'founder') {
      return (
        <FounderProfile
          onBack={handleBackToLanding}
          onEnterLogin={() => navigateUnauth('login')}
          isFromCRM={false}
        />
      );
    }
    return (
      <LoginScreen
        brandProfile={brandProfile}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Locked Session
  if (isLocked) {
    return <LoginScreen brandProfile={brandProfile} />;
  }

  // Preview Landing Page while logged in
  if (previewLanding) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Live SaaS Intro / Landing Page</span>
            <span className="text-slate-400 hidden sm:inline">
              | Active Workspace: {currentUser?.name} ({currentUser?.role === 'super_admin' ? 'Super Admin' : 'Staff'})
            </span>
          </div>
          <button
            onClick={() => setPreviewLanding(false)}
            className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Return to Workspace Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <LandingPage
          onEnterLogin={() => setPreviewLanding(false)}
          onOpenFounder={() => {
            setPreviewLanding(false);
            setActiveTab('founder');
          }}
          brandProfile={brandProfile}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-800 font-sans antialiased">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'alerts') markAlertsAsRead();
          setActiveTab(tab);
        }}
        brandProfile={brandProfile}
        hasUnreadAlerts={hasUnreadAlerts}
        alertCount={alertCount}
        onOpenNotifications={openAlertsDrawer}
        onOpenWeeklySheet={() => setIsWeeklySheetOpen(true)}
        onOpenBrandSettings={() => setIsBrandSettingsOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)}
        onOpenBudget={() => setIsBudgetModalOpen(true)}
        onOpenShortcutsGuide={() => setIsShortcutsGuideOpen(true)}
        onLockScreen={lockScreen}
        onLogout={logout}
        onOpenNewDeal={() => setIsNewDealOpen(true)}
        onOpenNewInfluencer={() => setIsNewInfluencerOpen(true)}
        onOpenNewArticle={() => setIsNewArticleOpen(true)}
        onPreviewLanding={() => setPreviewLanding(true)}
        onOpenFounder={() => setActiveTab('founder')}
      />

      {/* 2. Main Area (Only This Area Scrolls Smoothly) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar - Modern Unframed SaaS Header */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between text-xs font-sans shadow-subtle z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AmmarDevLogo className="w-5 h-5" />
              <span className="font-bold tracking-tight text-slate-900 text-xs hidden sm:inline">
                AmmarDev Influencer CRM
              </span>
            </div>

            <span className="text-slate-200 hidden sm:inline">/</span>

            {/* Client Company Badge - Pure Unframed Brand Display */}
            <button
              onClick={() => setActiveTab('company')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition group"
              title="Click to view Company Profile"
            >
              {brandProfile?.brandLogo ? (
                <img
                  src={brandProfile.brandLogo}
                  alt={brandProfile.brandName}
                  className="h-5 w-auto max-w-[85px] object-contain shrink-0"
                />
              ) : (
                <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              )}
              <span className="font-semibold text-xs text-slate-800 group-hover:text-slate-900">
                {brandProfile?.brandName || 'Stylish Collection'}
              </span>
            </button>
          </div>

          {/* Quick Command Palette Spotlight Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition text-xs select-none shadow-2xs"
            title="Press Ctrl+Space or Ctrl+K for quick commands"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-500">Quick Commands & Search...</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-500 shadow-xs">
                Ctrl
              </kbd>
              <span className="text-[10px] text-slate-400">+</span>
              <kbd className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-500 shadow-xs">
                Space
              </kbd>
            </div>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Keyboard Shortcuts Guide Button */}
            <button
              onClick={() => setIsShortcutsGuideOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition font-medium"
              title="Keyboard Shortcuts Guide (Press ?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline text-xs font-semibold">Hotkeys</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-100 border border-slate-300 text-[9px] font-mono font-bold text-slate-600">
                ?
              </kbd>
            </button>
            {/* PR Budget Controller Quick Button */}
            {(hasPermission('canAccessBudget') || isSuperAdmin) && (
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition font-medium ${
                  isBudgetOverrun
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="PR Budget Controller & Financial Tracking"
              >
                <DollarSign className={`w-3.5 h-3.5 ${isBudgetOverrun ? 'text-rose-600' : 'text-emerald-600'}`} />
                <span className="hidden md:inline font-semibold">
                  {isBudgetOverrun ? 'Budget Overrun!' : 'PR Budget'}
                </span>
              </button>
            )}

            {/* Super Admin / Staff Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100/70 text-xs text-slate-700">
              <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              <span className="font-medium text-slate-800">
                {currentUser?.name || (isSuperAdmin ? 'Super Admin (Ammar)' : 'Staff Member')}
              </span>
            </div>

            {/* Security & Passwords Button (Super Admin Only) */}
            {isSuperAdmin && (
              <button
                onClick={() => setIsSecurityCenterOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition font-medium"
                title="Super Admin Security & Password Management"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden md:inline">Staff & Security</span>
              </button>
            )}

            {/* Lock Session Screen */}
            <button
              onClick={lockScreen}
              className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
              title="Lock Session Screen"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Alerts Bell with Red Dot */}
            <button
              onClick={openAlertsDrawer}
              className="relative p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
              title="Open Reel Alerts Drawer"
            >
              <Bell className="w-3.5 h-3.5" />
              {hasUnreadAlerts && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Weekly PR Sheet */}
            <button
              onClick={() => setIsWeeklySheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-subtle active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Weekly Sheet</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="p-1.5 rounded-md bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Scrollable Dynamic Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              setActiveTab={setActiveTab}
              onOpenNewDeal={() => setIsNewDealOpen(true)}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'deals' && (
            <DealsManager
              key={refreshKey}
              onOpenNewDeal={() => setIsNewDealOpen(true)}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'schedule' && (
            <ContentSchedule
              key={refreshKey}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'inventory' && (
            <PRInventory
              key={refreshKey}
              onOpenNewArticle={() => setIsNewArticleOpen(true)}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'influencers' && (
            <InfluencersDirectory
              key={refreshKey}
              onOpenNewInfluencer={() => setIsNewInfluencerOpen(true)}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'company' && (
            <CompanyProfile
              brandProfile={brandProfile}
              deals={deals}
              articles={articles}
              onOpenEditSettings={() => setIsBrandSettingsOpen(true)}
              onOpenPermissions={() => setIsSecurityCenterOpen(true)}
              onOpenWeeklySheet={() => setIsWeeklySheetOpen(true)}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenter
              deals={deals}
              dismissedAlertIds={dismissedAlertIds}
              onDismissAlert={handleDismissAlert}
              onDismissAllAlerts={handleDismissAllAlerts}
              onOpenScheduleModal={(deal, video) => {
                setSchedulingModalItem({ deal, video });
              }}
              onOpenDossier={(id) => setSelectedDossierId(id)}
            />
          )}

          {activeTab === 'founder' && (
            <FounderProfile
              onBack={() => setActiveTab('dashboard')}
              isFromCRM={true}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="shrink-0 border-t border-slate-200 bg-white py-2.5 px-6 text-center text-[11px] font-mono uppercase text-slate-400">
          AmmarDev Influencer CRM & PR Tracking System ?" Master Control Edition
        </footer>
      </div>

      {/* Modals & Drawers */}
      <NewDealModal
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        onSuccess={triggerRefresh}
      />

      <AddInfluencerModal
        isOpen={isNewInfluencerOpen}
        onClose={() => setIsNewInfluencerOpen(false)}
        onSuccess={triggerRefresh}
      />

      <AddArticleModal
        isOpen={isNewArticleOpen}
        onClose={() => setIsNewArticleOpen(false)}
        onSuccess={triggerRefresh}
      />

      <InfluencerDossierModal
        influencerId={selectedDossierId}
        onClose={() => setSelectedDossierId(null)}
        onRefresh={triggerRefresh}
      />

      <BrandSettingsModal
        isOpen={isBrandSettingsOpen}
        onClose={() => setIsBrandSettingsOpen(false)}
        onSuccess={triggerRefresh}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      <WeeklyPRSheetModal
        isOpen={isWeeklySheetOpen}
        onClose={() => setIsWeeklySheetOpen(false)}
      />

      <SecurityCenterModal
        isOpen={isSecurityCenterOpen}
        onClose={() => setIsSecurityCenterOpen(false)}
      />

      <PRBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          triggerRefresh();
        }}
      />

      <NotificationsDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        deals={deals}
        dismissedAlertIds={dismissedAlertIds}
        onDismissAlert={handleDismissAlert}
        onDismissAllAlerts={handleDismissAllAlerts}
        onOpenScheduleModal={(deal, video) => {
          setIsNotificationsDrawerOpen(false);
          setSchedulingModalItem({ deal, video });
        }}
        onOpenAlertsPage={openAlertsPage}
      />

      {schedulingModalItem && (
        <ScheduleReelModal
          deal={schedulingModalItem.deal}
          videoItem={schedulingModalItem.video}
          onClose={() => setSchedulingModalItem(null)}
          onSuccess={triggerRefresh}
        />
      )}

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsGuideOpen}
        onClose={() => setIsShortcutsGuideOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'alerts') markAlertsAsRead();
        }}
        onOpenNewDeal={() => setIsNewDealOpen(true)}
        onOpenNewInfluencer={() => setIsNewInfluencerOpen(true)}
        onOpenNewArticle={() => setIsNewArticleOpen(true)}
        onOpenBudget={() => setIsBudgetModalOpen(true)}
        onOpenWeeklySheet={() => setIsWeeklySheetOpen(true)}
        onOpenShortcutsGuide={() => setIsShortcutsGuideOpen(true)}
        onLockScreen={lockScreen}
      />
    </div>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <RoleProvider>
          <EnterprisePreloader />
          <MainApp />
        </RoleProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
