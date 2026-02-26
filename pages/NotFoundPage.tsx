import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

export default function NotFoundPage() {
  useSEO({ title: 'Pagina niet gevonden - De Badkamer' });

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 md:py-32 text-center">
      <p className="text-8xl font-black text-primary/20 mb-6">404</p>
      <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-4">Pagina niet gevonden</h1>
      <p className="text-neutral-500 mb-10">De pagina die u zoekt bestaat niet of is verplaatst.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full transition-all"
        >
          <Home size={18} /> Naar Home
        </Link>
        <Link
          to="/get-quote"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-full transition-all"
        >
          Gratis Offerte <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
