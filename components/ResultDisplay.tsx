import React, { useState } from 'react';
import { Download, Image as ImageIcon, Info, Smartphone, Calendar, Euro, Loader2 } from 'lucide-react';
import { Estimate, RenovationStyle } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { generateResultPdf } from '../lib/pdfService';

interface ResultDisplayProps {
  name: string;
  selectedStyle: RenovationStyle;
  estimate: Estimate;
  renderUrl: string;
  imagePreview: string;
  choices: { category: string; product: string }[];
}

export const ResultDisplay = ({ name, selectedStyle, estimate, renderUrl, imagePreview, choices }: ResultDisplayProps) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const totalLow = Math.round((estimate.grandTotal) * 0.85);
  const totalHigh = Math.round((estimate.grandTotal) * 1.15);

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateResultPdf({
        name,
        selectedStyle,
        estimateLow: totalLow,
        estimateHigh: totalHigh,
        beforeImage: imagePreview,
        afterImage: renderUrl,
        choices,
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleAppointment = () => {
    window.open('mailto:info@renisol.be?subject=Afspraak%20badkamerrenovatie&body=Beste%20Renisol%2C%0A%0AGraag%20zou%20ik%20een%20afspraak%20maken%20voor%20een%20persoonlijk%20adviesgesprek%20over%20mijn%20badkamerrenovatie.%0A%0AMet%20vriendelijke%20groeten%2C%0A' + encodeURIComponent(name), '_blank');
  };

  return (
    <div className="space-y-10 md:space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="max-w-xl">
          <p className="text-accent font-black uppercase tracking-[0.4em] text-[10px] mb-3 md:mb-4">Uw persoonlijk voorstel</p>
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-none mb-4 md:mb-6">Uw Nieuwe <span className="text-accent">Badkamer</span>.</h2>
          <p className="text-slate-500 font-bold text-sm md:text-lg leading-relaxed">Op basis van uw keuzes voor de <span className="text-black uppercase">{selectedStyle}</span> mood hebben we dit unieke voorstel samengesteld.</p>
        </div>
        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
           <button
             onClick={handleDownloadPdf}
             disabled={generatingPdf}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-white border-2 border-slate-200 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
           >
             {generatingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>} PDF
           </button>
           <button
             onClick={handleAppointment}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-black text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
           >
             <Calendar size={18}/> Afspraak
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
         <div className="space-y-6 md:space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><ImageIcon size={18} /></div>
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Interactieve Visualisatie</h3>
           </div>
           <div className="relative">
              <BeforeAfterSlider before={imagePreview} after={renderUrl} />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-[40px] -z-10" />
           </div>
           <div className="bg-slate-100 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border-2 border-white shadow-lg">
              <h4 className="font-black uppercase text-xs tracking-widest mb-3 md:mb-4 flex items-center gap-2 text-slate-400"><Info size={16} /> Juridische Kadering</h4>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Deze visualisatie is een AI-generatie op basis van de ingevoerde data en dient puur ter inspiratie. Afmetingen en productdetails kunnen in de realiteit afwijken. Een definitieve opname ter plaatse is noodzakelijk.</p>
           </div>
         </div>

         <div className="space-y-6 md:space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black"><Euro size={18} /></div>
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Investeringsindicatie</h3>
           </div>
           <div className="bg-white p-0 border-4 border-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-2xl md:rounded-[3rem] overflow-hidden">
             <div className="bg-black p-8 md:p-10 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-3 md:mb-4">Verwachte Bandbreedte</p>
                 <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-3 md:mb-4">
                   <span className="text-3xl md:text-5xl font-black tracking-tighter">EUR {totalLow.toLocaleString('nl-BE')} - {totalHigh.toLocaleString('nl-BE')}</span>
                 </div>
                 <p className="text-[10px] md:text-[11px] font-bold opacity-50 uppercase tracking-widest leading-relaxed">Indicatieve investeringsbandbreedte inclusief materialen, installatie en levering.</p>
               </div>
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-[60px]" />
             </div>
             <div className="p-6 md:p-10 space-y-4 md:space-y-6 bg-white">
               <div className="space-y-3 md:space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-3 md:pb-4">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inbegrepen</p>
                     <p className="font-black text-xs md:text-sm text-slate-900">Materialen & sanitair</p>
                   </div>
                   <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-3 md:pb-4">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inbegrepen</p>
                     <p className="font-black text-xs md:text-sm text-slate-900">Professionele installatie</p>
                   </div>
                   <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-3 md:pb-4">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inbegrepen</p>
                     <p className="font-black text-xs md:text-sm text-slate-900">Levering & transport</p>
                   </div>
                   <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                 </div>
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inbegrepen</p>
                     <p className="font-black text-xs md:text-sm text-slate-900">Sloopwerken & afvoer</p>
                   </div>
                   <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                 </div>
               </div>

               <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t-2 border-slate-50">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                   Deze prijsindicatie is niet-bindend en gebaseerd op gemiddelde markttarieven. Een definitieve offerte volgt na persoonlijk adviesgesprek en technische opname ter plaatse.
                 </p>
               </div>
             </div>
             <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-accent shadow-sm flex-shrink-0"><Smartphone size={20}/></div>
               <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-0.5">Vragen over deze prijs?</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Onze experts bellen u binnen 24u terug.</p>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};
