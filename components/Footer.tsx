import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-primary-dark text-white">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/10">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <ellipse cx="50" cy="62" rx="28" ry="14" fill="none" stroke="white" strokeWidth="4" />
                <path d="M28,62 Q28,45 38,40 Q42,38 50,38 Q58,38 62,40 Q72,45 72,62" fill="none" stroke="white" strokeWidth="4" />
                <path d="M22,62 L22,68 Q22,74 28,76 L72,76 Q78,74 78,68 L78,62" fill="none" stroke="white" strokeWidth="3.5" />
                <line x1="22" y1="62" x2="78" y2="62" stroke="white" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight uppercase">De Badkamer</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Uw partner voor hoogwaardige badkamerrenovaties in Nederland en Belgie. Wij verbinden u met de beste lokale vakmensen.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white/80">Navigatie</h4>
          <nav className="space-y-3">
            <Link to="/" className="block text-sm text-white/60 hover:text-white transition-colors">Home</Link>
            <Link to="/badkamer-renovatie-kosten" className="block text-sm text-white/60 hover:text-white transition-colors">Kosten Badkamer Renovatie</Link>
            <Link to="/planner" className="block text-sm text-white/60 hover:text-white transition-colors">AI Badkamer Planner</Link>
            <Link to="/advies" className="block text-sm text-white/60 hover:text-white transition-colors">Advies & Inspiratie</Link>
            <Link to="/offerte-aanvragen" className="block text-sm text-white/60 hover:text-white transition-colors">Gratis Offerte Aanvragen</Link>
          </nav>
        </div>

        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white/80">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Mail size={16} className="flex-shrink-0" />
              <span>info@debadkamer.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Phone size={16} className="flex-shrink-0" />
              <span>Neem contact op via e-mail</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <MapPin size={16} className="flex-shrink-0" />
              <span>Actief in Nederland & Belgie</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} DeBadkamer.com. Alle rechten voorbehouden.</p>
        <div className="flex gap-6 text-xs text-white/40">
          <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacyverklaring</Link>
          <Link to="/voorwaarden" className="hover:text-white/70 transition-colors">Voorwaarden</Link>
        </div>
      </div>
    </div>
  </footer>
);
