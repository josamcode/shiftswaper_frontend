import React from 'react';

/** The Shiftswaper mark: a calendar tile carrying two opposing swap arrows. */
export const LogoMark = ({ className = 'h-8 w-8', title }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    <rect x="1" y="3" width="30" height="28" rx="8.5" fill="#201C44" />
    <rect x="8" y="0.75" width="3" height="6.5" rx="1.5" fill="#201C44" stroke="#FBFAF9" strokeWidth="1.5" />
    <rect x="21" y="0.75" width="3" height="6.5" rx="1.5" fill="#201C44" stroke="#FBFAF9" strokeWidth="1.5" />
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <path d="M8.5 13.5h14" stroke="#FFFFFF" />
      <path d="M19 10l3.75 3.5L19 17" stroke="#FFFFFF" />
      <path d="M23.5 22.5h-14" stroke="#2998FF" />
      <path d="M13 19l-3.75 3.5L13 26" stroke="#2998FF" />
    </g>
  </svg>
);

const Logo = ({ className = '', markClassName = 'h-8 w-8', textClassName = 'text-[22px]', inverted = false }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark className={markClassName} />
    <span
      className={`font-sans font-extrabold tracking-[-0.03em] ${inverted ? 'text-white' : 'text-ink'} ${textClassName}`}
    >
      Shiftswaper
    </span>
  </span>
);

export default Logo;
