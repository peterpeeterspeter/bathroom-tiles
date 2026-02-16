import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link2, X, Loader2, Sparkles, Image as ImageIcon, Pen } from 'lucide-react';
import { StylePreset } from '../types';
import { fetchStylePresets } from '../lib/productService';
import { presetToProfile } from '../services/styleAnalysis';
import { fetchPinterestImage, isPinterestUrl } from '../lib/pinterestFetcher';

export interface ReferenceImage {
  id: string;
  thumbnail: string;
  base64: string;
  mimeType: string;
  source: 'upload' | 'pinterest';
}

export interface StyleSelectionResult {
  preset: StylePreset | null;
  referenceImages: ReferenceImage[];
  moodDescription: string;
}

interface StyleInspirationProps {
  onStyleSelected: (result: StyleSelectionResult) => void;
  onMoodDescriptionChange?: (value: string) => void;
}

export const StyleInspiration = ({ onStyleSelected, onMoodDescriptionChange }: StyleInspirationProps) => {
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [moodDescription, setMoodDescription] = useState('');
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [fetchingPin, setFetchingPin] = useState(false);
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
      onStyleSelected({ preset, referenceImages: [], moodDescription });
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
      reader.readAsDataURL(file as Blob);
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

  const handleProceedWithImages = () => {
    onStyleSelected({ preset: selectedPreset, referenceImages, moodDescription });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-neutral-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
          Wat is uw <span className="text-primary italic">droomstijl</span>?
        </h2>
        <p className="text-neutral-500 font-bold text-base md:text-lg">
          Beschrijf uw ideale badkamer, upload inspiratie, kies een basisstijl — of combineer alles.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10 md:mb-14">
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-primary/20 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Pen size={18} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs text-neutral-700">Beschrijf uw droomstijl</h3>
              <p className="text-[10px] font-bold text-neutral-400 mt-0.5">Onze AI analyseert uw voorkeuren en past het ontwerp hierop aan</p>
            </div>
          </div>
          <textarea
            value={moodDescription}
            onChange={(e) => { setMoodDescription(e.target.value); onMoodDescriptionChange?.(e.target.value); }}
            placeholder="Bijv: Ik droom van een lichte, warme badkamer met veel hout en natuursteen. Geen koude witte tegels. Liefst een Scandinavisch gevoel met een vleugje luxe. De douche mag ruim zijn met een regendouchekop."
            rows={4}
            maxLength={500}
            className="w-full bg-surface border-2 border-neutral-300/50 rounded-xl p-4 md:p-5 text-sm md:text-base font-bold outline-none focus:border-primary transition-all resize-none placeholder:text-neutral-300 leading-relaxed"
          />
          <p className="text-[10px] font-bold text-neutral-300 mt-2 text-right">{moodDescription.length}/500</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-10 md:mb-14">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-900/10 flex items-center justify-center text-neutral-700">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-xs text-neutral-500">Upload inspiratie</h3>
              </div>
              <span className="text-[10px] font-bold text-neutral-300 ml-auto">{referenceImages.length}/3</span>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 mb-5 ml-11">Voeg foto's toe van badkamers die u aanspreken</p>

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
                    className="w-full border-2 border-dashed border-neutral-300/50 rounded-2xl p-6 md:p-8 cursor-pointer hover:border-primary hover:bg-surface transition-all group flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-neutral-500" size={20} />
                    </div>
                    <p className="font-black uppercase tracking-widest text-[10px] mb-1">Upload foto's</p>
                    <p className="text-[10px] font-bold text-neutral-500">JPG, PNG - Max 3 beelden</p>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#E60023]/10 flex items-center justify-center text-[#E60023]">
                <Link2 size={18} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-xs text-neutral-500">Pinterest inspiratie</h3>
              </div>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 mb-5 ml-11">Plak een Pinterest link en wij halen het beeld automatisch op</p>

            <div className="space-y-4">
              <div className="bg-white border-2 border-neutral-300/30 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                    <input
                      type="url"
                      placeholder="https://pinterest.com/pin/..."
                      value={pinterestUrl}
                      onChange={e => { setPinterestUrl(e.target.value); setPinError(null); }}
                      onKeyDown={e => e.key === 'Enter' && handlePinterestAdd()}
                      className="w-full bg-surface border-2 border-neutral-300/50 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-[#E60023] transition-all"
                    />
                  </div>
                  <button
                    onClick={handlePinterestAdd}
                    disabled={fetchingPin || !pinterestUrl.trim()}
                    className="px-5 bg-[#E60023] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#c5001e] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {fetchingPin ? <Loader2 size={14} className="animate-spin" /> : 'Ophalen'}
                  </button>
                </div>
                {pinError && (
                  <p className="text-[10px] font-bold text-red-500 mt-2">{pinError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {referenceImages.length > 0 && (
          <div className="mt-8 max-w-md mx-auto">
            <button
              onClick={handleProceedWithImages}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <Sparkles size={18} /> Ga verder met inspiratie
            </button>
            {selectedPreset && (
              <p className="text-[10px] font-bold text-neutral-500 text-center mt-3">
                Combineert met {selectedPreset.label_nl} stijl
              </p>
            )}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs text-neutral-500">Kies een basisstijl</h3>
          </div>
        </div>
        <p className="text-[10px] font-bold text-neutral-400 mb-6 ml-11">Selecteer een stijl als startpunt — u kunt dit later altijd verfijnen</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`group relative h-44 md:h-56 overflow-hidden rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                selectedPreset?.id === preset.id
                  ? 'border-primary ring-4 ring-primary/20'
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
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">Style</p>
                <h4 className="text-xs md:text-sm font-black text-white leading-tight uppercase">{preset.label_nl}</h4>
                <p className="text-white/60 text-[10px] font-bold mt-1 hidden md:block">{preset.description_nl}</p>
              </div>
              {selectedPreset?.id === preset.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {(selectedPreset || moodDescription.trim()) && referenceImages.length === 0 && (
        <div className="mt-8 max-w-md mx-auto">
          {selectedPreset && (
            <div className="bg-surface border border-neutral-300/50 rounded-2xl p-4 text-center mb-4">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Stijl geselecteerd: <span className="text-primary">{selectedPreset.label_nl}</span> — upload optioneel inspiratiebeelden om te verfijnen.
              </p>
            </div>
          )}
          <button
            onClick={handleProceedWithImages}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <Sparkles size={18} /> Ga verder
          </button>
        </div>
      )}
    </div>
  );
};
