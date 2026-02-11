import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/badkamer-renovatie-kosten', label: 'Kosten' },
  { to: '/planner', label: 'AI Planner' },
  { to: '/badkamer-inspiratie', label: 'Inspiratie' },
  { to: '/voor-vakmensen', label: 'Voor Vakmensen' },
];

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-neutral-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/offerte-aanvragen"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-accent/25"
          >
            Gratis Offerte <ArrowRight size={16} />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-300/30 animate-slide-down">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary-light text-primary'
                    : 'text-neutral-700 hover:bg-surface'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Link
                to="/offerte-aanvragen"
                className="flex items-center justify-center gap-2 bg-accent text-white font-bold text-sm px-6 py-3 rounded-full w-full"
              >
                Gratis Offerte <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
