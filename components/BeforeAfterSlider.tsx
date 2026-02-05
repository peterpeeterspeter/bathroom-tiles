import React, { useState, useRef } from 'react';

export const BeforeAfterSlider = ({ before, after }: { before: string; after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) updatePosition(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl cursor-ew-resize select-none shadow-2xl group"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={before} className="absolute inset-0 w-full h-full object-cover max-w-none" alt="Before" style={{ width: containerRef.current?.offsetWidth }} />
      </div>
      <div className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-accent">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-accent rounded-full"></div>
            <div className="w-1 h-4 bg-accent rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black/60 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest pointer-events-none transition-opacity group-hover:opacity-100 opacity-80">Voor</div>
      <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-accent/90 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest pointer-events-none transition-opacity group-hover:opacity-100 opacity-80">Na</div>
    </div>
  );
};
