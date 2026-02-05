import React from 'react';

export const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 rounded-full border-[2.5px] border-black flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-6 h-6">
        <path d="M30,80 L30,55 L50,40 L70,55 L70,80" fill="none" stroke="black" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="55" x2="55" y2="25" stroke="#f4743b" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-3xl font-bold tracking-tighter text-black lowercase">renisol</span>
      <span className="text-[9px] font-bold tracking-[0.45em] text-black uppercase -mt-0.5 opacity-80">bouwgroep</span>
    </div>
  </div>
);
