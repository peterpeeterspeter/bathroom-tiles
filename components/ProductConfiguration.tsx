import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Info, Loader2 } from 'lucide-react';
import { StyleProfile, DatabaseProduct } from '../types';
import { ScoredProduct, fetchProductsForProfile, getProductsByCategory } from '../lib/productService';
import { CategoryProductSelector } from './CategoryProductSelector';

const CATEGORIES: DatabaseProduct['category'][] = ['Bathtub', 'Shower', 'Vanity', 'Toilet', 'Faucet', 'Lighting', 'Tile'];

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
  styleProfile: StyleProfile;
  selectedProductIds: Record<string, string>;
  onProductSelect: (category: string, product: DatabaseProduct) => void;
  onNext: () => void;
}

export const ProductConfiguration = ({ styleProfile, selectedProductIds, onProductSelect, onNext }: ProductConfigurationProps) => {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ScoredProduct[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsForProfile(styleProfile).then(scored => {
      setProductsByCategory(getProductsByCategory(scored));
      setLoading(false);
    });
  }, [styleProfile]);

  const styleName = styleProfile.presetName || styleProfile.summary.slice(0, 40);
  const topTags = styleProfile.tags.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32 space-y-6 md:space-y-8">
            <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3 md:mb-4">Stijlprofiel</p>
                <h3 className="text-xl md:text-2xl font-black tracking-tighter leading-none mb-3 md:mb-4">{styleName}</h3>
                <p className="text-white/60 text-[11px] font-bold leading-relaxed mb-4">{styleProfile.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {topTags.map(t => (
                    <span key={t.tag} className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold text-white/70 uppercase tracking-wider">
                      {t.tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary rounded-full blur-[60px] opacity-20" />
            </div>
            <div className="bg-surface p-5 md:p-6 rounded-2xl border-2 border-neutral-300/50 hidden md:block">
              <h4 className="font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><Info size={14} className="text-primary" /> Waarom deze keuzes?</h4>
              <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">
                Producten worden gerangschikt op basis van uw stijlprofiel. De best passende producten staan bovenaan.
              </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-8 space-y-8 md:space-y-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-neutral-500" size={32} />
            </div>
          ) : (
            CATEGORIES.map((cat, i) => (
              <div key={cat} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white border-2 border-neutral-300/30 flex items-center justify-center text-primary shadow-sm"><ShoppingBag size={18} /></div>
                  <h4 className="font-black uppercase tracking-widest text-xs md:text-sm">{CATEGORY_LABELS[cat] || cat}</h4>
                </div>
                <CategoryProductSelector
                  products={productsByCategory[cat] || []}
                  selectedId={selectedProductIds[cat]}
                  onSelect={(p) => onProductSelect(cat, p)}
                />
              </div>
            ))
          )}

          <div className="bg-surface border border-neutral-300/50 p-4 md:p-6 rounded-xl flex gap-3 md:gap-4 items-start">
             <Info className="text-neutral-500 flex-shrink-0 mt-0.5" size={16} />
             <div>
               <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Disclaimer</p>
               <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed">
                 De getoonde productselecties dienen als inspiratierichting en vormen geen definitieve bestelling of garantie op levering van exacte modellen.
                 Een definitieve technische configuratie volgt steeds na adviesgesprek.
               </p>
             </div>
          </div>

          <div className="pt-4 md:pt-8">
            <button onClick={onNext} className="w-full py-5 md:py-6 bg-neutral-900 text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-2xl">
              Volgende: Ruimte & Afmetingen <ArrowRight size={20}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
