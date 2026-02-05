import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { analyzeBathroomInput, calculateRenovationCost, generateRenovationRender, generateEmptySpace } from './services/geminiService';
import { ProjectSpec, Estimate, RenovationStyle, BudgetTier, MaterialConfig } from './types';
import { CatalogProduct } from './services/productCatalog';
import { Logo } from './components/Logo';
import { StepIndicator } from './components/StepIndicator';
import { MoodSelection } from './components/MoodSelection';
import { ProductConfiguration } from './components/ProductConfiguration';
import { DimensionsPhoto } from './components/DimensionsPhoto';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LegalModal } from './components/LegalModal';
import { submitLead } from './lib/leadService';
import { trackEvent } from './lib/analytics';

const TIMEOUT_MS = 120_000;

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<RenovationStyle | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});
  const [selectedProductNames, setSelectedProductNames] = useState<Record<string, string>>({});
  const [materialConfig, setMaterialConfig] = useState<MaterialConfig>({
    floorTile: 'AI_MATCH', wallTile: 'AI_MATCH', vanityType: 'AI_MATCH', faucetFinish: 'AI_MATCH', toiletType: 'AI_MATCH', lightingType: 'AI_MATCH', bathtubType: 'AI_MATCH', showerType: 'AI_MATCH'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [projectSpec, setProjectSpec] = useState<ProjectSpec | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ open: boolean; type: 'privacy' | 'terms' | 'cookies'; title: string }>({ open: false, type: 'privacy', title: '' });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    trackEvent('session_started');
  }, []);

  useEffect(() => {
    if (loading) {
      setElapsedSeconds(0);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        setElapsedSeconds(elapsed);
        if (elapsed * 1000 >= TIMEOUT_MS) {
          abortRef.current?.abort();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  const handleMoodSelect = useCallback((style: RenovationStyle) => {
    setSelectedStyle(style);
    setStep(2);
    trackEvent('style_selected', { style });
  }, []);

  const handleProductSelect = useCallback((category: string, product: CatalogProduct) => {
    setSelectedProductIds(prev => ({ ...prev, [category]: product.id }));
    setSelectedProductNames(prev => ({ ...prev, [category]: product.name }));
    setMaterialConfig(prev => ({
      ...prev,
      [category === 'Tile' ? 'floorTile' : `${category.toLowerCase()}Type`]: product.name
    }));
    trackEvent('product_selected', { category, productId: product.id, productName: product.name });
  }, []);

  const handleDimensionChange = useCallback((field: string, value: number) => {
    setProjectSpec(prev => ({ ...(prev || {} as ProjectSpec), [field]: value }));
  }, []);

  const startProcessing = async () => {
    if (!imagePreview || !selectedStyle) return;
    setStep(4);
    setLoading(true);
    setError(null);
    abortRef.current = new AbortController();

    trackEvent('generation_started', { style: selectedStyle });
    const startTime = Date.now();

    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();

      setLoadingMessage('Ruimte layout analyseren...');
      const mimeType = imagePreview.match(/^data:(.*);base64,/)?.[1] || 'image/jpeg';
      const spec = await analyzeBathroomInput(imagePreview.split(',')[1], mimeType);
      setProjectSpec(spec);

      if (abortRef.current?.signal.aborted) throw new Error('timeout');

      setLoadingMessage('Sloopwerkzaamheden simuleren...');
      const empty = await generateEmptySpace(imagePreview, spec);

      if (abortRef.current?.signal.aborted) throw new Error('timeout');

      setLoadingMessage('Uw nieuwe badkamer renderen...');
      const [est, url] = await Promise.all([
        calculateRenovationCost(spec, BudgetTier.STANDARD, selectedStyle, materialConfig),
        generateRenovationRender(spec, selectedStyle, materialConfig, empty)
      ]);

      setEstimate(est);
      setRenderUrl(url);

      const duration = Math.floor((Date.now() - startTime) / 1000);
      trackEvent('generation_completed', { durationSeconds: duration, total: est.grandTotal });
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'timeout' || abortRef.current?.signal.aborted) {
        setError('De generatie duurde te lang. Probeer het opnieuw met een andere foto of kleinere afbeelding.');
        trackEvent('generation_timeout');
      } else {
        setError('Er is iets misgegaan bij het genereren van uw voorstel.');
        trackEvent('generation_error', { error: String(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (data: { name: string; email: string; phone: string; postcode: string }) => {
    setLeadName(data.name);

    const spec = projectSpec;
    const totalLow = Math.round((estimate?.grandTotal || 0) * 0.85);
    const totalHigh = Math.round((estimate?.grandTotal || 0) * 1.15);

    await submitLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      postcode: data.postcode,
      selectedStyle: selectedStyle!,
      materialConfig,
      selectedProducts: selectedProductIds,
      estimatedTotalLow: totalLow,
      estimatedTotalHigh: totalHigh,
      roomWidth: spec?.estimatedWidthMeters || 0,
      roomLength: spec?.estimatedLengthMeters || 0,
      roomArea: spec?.totalAreaM2 || 0,
    });

    trackEvent('lead_submitted', {
      style: selectedStyle,
      totalLow,
      totalHigh,
      postcode: data.postcode,
    });

    setLeadSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setSelectedStyle(null);
    setSelectedProductIds({});
    setSelectedProductNames({});
    setImagePreview(null);
    setProjectSpec(null);
    setEstimate(null);
    setRenderUrl(null);
    setLeadSubmitted(false);
    setLeadName('');
    setError(null);
    trackEvent('session_reset');
  };

  const choices = Object.entries(selectedProductNames).map(([category, product]) => ({ category, product: String(product) }));

  const openLegal = (type: 'privacy' | 'terms' | 'cookies', title: string) => {
    setLegalModal({ open: true, type, title });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-accent selection:text-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <Logo />
        {step > 1 && step < 4 && (
          <button onClick={reset} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all flex items-center gap-2">
            <RefreshCw size={14} /> <span className="hidden sm:inline">Terug naar start</span>
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {step < 5 && <StepIndicator currentStep={step} />}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 md:p-6 rounded-xl animate-fade-in flex items-start gap-3 md:gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-black uppercase tracking-tight text-red-900 text-sm mb-1">Er ging iets fout</p>
              <p className="text-red-700 text-xs font-bold">{error}</p>
              <button onClick={reset} className="mt-4 text-[10px] font-black uppercase text-red-900 underline">Probeer het opnieuw</button>
            </div>
          </div>
        )}

        {step === 1 && <MoodSelection onSelect={handleMoodSelect} />}

        {step === 2 && selectedStyle && (
          <ProductConfiguration
            selectedStyle={selectedStyle}
            selectedProductIds={selectedProductIds}
            onProductSelect={handleProductSelect}
            onNext={() => { setStep(3); trackEvent('products_configured', { products: selectedProductIds }); }}
          />
        )}

        {step === 3 && (
          <DimensionsPhoto
            imagePreview={imagePreview}
            onImageChange={(url) => { setImagePreview(url); trackEvent('photo_uploaded'); }}
            onDimensionChange={handleDimensionChange}
            onSubmit={() => { startProcessing(); trackEvent('dimensions_submitted'); }}
          />
        )}

        {loading && <LoadingOverlay message={loadingMessage} elapsedSeconds={elapsedSeconds} />}

        {step === 4 && !loading && !error && estimate && renderUrl && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            {!leadSubmitted ? (
              <LeadCaptureForm onSubmit={handleLeadSubmit} />
            ) : (
              <ResultDisplay
                name={leadName}
                selectedStyle={selectedStyle!}
                estimate={estimate}
                renderUrl={renderUrl}
                imagePreview={imagePreview!}
                choices={choices}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 md:py-20 mt-16 md:mt-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
           <div className="flex justify-center mb-6 md:mb-8 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
             <Logo />
           </div>
           <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed max-w-xl mx-auto uppercase tracking-widest mb-8 md:mb-12">
             Renisol Bouwgroep is uw partner voor hoogwaardige badkamerrenovaties. Onze digitale tool is de eerste stap naar uw droomruimte.
           </p>
           <div className="flex justify-center gap-6 md:gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
             <button onClick={() => openLegal('privacy', 'Privacyverklaring')} className="hover:text-black transition-colors">Privacy</button>
             <button onClick={() => openLegal('terms', 'Gebruiksvoorwaarden')} className="hover:text-black transition-colors">Voorwaarden</button>
             <button onClick={() => openLegal('cookies', 'Cookiebeleid')} className="hover:text-black transition-colors">Cookies</button>
           </div>
           <p className="mt-10 md:mt-16 text-[10px] font-black text-slate-200 uppercase tracking-widest">&copy; {new Date().getFullYear()} Renisol Bouwgroep Systems BV.</p>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModal.open}
        onClose={() => setLegalModal(prev => ({ ...prev, open: false }))}
        title={legalModal.title}
        type={legalModal.type}
      />

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
