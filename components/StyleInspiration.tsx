import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link2, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { StyleProfile, StylePreset } from '../types';
import { fetchStylePresets, fetchStyleTags } from '../lib/productService';
import { analyzeStyleFromReferences, presetToProfile, combineProfiles } from '../services/styleAnalysis';
import { fetchPinterestImage, isPinterestUrl } from '../lib/pinterestFetcher';

interface StyleInspirationProps {
  onStyleResolved: (profile: StyleProfile) => void;
}

interface ReferenceImage {
  id: string;
  thumbnail: string;
  base64: string;
  mimeType: string;
  source: 'upload' | 'pinterest';
}

export const StyleInspiration = ({ onStyleResolved }: StyleInspirationProps) => {
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [fetchingPin, setFetchingPin] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStylePresets().then(data => {
      setPresets(data);
      setLoading(false);
    });
  }, []);

  const handlePresetSelect = (preset: StylePreset) => {
    setSelectedPreset(preset);
    if (referenceImages.length === 0) {
      onStyleResolved(presetToProfile(preset));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - referenceImages.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const mimeMatch = dataUrl.match(/^data:(.*);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64 = dataUrl.split(',')[1];

        setReferenceImages(prev => {
          if (prev.length >= 3) return prev;
          return [...prev, {
            id: crypto.randomUUID(),
            thumbnail: dataUrl,
            base64,
            mimeType,
            source: 'upload',
          }];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePinterestAdd = async () => {
    if (!pinterestUrl.trim() || referenceImages.length >= 3) return;
    if (!isPinterestUrl(pinterestUrl)) {
      setPinError('Voer een geldige Pinterest URL in.');
      return;
    }

    setPinError(null);
    setFetchingPin(true);
    try {
      const pin = await fetchPinterestImage(pinterestUrl);
      setReferenceImages(prev => {
        if (prev.length >= 3) return prev;
        return [...prev, {
          id: crypto.randomUUID(),
          thumbnail: `data:${pin.mime_type};base64,${pin.base64}`,
          base64: pin.base64,
          mimeType: pin.mime_type,
          source: 'pinterest',
        }];
      });
      setPinterestUrl('');
    } catch (err: any) {
      setPinError(err.message || 'Kon Pinterest afbeelding niet ophalen.');
    } finally {
      setFetchingPin(false);
    }
  };

  const removeImage = (id: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAnalyzeAndProceed = async () => {
    if (referenceImages.length === 0 && !selectedPreset) return;

    if (referenceImages.length === 0 && selectedPreset) {
      onStyleResolved(presetToProfile(selectedPreset));
      return;
    }

    setAnalyzing(true);
    try {
      const tags = await fetchStyleTags();
      const images = referenceImages.map(img => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }));

      const visionProfile = await analyzeStyleFromReferences(images, tags);
      visionProfile.referenceImageUrls = referenceImages.map(img => img.thumbnail);

      if (selectedPreset) {
        const presetProfile = presetToProfile(selectedPreset);
        const combined = combineProfiles(presetProfile, visionProfile);
        onStyleResolved(combined);
      } else {
        onStyleResolved(visionProfile);
      }
    } catch (err) {
      console.error('Style analysis failed:', err);
      if (selectedPreset) {
        onStyleResolved(presetToProfile(selectedPreset));
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
          Bepaal uw <span className="text-accent italic">stijl</span>.
        </h2>
        <p className="text-slate-500 font-bold text-base md:text-lg">
          Kies een basisstijl, upload inspiratiebeelden, of combineer beide.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Sparkles size={18} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">Kies een stijl</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`group relative h-44 md:h-56 overflow-hidden rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                  selectedPreset?.id === preset.id
                    ? 'border-accent ring-4 ring-accent/20'
                    : 'border-white'
                }`}
              >
                <img
                  src={preset.image_url}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={preset.label_nl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-left">
                  <p className="text-[9px] font-black text-accent uppercase tracking-[0.3em] mb-1">Style</p>
                  <h4 className="text-xs md:text-sm font-black text-white leading-tight uppercase">{preset.label_nl}</h4>
                  <p className="text-white/60 text-[10px] font-bold mt-1 hidden md:block">{preset.description_nl}</p>
                </div>
                {selectedPreset?.id === preset.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-700">
              <ImageIcon size={18} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">Upload inspiratie</h3>
            <span className="text-[10px] font-bold text-slate-300 ml-auto">{referenceImages.length}/3</span>
          </div>

          <div className="space-y-4">
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {referenceImages.map(img => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img.thumbnail} className="w-full h-full object-cover" alt="Reference" />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                      <span className="text-[8px] font-black text-white uppercase tracking-wider">
                        {img.source === 'pinterest' ? 'Pinterest' : 'Upload'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {referenceImages.length < 3 && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-8 cursor-pointer hover:border-accent hover:bg-slate-50 transition-all group flex flex-col items-center justify-center text-center"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-slate-400" size={20} />
                  </div>
                  <p className="font-black uppercase tracking-widest text-[10px] mb-1">Upload foto's</p>
                  <p className="text-[10px] font-bold text-slate-400">JPG, PNG - Max 3 beelden</p>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">of</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="url"
                      placeholder="Pinterest URL plakken..."
                      value={pinterestUrl}
                      onChange={e => { setPinterestUrl(e.target.value); setPinError(null); }}
                      onKeyDown={e => e.key === 'Enter' && handlePinterestAdd()}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    />
                  </div>
                  <button
                    onClick={handlePinterestAdd}
                    disabled={fetchingPin || !pinterestUrl.trim()}
                    className="px-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {fetchingPin ? <Loader2 size={14} className="animate-spin" /> : 'Ophalen'}
                  </button>
                </div>
                {pinError && (
                  <p className="text-[10px] font-bold text-red-500">{pinError}</p>
                )}
              </>
            )}
          </div>

          {referenceImages.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleAnalyzeAndProceed}
                disabled={analyzing}
                className="w-full py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-60"
              >
                {analyzing ? (
                  <><Loader2 size={18} className="animate-spin" /> Stijl analyseren...</>
                ) : (
                  <><Sparkles size={18} /> Analyseer & ga verder</>
                )}
              </button>
              {selectedPreset && (
                <p className="text-[10px] font-bold text-slate-400 text-center mt-3">
                  Combineert met {selectedPreset.label_nl} stijl
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedPreset && referenceImages.length === 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Stijl geselecteerd: <span className="text-accent">{selectedPreset.label_nl}</span> -- upload optioneel inspiratiebeelden om te verfijnen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
