import React from 'react';
import {
  Keyboard,
  X,
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
  Sparkles,
} from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, onOpenCommandPalette }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Global Spotlight & Guide (Ctrl Combinations)',
      items: [
        { keys: ['Ctrl', 'Space'], desc: 'Open Command Palette & Quick Search', highlight: true },
        { keys: ['Ctrl', 'K'], desc: 'Alternative Command Palette shortcut' },
        { keys: ['Ctrl', '/'], desc: 'Open this Keyboard Shortcuts Guide', highlight: true },
        { keys: ['Esc'], desc: 'Close any active modal, dialog, or drawer' },
      ],
    },
    {
      title: 'Fast Page Navigation (Hold Alt + 1-7)',
      items: [
        { keys: ['Alt', '1'], desc: 'Go to Main Dashboard', icon: LayoutDashboard },
        { keys: ['Alt', '2'], desc: 'Go to Campaigns & Deals Manager', icon: FileSpreadsheet },
        { keys: ['Alt', '3'], desc: 'Go to Reel Scheduling & Deliverables Hub', icon: Video },
        { keys: ['Alt', '4'], desc: 'Go to PR Apparel Inventory', icon: Package },
        { keys: ['Alt', '5'], desc: 'Go to Creators / Influencers Directory', icon: Users },
        { keys: ['Alt', '6'], desc: 'Go to Client Company Profile', icon: Building2 },
        { keys: ['Alt', '7'], desc: 'Go to Schedule Alerts & Reminders', icon: Bell },
      ],
    },
    {
      title: 'Creation & Workflow Hotkeys (Hold Alt + Key)',
      items: [
        { keys: ['Alt', 'N'], desc: 'New Collaboration / Barter PR Deal', icon: Plus },
        { keys: ['Alt', 'C'], desc: 'Register New Creator Profile', icon: Users },
        { keys: ['Alt', 'A'], desc: 'Add New PR Dress to Inventory', icon: Package },
        { keys: ['Alt', 'B'], desc: 'Open PR Budget Controller', icon: DollarSign },
        { keys: ['Alt', 'W'], desc: 'Generate Weekly PR Dispatch Sheet', icon: Printer },
      ],
    },
    {
      title: 'Security & Session Control',
      items: [
        { keys: ['Alt', 'L'], desc: 'Instant Privacy Screen Lock', icon: Lock },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-backdrop-in font-sans select-none">
      <div className="bg-white rounded-2xl shadow-modal max-w-2xl w-full border border-slate-200/80 overflow-hidden flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-subtle">
              <Keyboard className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                AmmarDev Keyboard Shortcuts Guide
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                  Hotkeys
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Speed up your daily workflow with single-key navigation and quick actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Close Guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs divide-y divide-slate-100">
          {shortcutGroups.map((group, gIdx) => (
            <div key={group.title} className={gIdx > 0 ? 'pt-5' : ''}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        item.highlight
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {Icon && (
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${item.highlight ? 'text-slate-300' : 'text-slate-400'}`} />
                        )}
                        <span className={`font-medium truncate ${item.highlight ? 'text-slate-100 font-semibold' : 'text-slate-700'}`}>
                          {item.desc}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={k}>
                            {kIdx > 0 && (
                              <span className={`text-[10px] ${item.highlight ? 'text-slate-400' : 'text-slate-300'}`}>
                                +
                              </span>
                            )}
                            <kbd
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border shadow-xs min-w-[20px] text-center inline-block ${
                                item.highlight
                                  ? 'bg-slate-800 text-white border-slate-700'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {k}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            <span>Protected Shortcuts: Requires holding Ctrl or Alt to prevent accidental triggering.</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCommandPalette();
                }}
                className="px-3 py-1 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition flex items-center gap-1.5 shadow-subtle"
              >
                <Command className="w-3 h-3" />
                Open Command Palette
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
