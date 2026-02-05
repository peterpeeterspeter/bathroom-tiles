import React from 'react';
import { RenovationStyle } from '../types';

const moods = [
  { type: RenovationStyle.MODERN, label: 'Modern Minimalistisch', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=400', desc: 'Sluier, wit en rust.' },
  { type: RenovationStyle.INDUSTRIAL, label: 'Industriele Chic', img: 'https://images.unsplash.com/photo-1507652313519-d451e12d59b8?auto=format&fit=crop&q=80&w=400', desc: 'Beton, metaal en rauw.' },
  { type: RenovationStyle.SCANDINAVIAN, label: 'Scandinavische Hygge', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', desc: 'Licht hout en zachtheid.' },
  { type: RenovationStyle.LUXURY, label: 'Hotel Luxe', img: 'https://images.unsplash.com/photo-1600566752355-397921139bd1?auto=format&fit=crop&q=80&w=400', desc: 'Marmer en goud.' },
  { type: RenovationStyle.CLASSIC, label: 'Modern Klassiek', img: 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&q=80&w=400', desc: 'Tijdloze elegantie.' }
];

interface MoodSelectionProps {
  onSelect: (style: RenovationStyle) => void;
}

export const MoodSelection = ({ onSelect }: MoodSelectionProps) => (
  <div className="animate-fade-in">
    <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
      <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">Kies uw gewenste <span className="text-accent italic">mood</span>.</h2>
      <p className="text-slate-500 font-bold text-base md:text-lg">De basis van uw nieuwe badkamer begint bij de juiste sfeer.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
      {moods.map(m => (
        <button
          key={m.type}
          onClick={() => onSelect(m.type)}
          className="group relative h-60 md:h-96 overflow-hidden rounded-2xl md:rounded-3xl border-2 md:border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          <img src={m.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={m.label} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <p className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1 md:mb-2">Style</p>
            <h3 className="text-sm md:text-xl font-black text-white leading-tight uppercase mb-1 md:mb-2">{m.label}</h3>
            <p className="text-white/60 text-[10px] md:text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-100 hidden md:block">{m.desc}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);
