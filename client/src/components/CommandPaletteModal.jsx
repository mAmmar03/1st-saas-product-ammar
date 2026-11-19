import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  FileSpreadsheet,
  Video,
  Package,
  Users,
  Building2,
  Bell,
  Plus,
  Lock,
  DollarSign,
  Printer,
  Keyboard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewDeal,
  onOpenNewInfluencer,
  onOpenNewArticle,
  onOpenBudget,
  onOpenWeeklySheet,
  onOpenShortcutsGuide,
  onLockScreen,
}) {
  const { hasPermission } = useRole();
  const { isSuperAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allActions = [
    // Navigation
    {
      id: 'nav_dashboard',
      category: 'Navigation',
      title: 'Go to Dashboard Overview',
      subtitle: 'View live PR KPIs, delivery count, and budget',
      icon: LayoutDashboard,
      badge: 'Alt+1',
      perm: 'canAccessDashboard',
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'nav_deals',
      category: 'Navigation',
      title: 'Go to Campaigns & Deals Manager',
      subtitle: 'Track SP# parcels, deliverables, and payment slips',
      icon: FileSpreadsheet,
      badge: 'Alt+2',
      perm: 'canAccessDeals',
      action: () => onNavigate('deals'),
    },
    {
      id: 'nav_schedule',
      category: 'Navigation',
      title: 'Go to Reel Scheduling Hub',
      subtitle: 'Monitor pending shoots, received drafts, and live links',
      icon: Video,
      badge: 'Alt+3',
      perm: 'canAccessSchedule',
      action: () => onNavigate('schedule'),
    },
    {
      id: 'nav_inventory',
      category: 'Navigation',
      title: 'Go to PR Apparel Inventory',
      subtitle: 'Stock counts, sizes (S/M/L), and remaining suit allocations',
      icon: Package,
      badge: 'Alt+4',
      perm: 'canAccessInventory',
      action: () => onNavigate('inventory'),
    },
    {
      id: 'nav_influencers',
      category: 'Navigation',
      title: 'Go to Creators Directory',
      subtitle: 'Influencer bios, addresses, phone numbers, and histories',
      icon: Users,
      badge: 'Alt+5',
      perm: 'canAccessInfluencers',
      action: () => onNavigate('influencers'),
    },
    {
      id: 'nav_company',
      category: 'Navigation',
      title: 'Go to Client Company Profile',
      subtitle: 'Manage brand identity, contact info, and signatures',
      icon: Building2,
      badge: 'Alt+6',
      perm: 'canAccessCompany',
      action: () => onNavigate('company'),
    },
    {
      id: 'nav_alerts',
      category: 'Navigation',
      title: 'Go to Schedule Alerts & Reminders',
      subtitle: 'Reels due today and overdue drafts requiring follow-up',
      icon: Bell,
      badge: 'Alt+7',
      action: () => onNavigate('alerts'),
    },

    // Quick Creation
    {
      id: 'act_new_deal',
      category: 'Quick Actions',
      title: 'Create New Collaboration / Barter Deal',
      subtitle: 'Assign PR dresses, auto-generate SP#, and set agreed rates',
      icon: Plus,
      badge: 'Alt+N',
      perm: 'canDispatchPR',
      action: onOpenNewDeal,
    },
    {
      id: 'act_new_influencer',
      category: 'Quick Actions',
      title: 'Register New Creator Profile',
      subtitle: 'Add name, Instagram handle, address, and phone',
      icon: Users,
      badge: 'Alt+C',
      perm: 'canAccessInfluencers',
      action: onOpenNewInfluencer,
    },
    {
      id: 'act_new_article',
      category: 'Quick Actions',
      title: 'Add New PR Dress to Inventory',
      subtitle: 'Add dress name, SKU code, and allocate PR quantity',
      icon: Package,
      badge: 'Alt+A',
      perm: 'canAccessInventory',
      action: onOpenNewArticle,
    },
    {
      id: 'act_budget',
      category: 'Quick Actions',
      title: 'Open PR Budget Controller',
      subtitle: 'Set weekly and monthly spend limits with real-time spend gauge',
      icon: DollarSign,
      badge: 'Alt+B',
      perm: 'canAccessBudget',
      action: onOpenBudget,
    },
    {
      id: 'act_weekly_sheet',
      category: 'Quick Actions',
      title: 'Generate Weekly PR Dispatch Sheet',
      subtitle: 'Clean A4 print sheet for weekly team alignment',
      icon: Printer,
      badge: 'Alt+W',
      perm: 'canAccessDeals',
      action: onOpenWeeklySheet,
    },

    // System & Tools
    {
      id: 'sys_shortcuts',
      category: 'System',
      title: 'Open Keyboard Shortcuts Guide',
      subtitle: 'View complete hotkeys cheat sheet',
      icon: Keyboard,
      badge: 'Ctrl+/',
      action: onOpenShortcutsGuide,
    },
    {
      id: 'sys_lock',
      category: 'System',
      title: 'Lock CRM Session Now',
      subtitle: 'Instant screen lock for privacy and security',
      icon: Lock,
      badge: 'Alt+L',
      action: onLockScreen,
    },
  ];

  // Filter actions by permissions and search query
  const filteredActions = allActions.filter((item) => {
    if (item.perm && !isSuperAdmin && !hasPermission(item.perm)) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.badge.toLowerCase() === q
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredActions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredActions[selectedIndex];
      if (target) {
        onClose();
        target.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-backdrop-in font-sans select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-modal max-w-xl w-full border border-slate-200/80 overflow-hidden flex flex-col max-h-[75vh] animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
          <Command className="w-5 h-5 text-slate-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or press hotkey..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-500 shadow-xs">
            Esc
          </kbd>
        </div>

        {/* Filtered Action List */}
        <div className="p-2 overflow-y-auto divide-y divide-slate-50">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No commands found matching "{query}"
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={action.id}
                  onClick={() => {
                    onClose();
                    action.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs truncate">
                          {action.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {action.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {action.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <kbd
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border shadow-xs ${
                        isSelected
                          ? 'bg-slate-800 text-white border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {action.badge}
                    </kbd>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600 font-bold mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600 font-bold mr-1">
                ↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600 font-bold mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            Press <kbd className="px-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-600">?</kbd> for full hotkeys
          </span>
        </div>
      </div>
    </div>
  );
}
