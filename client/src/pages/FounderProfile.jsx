import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  MessageCircle,
  Linkedin,
  Github,
  Globe,
  ShieldCheck,
  Code2,
  Sparkles,
  Layers,
  Database,
  Terminal,
  CheckCircle2,
  Building2,
  Briefcase,
  Award,
} from 'lucide-react';
import AmmarDevLogo from '../components/AmmarDevLogo';

export default function FounderProfile({ onBack, onEnterLogin, isFromCRM = false }) {
  const profileImage = 'https://res.cloudinary.com/dh6td7vhx/image/upload/v1786349109/ammar-profile1_socote.png';
  const profileImageAlt = 'https://res.cloudinary.com/dh6td7vhx/image/upload/v1786349122/ammar-profile2_ghlvga.png';

  useEffect(() => {
    if (!onBack) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const techStack = [
    { name: 'React 19 & DOM', category: 'Frontend Ecosystem', desc: 'Ultra-fast state management, component architecture, and modern reactive patterns.' },
    { name: 'Node.js & Express', category: 'Backend Systems', desc: 'Asynchronous event-driven RESTful APIs, token security, and route controllers.' },
    { name: 'MongoDB & Mongoose', category: 'Database Layer', desc: 'Scalable NoSQL document schemas, complex data aggregations, and strict index models.' },
    { name: 'Tailwind CSS & Vite', category: 'Styling & Tooling', desc: 'Next-gen HMR build tooling, utility-first design systems, and custom A4 print engines.' },
    { name: 'Enterprise RBAC & Auth', category: 'Security Architecture', desc: 'Single-session storage isolation, Bcrypt password encryption, and idle auto-lock.' },
    { name: 'Docker & Git', category: 'DevOps & Workflow', desc: 'Version control, atomic commits, and reproducible container environments.' },
  ];

  const milestoneProjects = [
    {
      title: 'AmmarDev Influencer CRM & PR OS',
      tag: 'Enterprise Flagship',
      role: 'Founder & Full-Stack Architect',
      description:
        'A dedicated Influencer Relationship Management (IRM) and apparel logistics platform designed specifically for luxury fashion brands. Eliminates spreadsheet chaos with real-time apparel stock deduction, automated SP# courier dispatch tracking, monochrome reel schedule pipelines, and 1-click A4 financial vouchers.',
      metrics: ['Active Client: Stylish Collection', '100% Stock Sync Accuracy', 'Automated A4 Print Engine'],
      tech: ['React 19', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    },
    {
      title: 'GA Garments Accessories Marketplace',
      tag: 'B2B Commerce Platform',
      role: 'Lead Full-Stack Developer',
      description:
        'A specialized digital business platform engineered for the garments accessories wholesale and manufacturing market. Features scalable product cataloging, complex state management, and streamlined vendor-to-factory supply chains.',
      metrics: ['Live at gagarmentsacc.com', 'Garments Industry Workflow', 'High-Load Catalog'],
      tech: ['MERN Stack', 'RESTful APIs', 'Cloudinary CDN', 'Vercel Edge'],
      link: 'https://www.gagarmentsacc.com',
    },
    {
      title: 'Enterprise Security & Session Isolation Suite',
      tag: 'Security & Auth',
      role: 'Security Engineer',
      description:
        'A specialized single-session access management system engineered to prevent unauthorized staff access, credential sharing, and accidental data exposure in multi-user enterprise environments.',
      metrics: ['Bcrypt Hash Protection', '15-Min Idle Auto-Lock', 'Zero Plaintext Exposure'],
      tech: ['Node.js Crypto', 'SessionStorage Isolation', 'RBAC Matrix'],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-slate-900 selection:text-white select-none">
      {/* 1. Sticky Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFromCRM ? 'Return to Workspace' : 'Back to Overview'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <AmmarDevLogo className="w-6 h-6" animated={true} />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xs tracking-tight text-slate-900">
                Ammar<span className="text-slate-500 font-semibold">Dev</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Founder & Architect Profile</span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://ammar-portfolio-mocha.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {onEnterLogin && !isFromCRM && (
            <button
              onClick={onEnterLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* 2. Hero Spotlight Section */}
      <section className="relative pt-14 pb-16 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Avatar & Quick Badges */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative group">
              {/* Outer decorative glow frame */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl p-1 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 shadow-modal">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-100 flex items-center justify-center relative">
                  <img
                    src={profileImage}
                    alt="Muhammad Ammar"
                    onError={(e) => {
                      e.target.src = profileImageAlt;
                    }}
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overly at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>
              </div>

              {/* Status Pill */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Full-Stack Systems Architect</span>
              </div>
            </div>

            {/* Quick Contacts Pills */}
            <div className="mt-8 flex items-center justify-center gap-2.5 flex-wrap">
              <a
                href="https://wa.me/923443762336"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>+92 344 3762336</span>
              </a>

              <a
                href="mailto:ammarulislam05@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 text-xs font-semibold transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>ammarulislam05@gmail.com</span>
              </a>
            </div>

            <div className="mt-3 flex items-center gap-3 text-slate-500">
              <a
                href="https://www.linkedin.com/in/muhammad-ammar-147433360"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/mAmmar03"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="GitHub Repositories"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://ammar-portfolio-mocha.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="Personal Web Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Bio, Vision & Philosophy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Founder & Creator • AmmarDev</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Muhammad Ammar
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Full-Stack MERN Developer and systems architect specializing in high-performance enterprise business platforms, B2B marketplaces, and luxury fashion logistics systems.
            </p>

            {/* Core Philosophy Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 relative space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                Engineering Philosophy
              </span>
              <blockquote className="text-xs sm:text-sm font-medium text-slate-800 italic leading-relaxed">
                "I believe great software isn't just about clean code—it's about understanding the person on the other side of the screen and building robust, scalable solutions that truly solve chaotic real-world business problems."
              </blockquote>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              AmmarDev Influencer CRM was engineered to bridge modern web architecture with Pakistan's apparel and pret fashion market. Seeing fashion brands lose millions due to untracked PR packages, forgotten creator videos, and unorganized payments, Ammar architected a unified operating system that tracks every dress size, courier tracking code, reel deadline, and financial voucher with mathematical precision.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" /> Dedicated IRM Architecture
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" /> Single-Session Strict Security
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" /> Garments Industry Specialization
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Milestone Projects Showcase */}
      <section className="py-16 bg-slate-50/70 border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
              Featured Systems
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Architectural Work & Production Platforms
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Key enterprise platforms engineered and shipped by Muhammad Ammar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {milestoneProjects.map((project, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {project.tag}
                    </span>
                    <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1.5">
                    {project.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tech.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-50 text-slate-600 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {project.link && (
                    <div className="pt-2">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                      >
                        <span>Visit Live Platform</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Technical Core & Architectural Competencies */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
            Technical Stack
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Core Engineering & Architectural Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Production-tested full-stack capabilities powering enterprise systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                {tech.category}
              </span>
              <h4 className="font-bold text-sm text-slate-900">{tech.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Direct Connect / Contact Callout */}
      <section className="py-16 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6 shadow-modal">
          <div className="flex justify-center">
            <AmmarDevLogo className="w-10 h-10" fill="#ffffff" animated={true} />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Connect Directly with Muhammad Ammar
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Interested in deploying AmmarDev Influencer CRM for your fashion brand, custom enterprise architectures, or exploring strategic technical collaborations?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/923443762336"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-subtle flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp (+92 344 3762336)</span>
            </a>

            <a
              href="mailto:ammarulislam05@gmail.com"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-slate-300" />
              <span>ammarulislam05@gmail.com</span>
            </a>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            <span>Portfolio: </span>
            <a
              href="https://ammar-portfolio-mocha.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-slate-200"
            >
              https://ammar-portfolio-mocha.vercel.app/
            </a>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-200/80 py-8 px-6 lg:px-12 bg-white text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AmmarDevLogo className="w-4 h-4" />
            <span className="font-semibold text-slate-800">Muhammad Ammar</span>
            <span>•</span>
            <span>Founder & Systems Architect, AmmarDev</span>
          </div>

          <div>
            <span>© {new Date().getFullYear()} AmmarDev. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
