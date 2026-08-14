import React from 'react';

// World-class Native SVG Civic Balance Scale & Justice Engine (Universal 60fps Native Hardware Animation)
export function CivicScaleMotion({ className = "w-56 h-56" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Purple Radial Aura */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(109, 40, 217, 0.15) 60%, transparent 80%)' }}
      />

      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="scalePurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="scaleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="scaleEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="scaleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6D28D9" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Central Pillar & Base Platform */}
        <g filter="url(#scaleShadow)">
          <rect x="70" y="240" width="160" height="24" rx="12" fill="url(#scalePurpleGrad)" />
          <rect x="100" y="226" width="100" height="18" rx="8" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
          <rect x="140" y="70" width="20" height="165" rx="8" fill="url(#scalePurpleGrad)" />
          <circle cx="150" cy="70" r="18" fill="url(#scaleGoldGrad)" />
          <circle cx="150" cy="70" r="9" fill="#FEF3C7" />
        </g>

        {/* Swaying Beam Group with Universal Native SVG animateTransform */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 150 70; 6 150 70; -6 150 70; 0 150 70"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          />

          {/* Horizontal Balance Beam */}
          <rect x="30" y="64" width="240" height="12" rx="6" fill="url(#scalePurpleGrad)" filter="url(#scaleShadow)" />

          {/* Left Weight Pan: Citizen Evidence (Emerald) */}
          <g>
            <line x1="60" y1="74" x2="40" y2="150" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="3 3" />
            <line x1="60" y1="74" x2="80" y2="150" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M30 150 Q60 180 90 150 Z" fill="url(#scaleEmeraldGrad)" filter="url(#scaleShadow)" />
            <rect x="45" y="132" width="30" height="18" rx="4" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
            <text x="60" y="145" fill="#059669" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">RTI</text>
          </g>

          {/* Right Weight Pan: Objective Data (Gold) */}
          <g>
            <line x1="240" y1="74" x2="220" y2="150" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="3 3" />
            <line x1="240" y1="74" x2="260" y2="150" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M210 150 Q240 180 270 150 Z" fill="url(#scalePurpleGrad)" filter="url(#scaleShadow)" />
            <circle cx="240" cy="140" r="12" fill="url(#scaleGoldGrad)" />
            <text x="240" y="144" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">4P</text>
          </g>
        </g>

        {/* Floating "100% AUDITABLE" Seal Badge */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -8; 0 0"
            dur="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          />
          <rect x="185" y="20" width="105" height="30" rx="15" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" filter="url(#scaleShadow)" />
          <circle cx="200" cy="35" r="6" fill="#10B981" />
          <text x="246" y="39" fill="#4C1D95" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">100% AUDITABLE</text>
        </g>
      </svg>
    </div>
  );
}

// Verified Shield Motion Graphic
export function VerifiedShieldMotion({ className = "w-32 h-32" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="50" r="42" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="3" />
        <path d="M50 20 L75 32 V52 C75 68 50 82 50 82 C50 82 25 68 25 52 V32 Z" fill="#7C3AED" />
        <path d="M40 50 L47 57 L62 42" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Backward-compatible fallback player export
export function LottiePlayer({ className = "w-48 h-48" }) {
  return <CivicScaleMotion className={className} />;
}

export const civicScaleLottie = {};
export const verifiedShieldLottie = {};
export const rtiDocumentLottie = {};

export default CivicScaleMotion;
