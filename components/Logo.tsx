import React from 'react';

export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full border-[2px] border-[#0c2d48] flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#e8f4f8] to-white">
      <svg viewBox="0 0 100 100" className="w-6 h-6 md:w-7 md:h-7">
        <ellipse cx="50" cy="62" rx="28" ry="14" fill="none" stroke="#0c2d48" strokeWidth="4" />
        <path d="M28,62 Q28,45 38,40 Q42,38 50,38 Q58,38 62,40 Q72,45 72,62" fill="none" stroke="#0c2d48" strokeWidth="4" />
        <path d="M22,62 L22,68 Q22,74 28,76 L72,76 Q78,74 78,68 L78,62" fill="none" stroke="#0c2d48" strokeWidth="3.5" />
        <line x1="22" y1="62" x2="78" y2="62" stroke="#0c2d48" strokeWidth="3" />
        <path d="M65,38 L65,22 Q65,18 70,18 L72,18" fill="none" stroke="#0c2d48" strokeWidth="3" strokeLinecap="round" />
        <circle cx="72" cy="15" r="5" fill="none" stroke="#0c2d48" strokeWidth="2.5" />
        <line x1="68" y1="28" x2="76" y2="32" stroke="#5bbfbf" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="70" y1="30" x2="74" y2="36" stroke="#5bbfbf" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-lg md:text-xl font-black tracking-tight text-[#0c2d48] uppercase">De Badkamer</span>
      <span className="text-[7px] md:text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase -mt-0.5">Vakmanschap in Renovatie</span>
    </div>
  </div>
);
