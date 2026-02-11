import React, { useState, useCallback, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface RenderGridProps {
  renderUrl: string;
  beforeUrl?: string;
}

const QUADRANTS = [
  { label: 'Variant A', x: 0, y: 0 },
  { label: 'Variant B', x: 50, y: 0 },
  { label: 'Variant C', x: 0, y: 50 },
  { label: 'Variant D', x: 50, y: 50 },
];

export const RenderGrid = ({ renderUrl, beforeUrl }: RenderGridProps) => {
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);
  const [showBefore, setShowBefore] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeQuadrant === null) return;
    if (e.key === 'Escape') {
      setActiveQuadrant(null);
      setShowBefore(false);
    }
    if (e.key === 'ArrowRight') {
      setActiveQuadrant(prev => prev !== null ? (prev + 1) % 4 : 0);
      setShowBefore(false);
    }
    if (e.key === 'ArrowLeft') {
      setActiveQuadrant(prev => prev !== null ? (prev - 1 + 4) % 4 : 0);
      setShowBefore(false);
    }
  }, [activeQuadrant]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (activeQuadrant !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeQuadrant]);

  return (
    <>
      <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden shadow-2xl bg-white">
        {QUADRANTS.map((q, i) => (
          <button
            key={i}
            onClick={() => { setActiveQuadrant(i); setShowBefore(false); }}
            className="relative aspect-square overflow-hidden group cursor-pointer focus:outline-none"
          >
            <div
              className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `url(${renderUrl})`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${q.x}% ${q.y}%`,
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {q.label}
            </div>
            <div className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn size={14} className="text-neutral-700" />
            </div>
          </button>
        ))}
      </div>

      {activeQuadrant !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
          onClick={() => { setActiveQuadrant(null); setShowBefore(false); }}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            {beforeUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowBefore(!showBefore); }}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${showBefore ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {showBefore ? 'Na' : 'Voor'}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveQuadrant(null); setShowBefore(false); }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {QUADRANTS.map((q, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveQuadrant(i); setShowBefore(false); }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${i === activeQuadrant ? 'bg-primary text-white' : 'bg-white/20 text-white/70 hover:bg-white/30 hover:text-white'}`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div
            className="relative w-[90vw] h-[80vh] max-w-[1200px]"
            onClick={(e) => e.stopPropagation()}
          >
            {showBefore && beforeUrl ? (
              <img
                src={beforeUrl}
                alt="Originele badkamer"
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${renderUrl})`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: `${QUADRANTS[activeQuadrant].x}% ${QUADRANTS[activeQuadrant].y}%`,
                }}
              />
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] uppercase tracking-widest">
            ← → navigeren &bull; ESC sluiten
          </div>
        </div>
      )}
    </>
  );
};
