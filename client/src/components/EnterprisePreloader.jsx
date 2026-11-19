import React, { useEffect, useState } from 'react';

/**
 * Enterprise Preloader & Opening Animation
 * Uses the exact architectural vector laser tracing provided by Muhammad Ammar.
 * Symmetrically traces both halves, locks into solid black monogram, then lifts curtain smoothly.
 */
export default function EnterprisePreloader({ onFinish }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 1. Trace symmetrical laser loading strokes (1.4s)
    const t1 = setTimeout(() => {
      setIsLoaded(true);
    }, 1400);

    // 2. Lock-in solid logo, then lift curtain to reveal website (2.0s)
    const t2 = setTimeout(() => {
      setReveal(true);
      if (onFinish) onFinish();
    }, 2050);

    // 3. Remove completely from DOM after fade out transition (2.9s)
    const t3 = setTimeout(() => {
      setHidden(true);
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  if (hidden) return null;

  return (
    <div
      id="enterprise-preloader"
      className={`${isLoaded ? 'is-loaded' : ''} ${reveal ? 'reveal-site' : ''}`}
      aria-label="Loading AmmarDev CRM"
    >
      <div className="logo-stage">
        <svg className="brand-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
          {/* Faint Guide Outline */}
          <path
            className="logo-guide"
            d="M 100 150 L 52 10 L 12 131 L 68 176 L 61 155 L 32 127 L 52 64 L 100 210 L 148 64 L 168 127 L 139 155 L 132 176 L 188 131 L 148 10 Z"
          />

          {/* Symmetrical Loading Trace (Left & Right Halves) */}
          <path
            className="logo-trace"
            pathLength="1"
            d="M 100 210 L 52 64 L 32 127 L 61 155 L 68 176 L 12 131 L 52 10 L 100 150"
          />
          <path
            className="logo-trace"
            pathLength="1"
            d="M 100 210 L 148 64 L 168 127 L 139 155 L 132 176 L 188 131 L 148 10 L 100 150"
          />

          {/* Exact Solid Logo for Lock-In */}
          <path
            className="logo-solid"
            d="M 100 150 L 52 10 L 12 131 L 68 176 L 61 155 L 32 127 L 52 64 L 100 210 L 148 64 L 168 127 L 139 155 L 132 176 L 188 131 L 148 10 Z"
          />
        </svg>
      </div>
      <div className="loading-meta">AmmarDev Enterprise CRM</div>
    </div>
  );
}
