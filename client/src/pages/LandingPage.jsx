import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Video,
  Package,
  FileSpreadsheet,
  Printer,
  Sparkles,
  DollarSign,
  Truck,
  Users,
  ChevronRight,
  Lock,
  Layers,
  BarChart3,
  ExternalLink,
  Zap,
} from 'lucide-react';
import AmmarDevLogo from '../components/AmmarDevLogo';

export default function LandingPage({ onEnterLogin, onEnterSignup, onOpenFounder, brandProfile }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('inventory');
  const brandName = brandProfile?.brandName || 'Stylish Collection';

  const featureTabs = [
    {
      id: 'inventory',
      label: 'PR Inventory & Stock',
      icon: Package,
      headline: 'Automated Apparel Stock Deduction',
      description:
        'Allocate dresses for influencer gifting with exact sizes (Small, Medium, Large). The moment a package is dispatched, physical stock auto-deducts in real time with instant reversion upon deal cancellation.',
      points: [
        'Size-specific allocation (S, M, L, XL)',
        'Zero manual Excel spreadsheet errors',
        'Auto-deduction upon courier parcel dispatch',
        'Restores inventory if influencer cancels',
      ],
      previewStats: [
        { label: 'Active PR Articles', value: '18 Suits' },
        { label: 'Dispatched Pieces', value: '34 Units' },
        { label: 'Stock Accuracy', value: '100% Real-Time' },
      ],
    },
    {
      id: 'deals',
      label: 'Collaboration & Barter PR',
      icon: FileSpreadsheet,
      headline: 'Unified Deal Pipeline with Auto SP#',
      description:
        'Manage both Paid Collaborations and Barter PR (Nil Consideration Product Exchanges) effortlessly. Auto-generates unique SP# tracking codes, courier logs, and commercial terms.',
      points: [
        'Dedicated Barter PR toggle (Rs. 0 consideration)',
        'Automatic SP# generation (e.g. SP#17778)',
        'Courier integration (TCS, Leopard, PostEx, Trax)',
        'Delivery confirmation and receipt archiving',
      ],
      previewStats: [
        { label: 'Paid Collabs', value: 'Rs. 320,000' },
        { label: 'Barter Deals', value: '14 Creators' },
        { label: 'Dispatches Today', value: '6 Parcels' },
      ],
    },
    {
      id: 'schedule',
      label: 'Reel Scheduling Hub',
      icon: Video,
      headline: 'Executive Deliverables & Reel Pipeline',
      description:
        'Never let an influencer forget their agreed video. Track reels across a clean, monochrome pipeline with dedicated counters for pending shoots, draft reviews, and live published links.',
      points: [
        'Clear monochrome status tags (Pending, Draft, Approved, Live)',
        'Prominent Pending Shoot counter alert',
        'Direct link verification with 1-click Instagram view',
        'Automated countdown to agreed shoot dates',
      ],
      previewStats: [
        { label: 'Pending Shoots', value: '5 Deliverables' },
        { label: 'Drafts in Review', value: '3 Videos' },
        { label: 'Fulfilled / Live', value: '24 Reels' },
      ],
    },
    {
      id: 'finance',
      label: 'Financial Vouchers & Audit',
      icon: DollarSign,
      headline: 'A4 Printable Slips & WhatsApp Summaries',
      description:
        'Generate instant, A4 formatted Payment Vouchers and Barter Consignment Slips that fit perfectly on paper with zero blank space. Share structured WhatsApp confirmations with one click.',
      points: [
        'Isolated A4 print engine with zero margins cutoff',
        '1-Click formatted summary for WhatsApp DM sharing',
        'Weekly PR dispatch & audit sheets for team meetings',
        'Real-time budget overrun alarms & spend gauge',
      ],
      previewStats: [
        { label: 'Monthly Budget', value: 'Rs. 500,000' },
        { label: 'Current Spend', value: 'Rs. 312,000' },
        { label: 'Budget Status', value: 'Within Safe Limit' },
      ],
    },
  ];

  const activeFeature = featureTabs.find((f) => f.id === activeFeatureTab);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-slate-900 selection:text-white select-none">
      {/* 1. Top Enterprise Navbar */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <AmmarDevLogo className="w-7 h-7" animated={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                Ammar<span className="text-slate-500 font-semibold">Dev</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Enterprise IRM
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Influencer PR Operating System
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition">
            Core Features
          </a>
          <a href="#workflow" className="hover:text-slate-900 transition">
            How It Works
          </a>
          <a href="#security" className="hover:text-slate-900 transition">
            Enterprise Security
          </a>
          {onOpenFounder && (
            <button
              onClick={onOpenFounder}
              className="hover:text-slate-900 transition flex items-center gap-1.5 font-semibold text-slate-700"
            >
              <span>Founder Profile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Soft Background Radial Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-slate-100/80 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-700 mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-slate-700" />
          <span>The Dedicated PR & Influencer Operating System for Fashion Brands</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          Command Your Fashion PR, Influencer Collabs & Deliverables in One High-End Workspace.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
          Say goodbye to lost courier parcels, chaotic WhatsApp chats, forgotten reel deadlines, and untracked payments. AmmarDev CRM delivers automated SP# tracking, real-time inventory deduction, reel pipeline countdowns, and 1-click A4 financial audit slips.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onEnterSignup || onEnterLogin}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2.5 shadow-modal active:scale-[0.98]"
          >
            <span>Launch Brand Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50"
          >
            <span>Explore System Capabilities</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Trust Proof */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" /> Real-Time Apparel Stock Sync
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" /> Barter PR (Nil Consideration)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" /> A4 Printable Vouchers & Slips
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" /> Bank-Grade RBAC Security
          </span>
        </div>
      </section>

      {/* 3. Interactive Live Showcase Preview */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto pb-24">
        <div className="border border-slate-200/90 rounded-2xl bg-slate-50/50 p-3 sm:p-6 shadow-modal">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="ml-3 text-[11px] font-mono text-slate-400">
                https://crm.ammardev.com/workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                Active Client: {brandName}
              </span>
            </div>
          </div>

          {/* Interactive Feature Tabs Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {featureTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeFeatureTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`p-3 rounded-xl border text-left transition select-none flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                <activeFeature.icon className="w-3 h-3" />
                {activeFeature.label}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeFeature.headline}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                {activeFeature.description}
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                {activeFeature.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={onEnterLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-subtle"
                >
                  <span>Launch Module in Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Interactive Mock KPI Card */}
            <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Live Module Metrics
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="space-y-3">
                {activeFeature.previewStats.map((stat, sIdx) => (
                  <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-sans">{stat.label}</span>
                    <strong className="text-xs font-bold text-slate-900">{stat.value}</strong>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-[10px] text-slate-500 font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Synchronized with MongoDB database and Super Admin credentials.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Traditional Way vs. The AmmarDev Way */}
      <section id="features" className="py-20 bg-slate-50/60 border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Why Fashion Brands Switch
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The End of PR Chaos. The Dawn of Operational Precision.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Compare the error-prone traditional PR workflow with AmmarDev's modern automated command center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Chaotic Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-rose-200/70 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                The Traditional Spreadsheet / WhatsApp Way
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>PR suits handed over without recording exact size or inventory depletion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Courier receipts lost in drawers with untracked tracking numbers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Influencers delay video posting for months because nobody follows up systematically.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Finance team has zero visibility on how much budget was spent on creator fees.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Staff members have unlimited access with no role isolation or password security.</span>
                </li>
              </ul>
            </div>

            {/* The AmmarDev Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-900 shadow-subtle space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg font-mono">
                AmmarDev CRM
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                The AmmarDev Unified Operating System
              </div>
              <ul className="space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Real-time inventory deduction with instant stock restoration if deals change.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Unique auto-generated SP# assigned to every parcel with courier status tracking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Strict status pipeline with pulsing Pending alerts until creator video is published.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>1-Click A4 Payment Settlement Vouchers and Barter Consignment Slips for WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Super Admin master control with granular staff permission matrices and auto-lock.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (4 Simple Steps) */}
      <section id="workflow" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            From Creator Onboarding to Live Reel in 4 Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every step is mathematically tracked, auditable, and secured.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900">Add Creator Profile</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Store creator bio-data, Instagram handle, delivery address, phone number, and bank account for instant settlements.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900">Create Deal & SP#</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Choose Paid Collab or Barter PR. Assign PR suits with sizes. System auto-generates SP# and deducts inventory.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900">Dispatch & Schedule</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Enter courier tracking. Set agreed live date. Track video drafts through the monochrome review pipeline.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900">Print Slips & Audit</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Verify live Instagram link. Generate A4 payment voucher, send WhatsApp summary, and export weekly audit reports.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Security & Roles */}
      <section id="security" className="py-20 bg-slate-50/70 border-t border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              Enterprise-Grade Governance
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Strict Access Controls for Your Entire Brand Staff.
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              Maintain complete privacy and authority. Super Admins hold exclusive rights to create staff accounts, configure permissions, and protect sensitive financial budgets.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Granular RBAC Matrix:</strong>
                  <span className="text-slate-500">Dispatch staff only see parcels. Finance staff only see payouts. Budget limits remain hidden.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Single-Session Isolation:</strong>
                  <span className="text-slate-500">Browser closing permanently purges session keys. Password login is strictly demanded on every launch.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">15-Minute Idle Auto-Lock:</strong>
                  <span className="text-slate-500">Unattended laptops automatically lock down, preventing unauthorized staff tampering.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-xs text-slate-900">Staff Permission Matrix</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                Super Admin Only
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { perm: 'canAccessDashboard', label: 'View Dashboard KPIs & Analytics', checked: true },
                { perm: 'canAccessDeals', label: 'View Campaigns & Deal Records', checked: true },
                { perm: 'canDispatchPR', label: 'Dispatch PR Parcels & Update Courier', checked: true },
                { perm: 'canAccessBudget', label: 'View Financial PR Budget (Restricted)', checked: false },
                { perm: 'canDeleteRecords', label: 'Permanent Record Deletion (Restricted)', checked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-700 font-medium text-[11px]">{item.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      item.checked
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {item.checked ? 'GRANTED' : 'RESTRICTED'}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 font-mono text-center pt-2">
              Bcrypt Hashed Passwords • Zero Plaintext Exposure • Single-Session Storage
            </p>
          </div>
        </div>
      </section>

      {/* 6.5 Meet The Founder Spotlight */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Founder Avatar Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl p-1 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 shadow-modal overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/dh6td7vhx/image/upload/v1786349109/ammar-profile1_socote.png"
                    alt="Muhammad Ammar"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/dh6td7vhx/image/upload/v1786349122/ammar-profile2_ghlvga.png';
                    }}
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-tight shadow-sm whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Founder & Architect</span>
                </div>
              </div>
            </div>

            {/* Founder Details */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200">
                <Sparkles className="w-3 h-3 text-slate-700" />
                <span>The Vision Behind AmmarDev</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Engineered by Muhammad Ammar
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Full-Stack MERN Developer specializing in scalable enterprise business systems, B2B marketplaces, and automated fashion logistics.
              </p>

              <blockquote className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                "I engineered AmmarDev Influencer CRM to bring mathematical precision to luxury fashion PR—eliminating lost courier parcels, forgotten creator reels, and chaotic WhatsApp threads forever."
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {onOpenFounder && (
                  <button
                    onClick={onOpenFounder}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-subtle active:scale-[0.98]"
                  >
                    <span>Explore Full Founder Profile & Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <a
                  href="https://ammar-portfolio-mocha.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <span>Live Web Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="https://wa.me/923443762336"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition"
                >
                  WhatsApp: +92 344 3762336
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Bar */}
      <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-6 shadow-modal relative overflow-hidden">
          <div className="flex justify-center">
            <AmmarDevLogo className="w-12 h-12" fill="#ffffff" animated={true} />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Take Command of Your Influencer Marketing?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Designed and engineered exclusively for luxury apparel brands. Experience real-time stock control, flawless A4 vouchers, and complete PR precision.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterSignup || onEnterLogin}
              className="px-8 py-3.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-100 transition shadow-subtle active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span>Access Brand Workspace Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Modern Minimalist Footer */}
      <footer className="border-t border-slate-200/80 py-8 px-6 lg:px-12 bg-white text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AmmarDevLogo className="w-5 h-5" />
            <span className="font-bold text-slate-800">AmmarDev Influencer CRM</span>
            <span>•</span>
            <span>Enterprise Fashion PR Operating System</span>
          </div>

          <div>
            <span>© {new Date().getFullYear()} AmmarDev. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
