import React from 'react';
import { Check } from 'lucide-react';
import { DatabaseProduct, PRICE_TIER_LABELS, PRICE_TIER_COLORS } from '../types';
import { ScoredProduct, getProductCatalogImageUrl, getProductPriceDisplay } from '../lib/productService';

export const CategoryProductSelector = ({
  products,
  onSelect,
  selectedId,
}: {
  products: ScoredProduct[];
  onSelect: (p: DatabaseProduct) => void;
  selectedId?: string;
}) => {
  if (products.length === 0) {
    return (
         <div className="p-4 bg-surface rounded-xl text-center">
         <p className="text-[10px] uppercase font-bold text-neutral-500">No specific options for this style.</p>
       </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`relative flex flex-col items-center p-2 md:p-3 border-2 rounded-xl transition-all h-full ${
            selectedId === p.id ? 'border-primary bg-primary-light ring-4 ring-primary/10' : p.score > 0 ? 'border-neutral-300/30 hover:border-neutral-300 bg-white' : 'border-neutral-300/20 bg-surface opacity-60 hover:opacity-100 hover:border-neutral-300'
          }`}
        >
          {p.price_tier && (
            <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${PRICE_TIER_COLORS[p.price_tier]}`}>
              {PRICE_TIER_LABELS[p.price_tier]}
            </span>
          )}
          <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg bg-surface flex items-center justify-center">
            <img src={getProductCatalogImageUrl(p)} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
          </div>
          <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-tighter mb-1 leading-none w-full text-center">{p.brand}</p>
          <p className="text-[11px] font-semibold text-neutral-900 leading-tight h-8 overflow-hidden text-center w-full">{p.name}</p>
          <p className="text-[11px] font-bold text-primary mt-1">{getProductPriceDisplay(p)}</p>
          {selectedId === p.id && (
            <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
              <Check size={12} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
