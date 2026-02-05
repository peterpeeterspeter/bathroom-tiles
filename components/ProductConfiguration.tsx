import React from 'react';
import { ArrowRight, ShoppingBag, Info } from 'lucide-react';
import { RenovationStyle } from '../types';
import { CatalogProduct } from '../services/productCatalog';
import { CategoryProductSelector } from './CategoryProductSelector';

const CATEGORIES: CatalogProduct['category'][] = ['Bathtub', 'Shower', 'Vanity', 'Toilet', 'Faucet', 'Lighting', 'Tile'];

const CATEGORY_LABELS: Record<string, string> = {
  Bathtub: 'Bad',
  Shower: 'Douche',
  Vanity: 'Wastafelmeubel',
  Toilet: 'Toilet',
  Faucet: 'Kraanwerk',
  Lighting: 'Verlichting',
  Tile: 'Tegels & Afwerking',
};

interface ProductConfigurationProps {
  selectedStyle: RenovationStyle;
  selectedProductIds: Record<string, string>;
  onProductSelect: (category: string, product: CatalogProduct) => void;
  onNext: () => void;
}

export const ProductConfiguration = ({ selectedStyle, selectedProductIds, onProductSelect, onNext }: ProductConfigurationProps) => (
  <div className="max-w-5xl mx-auto animate-fade-in">
    <div className="grid md:grid-cols-12 gap-8 md:gap-12">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-32 space-y-6 md:space-y-8">
          <div className="bg-black text-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-3 md:mb-4">Geselecteerde Mood</p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter leading-none mb-3 md:mb-4">{selectedStyle}</h3>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Verfijn nu uw keuzes binnen deze stijl voor een gepersonaliseerd resultaat.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full blur-[60px] opacity-20" />
          </div>
          <div className="bg-slate-100 p-5 md:p-6 rounded-2xl border-2 border-slate-200 hidden md:block">
            <h4 className="font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><Info size={14} className="text-accent" /> Waarom deze keuzes?</h4>
            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
              We tonen enkel producten die perfect aansluiten bij de gekozen mood. Zo bent u altijd zeker van een harmonieus design.
            </p>
          </div>
        </div>
      </div>
      <div className="md:col-span-8 space-y-8 md:space-y-12">
        {CATEGORIES.map((cat, i) => (
          <div key={cat} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-accent shadow-sm"><ShoppingBag size={18} /></div>
              <h4 className="font-black uppercase tracking-widest text-xs md:text-sm">{CATEGORY_LABELS[cat] || cat}</h4>
            </div>
            <CategoryProductSelector
              category={cat}
              mood={selectedStyle}
              selectedId={selectedProductIds[cat]}
              onSelect={(p) => onProductSelect(cat, p)}
            />
          </div>
        ))}

        <div className="bg-slate-50 border border-slate-200 p-4 md:p-6 rounded-xl flex gap-3 md:gap-4 items-start">
           <Info className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
           <div>
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Disclaimer</p>
             <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
               De getoonde productselecties dienen als inspiratierichting en vormen geen definitieve bestelling of garantie op levering van exacte modellen.
               Een definitieve technische configuratie volgt steeds na adviesgesprek.
             </p>
           </div>
        </div>

        <div className="pt-4 md:pt-8">
          <button onClick={onNext} className="w-full py-5 md:py-6 bg-black text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl">
            Volgende: Ruimte & Afmetingen <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    </div>
  </div>
);
