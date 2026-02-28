import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Info, Loader2, Eye, Lightbulb, Layout, CheckCircle2, Gauge, Bookmark, Wrench, Layers } from 'lucide-react';
import { StyleProfile, DatabaseProduct, ProductAction, ProductCategory } from '../types';
import {
  ScoredProduct,
  fetchProductsForProfile,
  getProductsByApplication,
  getWallMaterialGroups,
  getFloorMaterialGroups,
  filterWallProductsByMaterial,
  filterFloorProductsByMaterial,
} from '../lib/productService';
import { CategoryProductSelector } from './CategoryProductSelector';


interface ProductConfigurationProps {
  styleProfile: StyleProfile;
  selectedProductIds: Record<string, string>;
  productActions: Record<string, ProductAction>;
  onProductSelect: (category: string, product: DatabaseProduct) => void;
  onActionChange: (category: string, action: ProductAction) => void;
  onNext: () => void;
}

export const ProductConfiguration = ({ styleProfile, selectedProductIds, productActions, onProductSelect, onActionChange, onNext }: ProductConfigurationProps) => {
  const [scoredProducts, setScoredProducts] = useState<ScoredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallMaterial, setWallMaterial] = useState<string>('all');
  const [floorMaterial, setFloorMaterial] = useState<string>('all');

  useEffect(() => {
    fetchProductsForProfile(styleProfile).then((scored) => {
      setScoredProducts(scored);
      setLoading(false);
    });
  }, [styleProfile]);

  const { wall: wallProducts, floor: floorProducts } = getProductsByApplication(scoredProducts);
  const wallMaterialGroups = getWallMaterialGroups(wallProducts);
  const floorMaterialGroups = getFloorMaterialGroups(floorProducts);
  const filteredWallProducts = filterWallProductsByMaterial(wallProducts, wallMaterial);
  const filteredFloorProducts = filterFloorProductsByMaterial(floorProducts, floorMaterial);

  const styleName = styleProfile.presetName || styleProfile.summary.slice(0, 40);
  const topTags = styleProfile.tags.slice(0, 6);
  const expert = styleProfile.expertAnalysis;

  const renderSection = (
    sectionKey: 'wall' | 'floor',
    title: string,
    category: ProductCategory,
    subsections: { key: string; label: string; products: ScoredProduct[]; disabled?: boolean }[]
  ) => (
    <div key={sectionKey} className="space-y-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white border-2 border-neutral-300/30 flex items-center justify-center text-primary shadow-sm">
          <Layers size={18} />
        </div>
        <h4 className="font-black uppercase tracking-widest text-xs md:text-sm">{title}</h4>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onActionChange(category, 'replace')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
            (productActions[category] || 'replace') === 'replace'
              ? 'bg-neutral-900 text-white'
              : 'bg-surface border border-neutral-300/50 text-neutral-500 hover:border-neutral-400'
          }`}
        >
          Replace
        </button>
        <button
          onClick={() => onActionChange(category, 'keep')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
            (productActions[category] || 'replace') === 'keep'
              ? 'bg-neutral-900 text-white'
              : 'bg-surface border border-neutral-300/50 text-neutral-500 hover:border-neutral-400'
          }`}
        >
          Keep
        </button>
      </div>

      {(productActions[category] || 'replace') === 'keep' ? (
        <div className="bg-surface border border-neutral-300/30 rounded-xl p-4 text-center">
          <p className="text-[11px] font-bold text-neutral-500">
            Existing {title.toLowerCase()} will be kept as shown in your photo.
          </p>
        </div>
      ) : (
        subsections.map(({ key, label, products, disabled }) =>
          disabled ? (
            <div
              key={key}
              className="bg-surface border border-neutral-300/30 rounded-xl p-4 md:p-6 text-center border-dashed"
            >
              <p className="text-[11px] font-bold text-neutral-500">{label}</p>
              <p className="text-[10px] text-neutral-400 mt-1">Coming soon</p>
            </div>
          ) : (
            <div key={key}>
              {sectionKey === 'wall' && key === 'tiles' && wallMaterialGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {[{ key: 'all', label: 'All materials' }, ...wallMaterialGroups].map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setWallMaterial(g.key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        wallMaterial === g.key
                          ? 'bg-neutral-900 text-white'
                          : 'bg-surface border border-neutral-300/50 text-neutral-500 hover:border-neutral-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
              {sectionKey === 'floor' && key === 'tiles' && floorMaterialGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {[{ key: 'all', label: 'All materials' }, ...floorMaterialGroups].map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setFloorMaterial(g.key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        floorMaterial === g.key
                          ? 'bg-neutral-900 text-white'
                          : 'bg-surface border border-neutral-300/50 text-neutral-500 hover:border-neutral-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
              <CategoryProductSelector
                products={products}
                selectedId={selectedProductIds[category]}
                onSelect={(p) => onProductSelect(category, p)}
              />
            </div>
          )
        )
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32 space-y-6 md:space-y-8">
            <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3 md:mb-4">Expert Advice</p>
                <h3 className="text-xl md:text-2xl font-black tracking-tighter leading-none mb-3 md:mb-4">{styleName}</h3>
                <p className="text-white/60 text-[11px] font-bold leading-relaxed mb-4">{styleProfile.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {topTags.map((t) => (
                    <span
                      key={t.tag}
                      className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold text-white/70 uppercase tracking-wider"
                    >
                      {t.tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary rounded-full blur-[60px] opacity-20" />
            </div>

            {expert && (
              <>
                <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-neutral-300/30 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2 text-neutral-500">
                      <Eye size={14} className="text-primary" /> Current State
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <Gauge
                        size={12}
                        className={
                          expert.conditionScore <= 4
                            ? 'text-red-500'
                            : expert.conditionScore <= 6
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                        }
                      />
                      <span
                        className={`text-[10px] font-black ${expert.conditionScore <= 4 ? 'text-red-500' : expert.conditionScore <= 6 ? 'text-amber-500' : 'text-emerald-500'}`}
                      >
                        {expert.conditionScore}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">{expert.currentState}</p>
                </div>

                {expert.keepElements.length > 0 && (
                  <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-neutral-300/30 shadow-sm">
                    <h4 className="font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2 text-neutral-500">
                      <Bookmark size={14} className="text-primary" /> Keep
                    </h4>
                    <ul className="space-y-1.5">
                      {expert.keepElements.map((el, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] font-bold text-neutral-700 leading-relaxed">{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-neutral-300/30 shadow-sm">
                  <h4 className="font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2 text-neutral-500">
                    <Lightbulb size={14} className="text-primary" /> Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {expert.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] font-bold text-neutral-700 leading-relaxed">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-neutral-300/30 shadow-sm">
                  <h4 className="font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2 text-neutral-500">
                    <Layout size={14} className="text-primary" /> Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {expert.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] font-bold text-neutral-700 leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {expert.layoutAdvice && (
                  <div className="bg-primary/5 p-5 md:p-6 rounded-2xl border-2 border-primary/20">
                    <h4 className="font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2 text-primary">
                      <Layout size={14} /> Layout Advice
                    </h4>
                    <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">{expert.layoutAdvice}</p>
                  </div>
                )}

                <div className="bg-neutral-900 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Complexity</span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      expert.estimatedComplexity === 'simple'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : expert.estimatedComplexity === 'moderate'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {expert.estimatedComplexity}
                  </span>
                </div>
              </>
            )}

            {!expert && (
              <div className="bg-surface p-5 md:p-6 rounded-2xl border-2 border-neutral-300/50 hidden md:block">
                <h4 className="font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} className="text-primary" /> Why these choices?
                </h4>
                <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">
                  Products are ranked based on your style profile. The best matches appear at the top.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-8 space-y-8 md:space-y-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-neutral-500" size={32} />
            </div>
          ) : (
            <>
              {/* Wall Section */}
              <div className="animate-slide-up">
                {renderSection('wall', 'Wall', 'WallTile', [
                  { key: 'tiles', label: 'Wall Tiles', products: filteredWallProducts },
                  { key: 'microcement', label: 'Microcement wall finish / Tadelakt-style', products: [], disabled: true },
                  { key: 'pvc', label: 'PVC / Waterproof Panels', products: [], disabled: true },
                ])}
              </div>

              {/* Floor Section */}
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                {renderSection('floor', 'Floor', 'FloorTile', [{ key: 'tiles', label: 'Floor Tiles', products: filteredFloorProducts }])}
              </div>
            </>
          )}

          <div className="bg-surface border border-neutral-300/50 p-4 md:p-6 rounded-xl flex gap-3 md:gap-4 items-start">
            <Info className="text-neutral-500 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Disclaimer</p>
              <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed">
                The product selections shown are for inspiration only and do not constitute a definite order or
                guarantee delivery of exact models. Final configuration follows after a consultation.
              </p>
            </div>
          </div>

          <div className="pt-4 md:pt-8">
            <button
              onClick={onNext}
              className="w-full py-5 md:py-6 bg-neutral-900 text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              Generate My Result <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
