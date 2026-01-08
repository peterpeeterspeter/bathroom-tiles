import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  ArrowRight, 
  CheckCircle, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Palette,
  ShoppingBag,
  Ruler,
  Plus,
  Eraser,
  Grid,
  MapPin,
  Check,
  Smartphone,
  Mail,
  User,
  Download,
  Info,
  DollarSign
} from 'lucide-react';
import { analyzeBathroomInput, calculateRenovationCost, generateRenovationRender, generateEmptySpace } from './services/geminiService';
import { ProjectSpec, Estimate, RenovationStyle, BudgetTier, FixtureType, MaterialConfig } from './types';
import { PRODUCT_CATALOG, CatalogProduct } from './services/productCatalog';

// --- Subcomponents ---

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 rounded-full border-[2.5px] border-black flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-6 h-6">
        <path d="M30,80 L30,55 L50,40 L70,55 L70,80" fill="none" stroke="black" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="55" x2="55" y2="25" stroke="#f4743b" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-3xl font-bold tracking-tighter text-black lowercase">renisol</span>
      <span className="text-[9px] font-bold tracking-[0.45em] text-black uppercase -mt-0.5 opacity-80">bouwgroep</span>
    </div>
  </div>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Mood', 'Keuzes', 'Ruimte', 'Resultaat'];
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2 rounded"></div>
        {steps.map((label, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <div key={index} className="flex flex-col items-center bg-slate-50 px-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${
                isActive ? 'bg-accent border-accent text-white scale-110 shadow-lg shadow-accent/30' : 
                isCompleted ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle size={20} /> : index + 1}
              </div>
              <span className={`text-[10px] mt-3 font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BeforeAfterSlider = ({ before, after }: { before: string; after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl cursor-ew-resize select-none shadow-2xl group"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={before} className="absolute inset-0 w-full h-full object-cover max-w-none" alt="Before" style={{ width: containerRef.current?.offsetWidth }} />
      </div>
      <div className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-accent">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-accent rounded-full"></div>
            <div className="w-1 h-4 bg-accent rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest pointer-events-none transition-opacity group-hover:opacity-100 opacity-80">Vóór de renovatie</div>
      <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest pointer-events-none transition-opacity group-hover:opacity-100 opacity-80">Uw nieuwe visie</div>
    </div>
  );
};

// --- Product Selector Item ---
const CategoryProductSelector = ({ 
  category, 
  onSelect, 
  selectedId,
  mood 
}: { 
  category: CatalogProduct['category'], 
  onSelect: (p: CatalogProduct) => void,
  selectedId?: string,
  mood: RenovationStyle
}) => {
  const products = useMemo(() => 
    PRODUCT_CATALOG.filter(p => p.category === category && p.styleTags.includes(mood)), 
  [category, mood]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map(p => (
        <button 
          key={p.id} 
          onClick={() => onSelect(p)} 
          className={`relative flex flex-col items-center p-3 border-2 rounded-xl transition-all ${
            selectedId === p.id ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-slate-100 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center">
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1 leading-none">{p.brand}</p>
          <p className="text-[11px] font-bold text-slate-900 leading-tight h-8 overflow-hidden text-center">{p.name}</p>
          {selectedId === p.id && (
            <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full shadow-lg">
              <Check size={12} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// Fix: Make children optional to resolve 'Property children is missing' error
const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`bg-white ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Lead Capture State
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', postcode: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Configuration State
  const [selectedStyle, setSelectedStyle] = useState<RenovationStyle | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});
  const [materialConfig, setMaterialConfig] = useState<MaterialConfig>({
    floorTile: 'AI_MATCH', wallTile: 'AI_MATCH', vanityType: 'AI_MATCH', faucetFinish: 'AI_MATCH', toiletType: 'AI_MATCH', lightingType: 'AI_MATCH'
  });

  // Physical Data
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [projectSpec, setProjectSpec] = useState<ProjectSpec | null>(null);
  const [clearedImage, setClearedImage] = useState<string | null>(null);
  
  // Results
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const moods = [
    { type: RenovationStyle.MODERN, label: 'Modern Minimalistisch', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=400', desc: 'Sluier, wit en rust.' },
    { type: RenovationStyle.INDUSTRIAL, label: 'Industriële Chic', img: 'https://images.unsplash.com/photo-1507652313519-d451e12d59b8?auto=format&fit=crop&q=80&w=400', desc: 'Beton, metaal en rauw.' },
    { type: RenovationStyle.SCANDINAVIAN, label: 'Scandinavische Hygge', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', desc: 'Licht hout en zachtheid.' },
    { type: RenovationStyle.LUXURY, label: 'Hotel Luxe', img: 'https://images.unsplash.com/photo-1600566752355-397921139bd1?auto=format&fit=crop&q=80&w=400', desc: 'Marmer en goud.' },
    { type: RenovationStyle.CLASSIC, label: 'Modern Klassiek', img: 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&q=80&w=400', desc: 'Tijdloze elegantie.' }
  ];

  const handleMoodSelect = (style: RenovationStyle) => {
    setSelectedStyle(style);
    setStep(2);
  };

  const startProcessing = async () => {
    if (!imagePreview || !selectedStyle) return;
    setStep(4);
    setLoading(true);
    setError(null);

    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();
      
      setLoadingMessage("Ruimte layout analyseren...");
      const spec = await analyzeBathroomInput(imagePreview.split(',')[1]);
      setProjectSpec(spec);

      setLoadingMessage("Sloopwerkzaamheden simuleren...");
      const empty = await generateEmptySpace(imagePreview, spec);
      setClearedImage(empty);

      setLoadingMessage("Uw nieuwe badkamer renderen...");
      const [est, url] = await Promise.all([
        calculateRenovationCost(spec, BudgetTier.STANDARD, selectedStyle, materialConfig),
        generateRenovationRender(spec, selectedStyle, materialConfig, empty)
      ]);

      setEstimate(est);
      setRenderUrl(url);
    } catch (err: any) {
      console.error(err);
      setError("Er is iets misgegaan bij het genereren van uw voorstel.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitted(true);
    // Real-time export would happen here
  };

  const reset = () => {
    setStep(1); setSelectedStyle(null); setImagePreview(null); setProjectSpec(null);
    setEstimate(null); setRenderUrl(null); setClearedImage(null); setLeadSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-accent selection:text-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center justify-between px-8 shadow-sm">
        <Logo />
        {step > 1 && step < 4 && (
          <button onClick={reset} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all flex items-center gap-2">
            <RefreshCw size={14} /> Terug naar start
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {step < 5 && <StepIndicator currentStep={step} />}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-xl animate-fade-in flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-black uppercase tracking-tight text-red-900 text-sm mb-1">Oeps! Er ging iets fout</p>
              <p className="text-red-700 text-xs font-bold">{error}</p>
              <button onClick={reset} className="mt-4 text-[10px] font-black uppercase text-red-900 underline">Probeer het opnieuw</button>
            </div>
          </div>
        )}

        {/* STEP 1: MOOD SELECTION */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-5xl font-black tracking-tighter mb-4 leading-tight">Kies uw gewenste <span className="text-accent italic">mood</span>.</h2>
              <p className="text-slate-500 font-bold text-lg">De basis van uw nieuwe badkamer begint bij de juiste sfeer.</p>
            </div>
            <div className="grid md:grid-cols-5 gap-6">
              {moods.map(m => (
                <button 
                  key={m.type} 
                  onClick={() => handleMoodSelect(m.type)}
                  className="group relative h-96 overflow-hidden rounded-3xl border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <img src={m.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Style</p>
                    <h3 className="text-xl font-black text-white leading-tight uppercase mb-2">{m.label}</h3>
                    <p className="text-white/60 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-100">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURATION WITHIN MOOD */}
        {step === 2 && selectedStyle && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl overflow-hidden relative">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4">Geselecteerde Mood</p>
                      <h3 className="text-3xl font-black tracking-tighter leading-none mb-4">{selectedStyle}</h3>
                      <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Verfijn nu uw keuzes binnen deze stijl voor een gepersonaliseerd resultaat.</p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full blur-[60px] opacity-20" />
                  </div>
                  <div className="bg-slate-100 p-6 rounded-2xl border-2 border-slate-200">
                    <h4 className="font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><Info size={14} className="text-accent" /> Waarom deze keuzes?</h4>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                      We tonen enkel producten die perfect aansluiten bij de gekozen mood. Zo bent u altijd zeker van een harmonieus design.
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-8 space-y-12">
                {['Faucet', 'Toilet', 'Vanity', 'Lighting', 'Tile'].map((cat, i) => (
                  <div key={cat} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-accent shadow-sm"><ShoppingBag size={20} /></div>
                      <h4 className="font-black uppercase tracking-widest text-sm">{cat === 'Tile' ? 'Tegels & Afwerking' : cat}</h4>
                    </div>
                    <CategoryProductSelector 
                      category={cat as any} 
                      mood={selectedStyle} 
                      selectedId={selectedProductIds[cat]} 
                      onSelect={(p) => {
                        setSelectedProductIds({...selectedProductIds, [cat]: p.id});
                        setMaterialConfig({...materialConfig, [cat === 'Tile' ? 'floorTile' : `${cat.toLowerCase()}Type`]: p.name});
                      }} 
                    />
                  </div>
                ))}
                <div className="pt-12">
                  <button onClick={() => setStep(3)} className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl">
                    Volgende: Ruimte & Afmetingen <ArrowRight size={20}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DIMENSIONS & PHOTO */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Uw Huidige Ruimte</h2>
              <p className="text-slate-500 font-bold">Help ons de visualisatie en prijs op maat te maken.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                  <h3 className="font-black uppercase text-xs tracking-widest text-slate-400 mb-8 flex items-center gap-2"><Ruler size={16}/> 1. Afmetingen (m)</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {['Width', 'Length'].map(dim => (
                      <div key={dim}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{dim === 'Width' ? 'Breedte' : 'Lengte'}</label>
                        <div className="relative">
                          <input 
                            type="number" step="0.01" 
                            defaultValue={2.5}
                            onChange={(e) => setProjectSpec(prev => ({...(prev || {} as ProjectSpec), [`estimated${dim}Meters`]: parseFloat(e.target.value)}))}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-2xl font-black focus:border-accent transition-all outline-none" 
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">M</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                   <div className="relative z-10 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg"><Info size={20} /></div>
                     <div>
                       <h4 className="font-black uppercase text-xs tracking-widest mb-2">Tip van de vakman</h4>
                       <p className="text-[11px] font-bold text-white/60 leading-relaxed">Meet van muur tot muur op de breedste punten. De hoogte nemen we standaard op 2.40m tenzij anders aangegeven.</p>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl flex flex-col">
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-400 mb-8 flex items-center gap-2"><ImageIcon size={16}/> 2. Foto van de huidige staat</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 border-4 border-dashed border-slate-100 rounded-[2rem] p-10 cursor-pointer hover:border-accent hover:bg-slate-50 transition-all group flex flex-col items-center justify-center text-center"
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="max-h-64 rounded-2xl shadow-2xl animate-fade-in" />
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="text-slate-400" size={32} />
                      </div>
                      <p className="font-black uppercase tracking-widest text-xs mb-2">Selecteer of Sleep Foto</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Probeer de hele ruimte in beeld te brengen</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <button 
                onClick={startProcessing} 
                disabled={!imagePreview} 
                className={`px-24 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto ${
                  !imagePreview ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-accent text-white hover:bg-orange-600 hover:scale-105 active:scale-95'
                }`}
              >
                Genereer Mijn Resultaat <ArrowRight size={24}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LOADING / PROCESSING */}
        {loading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8">
            <div className="relative mb-12">
               <div className="w-32 h-32 border-8 border-slate-100 rounded-full" />
               <div className="absolute inset-0 w-32 h-32 border-8 border-accent border-t-transparent rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Logo />
               </div>
            </div>
            <div className="text-center max-w-sm">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 animate-pulse">{loadingMessage}</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">Wij combineren uw voorkeuren met onze expertise voor het perfecte voorstel.</p>
            </div>
          </div>
        )}

        {/* STEP 5: RESULT / LEAD CAPTURE  (NOW STEP 4) */}
        {step === 4 && !loading && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            {!leadSubmitted ? (
              <div className="max-w-xl mx-auto">
                <Card className="p-12 border-4 border-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] rounded-[3rem]">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6"><CheckCircle size={32} /></div>
                    <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight uppercase">Uw voorstel staat klaar!</h2>
                    <p className="text-slate-500 font-bold text-sm">Vul uw gegevens in om uw gepersonaliseerde visualisatie en prijsindicatie te bekijken.</p>
                  </div>
                  <form onSubmit={handleLeadSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { id: 'name', label: 'Naam', icon: User, type: 'text' },
                        { id: 'email', label: 'E-mailadres', icon: Mail, type: 'email' },
                        { id: 'phone', label: 'Telefoonnummer', icon: Smartphone, type: 'tel' },
                        { id: 'postcode', label: 'Postcode', icon: Grid, type: 'text' }
                      ].map(field => (
                        <div key={field.id} className="relative">
                          <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            placeholder={field.label}
                            type={field.type} 
                            value={(leadData as any)[field.id]} 
                            onChange={(e) => setLeadData({...leadData, [field.id]: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 pl-14 font-bold outline-none focus:border-accent transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 mt-8 shadow-2xl shadow-black/20">
                      Bekijk Resultaat <ArrowRight size={20}/>
                    </button>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">Door te verzenden gaat u akkoord met onze privacyverklaring.</p>
                  </form>
                </Card>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                  <div className="max-w-xl">
                    <p className="text-accent font-black uppercase tracking-[0.4em] text-[10px] mb-4">Gefeliciteerd, {leadData.name}!</p>
                    <h2 className="text-6xl font-black tracking-tighter leading-none mb-6">Uw Nieuwe <span className="text-accent">Badkamer</span>.</h2>
                    <p className="text-slate-500 font-bold text-lg leading-relaxed">Op basis van uw keuzes voor de <span className="text-black uppercase">{selectedStyle}</span> mood hebben we dit unieke voorstel samengesteld.</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"><Download size={18}/> PDF Download</button>
                     <button className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Directe Afspraak</button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                   <div className="space-y-8">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><ImageIcon size={18} /></div>
                        <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Interactieve Visualisatie</h3>
                     </div>
                     <div className="relative">
                        <BeforeAfterSlider before={imagePreview!} after={renderUrl!} />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-[40px] -z-10" />
                     </div>
                     <div className="bg-slate-100 p-8 rounded-[2rem] border-2 border-white shadow-lg">
                        <h4 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2 text-slate-400"><Info size={16} /> Juridische Kadering</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Deze visualisatie is een AI-generatie op basis van de ingevoerde data en dient puur ter inspiratie. Afmetingen en productdetails kunnen in de realiteit afwijken. Een definitieve opname ter plaatse is noodzakelijk.</p>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black"><DollarSign size={18} /></div>
                        <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Investeringsindicatie</h3>
                     </div>
                     <Card className="p-0 border-4 border-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden">
                       <div className="bg-black p-10 text-white relative overflow-hidden">
                         <div className="relative z-10">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4">Verwachte Bandbreedte</p>
                           <div className="flex items-baseline gap-4 mb-4">
                             <span className="text-6xl font-black tracking-tighter">€{(estimate?.grandTotal || 0).toLocaleString()}</span>
                             <span className="text-2xl font-bold opacity-30">Indicatief</span>
                           </div>
                           <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest leading-relaxed">Bandbreedte: €{((estimate?.grandTotal || 0) * 0.9).toLocaleString()} - €{((estimate?.grandTotal || 0) * 1.2).toLocaleString()}</p>
                         </div>
                         <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-[60px]" />
                       </div>
                       <div className="p-10 space-y-6 bg-white">
                         <div className="space-y-4">
                           {estimate?.lineItems.slice(0, 5).map((item, i) => (
                             <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                               <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.category}</p>
                                 <p className="font-black text-sm text-slate-900">{item.productName || item.description}</p>
                               </div>
                               <p className="font-black text-sm text-slate-900">€{item.totalPrice.toLocaleString()}</p>
                             </div>
                           ))}
                         </div>
                         <div className="pt-6 mt-6 border-t-2 border-slate-50">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemiddelde installatie</span>
                               <span className="text-sm font-black text-slate-900">Inbegrepen</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Levering (Gecureerd)</span>
                               <span className="text-sm font-black text-slate-900">Inbegrepen</span>
                            </div>
                         </div>
                       </div>
                       <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm flex-shrink-0"><Smartphone size={20}/></div>
                         <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-0.5">Vragen over deze prijs?</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Onze experts bellen u binnen 24u terug.</p>
                         </div>
                       </div>
                     </Card>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-20 mt-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
           <div className="flex justify-center mb-8 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
             <Logo />
           </div>
           <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-xl mx-auto uppercase tracking-widest mb-12">
             Renisol Bouwgroep is uw partner voor hoogwaardige badkamerrenovaties. Onze digitale tool is de eerste stap naar uw droomruimte.
           </p>
           <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
             <a href="#" className="hover:text-black transition-colors">Privacy</a>
             <a href="#" className="hover:text-black transition-colors">Voorwaarden</a>
             <a href="#" className="hover:text-black transition-colors">Cookies</a>
           </div>
           <p className="mt-16 text-[10px] font-black text-slate-200 uppercase tracking-widest">© 2024 RENISOL BOUWGROEP SYSTEMS BV.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}