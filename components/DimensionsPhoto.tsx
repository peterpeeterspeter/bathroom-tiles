import React, { useRef } from 'react';
import { ArrowRight, Upload, Image as ImageIcon, Ruler, Info, Camera } from 'lucide-react';
import { ProjectSpec } from '../types';

interface DimensionsPhotoProps {
  imagePreview: string | null;
  onImageChange: (dataUrl: string) => void;
  onDimensionChange: (field: string, value: number) => void;
  onSubmit: () => void;
}

export const DimensionsPhoto = ({ imagePreview, onImageChange, onDimensionChange, onSubmit }: DimensionsPhotoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onImageChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-4 uppercase">Uw Huidige Ruimte</h2>
        <p className="text-neutral-500 font-bold text-sm md:text-base">Help ons de visualisatie en prijs op maat te maken.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-neutral-300/30 shadow-xl">
            <h3 className="font-black uppercase text-xs tracking-widest text-neutral-500 mb-6 md:mb-8 flex items-center gap-2"><Ruler size={16}/> 1. Afmetingen (m)</h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {[{ key: 'Width', label: 'Breedte' }, { key: 'Length', label: 'Lengte' }].map(dim => (
                <div key={dim.key}>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">{dim.label}</label>
                  <div className="relative">
                    <input
                      type="number" step="0.01"
                      defaultValue={2.5}
                      onChange={(e) => onDimensionChange(`estimated${dim.key}Meters`, parseFloat(e.target.value))}
                      className="w-full bg-surface border-2 border-neutral-300/50 rounded-xl md:rounded-2xl p-4 md:p-5 text-xl md:text-2xl font-black focus:border-primary transition-all outline-none"
                    />
                    <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-neutral-300 font-black">M</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-surface rounded-xl border border-neutral-300/30">
              <div className="flex items-start gap-3">
                <Ruler className="text-primary flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Hoe meten?</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Meet van muur tot muur op de breedste punten. Meet de lengte langs de langste muur. De hoogte nemen we standaard op 2.40m.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg flex-shrink-0"><Camera size={20} /></div>
               <div>
                 <h4 className="font-black uppercase text-xs tracking-widest mb-2">Fototips</h4>
                 <ul className="text-[11px] font-bold text-white/60 leading-relaxed space-y-1">
                   <li>- Sta in de deuropening voor het beste overzicht</li>
                   <li>- Probeer de hele ruimte in beeld te brengen</li>
                   <li>- Hou de camera op borsthoogte, horizontaal</li>
                   <li>- Zorg voor voldoende licht (daglicht is ideaal)</li>
                 </ul>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-neutral-300/30 shadow-xl flex flex-col">
          <h3 className="font-black uppercase text-xs tracking-widest text-neutral-500 mb-6 md:mb-8 flex items-center gap-2"><ImageIcon size={16}/> 2. Foto van de huidige staat</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-4 border-dashed border-neutral-300/30 rounded-2xl md:rounded-[2rem] p-6 md:p-10 cursor-pointer hover:border-primary hover:bg-surface transition-all group flex flex-col items-center justify-center text-center min-h-[200px]"
          >
            {imagePreview ? (
              <img src={imagePreview} className="max-h-52 md:max-h-64 rounded-2xl shadow-2xl animate-fade-in" alt="Preview" />
            ) : (
              <>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-surface rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-neutral-500" size={28} />
                </div>
                <p className="font-black uppercase tracking-widest text-xs mb-2">Selecteer of Sleep Foto</p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase">JPG, PNG - Max 10MB</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 md:mt-12 text-center">
        <button
          onClick={onSubmit}
          disabled={!imagePreview}
          className={`w-full md:w-auto px-12 md:px-24 py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto ${
            !imagePreview ? 'bg-neutral-300/50 text-neutral-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark hover:scale-105 active:scale-95'
          }`}
        >
          Genereer Mijn Resultaat <ArrowRight size={24}/>
        </button>
      </div>
    </div>
  );
};
