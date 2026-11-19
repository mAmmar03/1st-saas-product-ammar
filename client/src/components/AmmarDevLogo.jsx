import React from 'react';

/**
 * Pure Vector Monogram Logo for AmmarDev
 * Razor sharp at any resolution, mathematically aligned geometric architecture.
 */
export default function AmmarDevLogo({
  className = 'w-7 h-7',
  fill = '#09090b',
  animated = false,
  title = 'AmmarDev',
}) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={`${className} overflow-visible shrink-0 ${animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M 100 150 L 52 10 L 12 131 L 68 176 L 61 155 L 32 127 L 52 64 L 100 210 L 148 64 L 168 127 L 139 155 L 132 176 L 188 131 L 148 10 Z"
        fill={fill}
      />
    </svg>
  );
}
