import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Image as ImageIcon, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { analyzeBathroomInput, calculateRenovationCost, generateRenovationRender, generateEmptySpace } from '../services/geminiService';
import { ProjectSpec, Estimate, StyleProfile, BudgetTier, MaterialConfig, DatabaseProduct } from '../types';
import { Logo } from '../components/Logo';
import { StepIndicator } from '../components/StepIndicator';
import { StyleInspiration } from '../components/StyleInspiration';
import { ProductConfiguration } from '../components/ProductConfiguration';
import { DimensionsPhoto } from '../components/DimensionsPhoto';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import { ResultDisplay } from '../components/ResultDisplay';
import { LegalModal } from '../components/LegalModal';
import { submitLead } from '../lib/leadService';
import { trackEvent } from '../lib/analytics';
import { fetchAllActiveProducts } from '../lib/productService';
import { useSEO } from '../lib/useSEO';

const TIMEOUT_MS = 120_000;

const compressImage = (dataUrl: string, maxDimension: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        resolve(dataUrl);
        return;
      }
      const scale = maxDimension / Math.max(width, height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export default function PlannerPage() {
  useSEO({ title: 'AI Badkamer Planner - De Badkamer', description: 'Ontwerp uw droomkamer met onze AI-planner. Upload een foto, kies uw stijl, en ontvang direct een visualisatie met prijsindicatie.' });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
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
    trackEvent('planner_session_started');
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

  const handleStyleResolved = useCallback((profile: StyleProfile) => {
    setStyleProfile(profile);
    setStep(2);
    trackEvent('style_selected', { source: profile.source, tags: profile.tags.length, summary: profile.summary });
  }, []);

  const categoryToMaterialKey: Record<string, keyof MaterialConfig> = {
    Tile: 'floorTile',
    Faucet: 'faucetFinish',
    Toilet: 'toiletType',
    Shower: 'showerType',
    Vanity: 'vanityType',
    Lighting: 'lightingType',
    Bathtub: 'bathtubType',
  };

  const handleProductSelect = useCallback((category: string, product: DatabaseProduct) => {
    setSelectedProductIds(prev => ({ ...prev, [category]: product.id }));
    setSelectedProductNames(prev => ({ ...prev, [category]: product.name }));
    const key = categoryToMaterialKey[category];
    if (key) {
      setMaterialConfig(prev => ({ ...prev, [key]: product.name }));
    }
    trackEvent('product_selected', { category, productId: product.id, productName: product.name });
  }, []);

  const handleDimensionChange = useCallback((field: string, value: number) => {
    setProjectSpec(prev => ({ ...(prev || {} as ProjectSpec), [field]: value }));
  }, []);

  const startProcessing = async () => {
    if (!imagePreview || !styleProfile) return;
    setStep(4);
    setLoading(true);
    setError(null);
    abortRef.current = new AbortController();

    trackEvent('generation_started', { source: styleProfile.source });
    const startTime = Date.now();

    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();

      setLoadingMessage('Foto optimaliseren en analyseren...');
      const compressed = await compressImage(imagePreview, 1500);
      const mimeType = compressed.match(/^data:(.*);base64,/)?.[1] || 'image/jpeg';

      const [aiSpec, empty] = await Promise.all([
        analyzeBathroomInput(compressed.split(',')[1], mimeType),
        generateEmptySpace(compressed, { roomType: '', layoutShape: 'RECTANGLE', estimatedWidthMeters: 0, estimatedLengthMeters: 0, ceilingHeightMeters: 2.4, totalAreaM2: 0, existingFixtures: [], constraints: [] })
      ]);

      const userDims = projectSpec;
      const mergedSpec: ProjectSpec = {
        ...aiSpec,
        estimatedWidthMeters: userDims?.estimatedWidthMeters || aiSpec.estimatedWidthMeters,
        estimatedLengthMeters: userDims?.estimatedLengthMeters || aiSpec.estimatedLengthMeters,
        ceilingHeightMeters: userDims?.ceilingHeightMeters || aiSpec.ceilingHeightMeters,
        totalAreaM2: (userDims?.estimatedWidthMeters || aiSpec.estimatedWidthMeters) * (userDims?.estimatedLengthMeters || aiSpec.estimatedLengthMeters),
      };
      setProjectSpec(mergedSpec);

      if (abortRef.current?.signal.aborted) throw new Error('timeout');

      setLoadingMessage('Uw nieuwe badkamer renderen...');
      const products = await fetchAllActiveProducts();
      const [est, url] = await Promise.all([
        calculateRenovationCost(mergedSpec, BudgetTier.STANDARD, styleProfile, materialConfig, products),
        generateRenovationRender(mergedSpec, styleProfile, materialConfig, empty, products)
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
      styleProfile: styleProfile!,
      materialConfig,
      selectedProducts: selectedProductIds,
      estimatedTotalLow: totalLow,
      estimatedTotalHigh: totalHigh,
      roomWidth: spec?.estimatedWidthMeters || 0,
      roomLength: spec?.estimatedLengthMeters || 0,
      roomArea: spec?.totalAreaM2 || 0,
      source: 'planner',
    });

    trackEvent('lead_submitted', {
      source: styleProfile?.source,
      totalLow,
      totalHigh,
      postcode: data.postcode,
    });

    setLeadSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setStyleProfile(null);
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
    <>
      <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
        <header className="bg-white border-b border-neutral-300/30 sticky top-0 z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <Logo />
          <div className="flex items-center gap-4">
            {step > 1 && step < 4 && (
              <button onClick={reset} className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-all flex items-center gap-2">
                <RefreshCw size={14} /> <span className="hidden sm:inline">Terug naar start</span>
              </button>
            )}
            <Link
              to="/"
              className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-all"
            >
              Terug naar site
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {step < 5 && <StepIndicator currentStep={step} />}

          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-error p-4 md:p-6 rounded-xl animate-fade-in flex items-start gap-3 md:gap-4">
              <AlertCircle className="text-error flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-error text-sm mb-1">Er ging iets fout</p>
                <p className="text-red-700 text-xs">{error}</p>
                <button onClick={reset} className="mt-4 text-xs font-bold text-error underline">Probeer het opnieuw</button>
              </div>
            </div>
          )}

          {step === 1 && <StyleInspiration onStyleResolved={handleStyleResolved} />}

          {step === 2 && styleProfile && (
            <ProductConfiguration
              styleProfile={styleProfile}
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
                <div className="space-y-12 md:space-y-16">
                  <div className="text-center max-w-2xl mx-auto">
                    <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-3 md:mb-4">Uw resultaat</p>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-4 md:mb-6">Uw Nieuwe <span className="text-primary">Badkamer</span>.</h2>
                    <p className="text-neutral-500 text-sm md:text-base leading-relaxed">Op basis van uw stijlprofiel hebben we deze visualisatie samengesteld.</p>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ImageIcon size={18} /></div>
                      <h3 className="font-bold uppercase tracking-widest text-sm text-neutral-500">Interactieve Visualisatie</h3>
                    </div>
                    <div className="relative">
                      <BeforeAfterSlider before={imagePreview!} after={renderUrl} />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-10" />
                    </div>
                    <div className="bg-surface p-6 md:p-8 rounded-2xl border border-neutral-300/30">
                      <h4 className="font-bold uppercase text-xs tracking-widest mb-3 md:mb-4 flex items-center gap-2 text-neutral-500"><Info size={16} /> Juridische Kadering</h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">Deze visualisatie is een AI-generatie op basis van de ingevoerde data en dient puur ter inspiratie. Afmetingen en productdetails kunnen in de realiteit afwijken. Een definitieve opname ter plaatse is noodzakelijk.</p>
                    </div>
                  </div>

                  <LeadCaptureForm onSubmit={handleLeadSubmit} />
                </div>
              ) : (
                <ResultDisplay
                  name={leadName}
                  styleProfile={styleProfile!}
                  estimate={estimate}
                  renderUrl={renderUrl}
                  imagePreview={imagePreview!}
                  choices={choices}
                />
              )}
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-neutral-300/30 py-12 md:py-20 mt-16 md:mt-32">
          <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
            <div className="flex justify-center mb-6 md:mb-8 opacity-40 hover:opacity-100 transition-opacity">
              <Logo />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xl mx-auto mb-8 md:mb-12">
              De Badkamer is uw partner voor hoogwaardige badkamerrenovaties. Onze digitale tool is de eerste stap naar uw droomruimte.
            </p>
            <div className="flex justify-center gap-6 md:gap-12 text-xs font-semibold text-neutral-300">
              <button onClick={() => openLegal('privacy', 'Privacyverklaring')} className="hover:text-neutral-900 transition-colors">Privacy</button>
              <button onClick={() => openLegal('terms', 'Gebruiksvoorwaarden')} className="hover:text-neutral-900 transition-colors">Voorwaarden</button>
              <button onClick={() => openLegal('cookies', 'Cookiebeleid')} className="hover:text-neutral-900 transition-colors">Cookies</button>
            </div>
            <p className="mt-10 md:mt-16 text-xs text-neutral-300">&copy; {new Date().getFullYear()} DeBadkamer.com. Alle rechten voorbehouden.</p>
          </div>
        </footer>

        <LegalModal
          isOpen={legalModal.open}
          onClose={() => setLegalModal(prev => ({ ...prev, open: false }))}
          title={legalModal.title}
          type={legalModal.type}
        />
      </div>
    </>
  );
}
