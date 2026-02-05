import React from 'react';
import { Logo } from './Logo';

interface LoadingOverlayProps {
  message: string;
  elapsedSeconds: number;
}

export const LoadingOverlay = ({ message, elapsedSeconds }: LoadingOverlayProps) => (
  <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8">
    <div className="relative mb-12">
       <div className="w-28 h-28 md:w-32 md:h-32 border-8 border-neutral-100 rounded-full" />
       <div className="absolute inset-0 w-28 h-28 md:w-32 md:h-32 border-8 border-primary border-t-transparent rounded-full animate-spin" />
       <div className="absolute inset-0 flex items-center justify-center">
         <Logo compact />
       </div>
    </div>
    <div className="text-center max-w-sm">
      <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4 animate-pulse">{message}</h2>
      <p className="text-neutral-500 text-sm leading-relaxed mb-4">
        Wij combineren uw voorkeuren met onze expertise voor het perfecte voorstel.
      </p>
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-medium text-neutral-300">{elapsedSeconds}s</span>
      </div>
      {elapsedSeconds > 90 && (
        <p className="mt-4 text-xs font-medium text-warning">Dit duurt langer dan verwacht. Even geduld...</p>
      )}
    </div>
  </div>
);
