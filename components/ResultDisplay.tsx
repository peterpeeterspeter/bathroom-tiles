import React, { useState } from 'react';
import { Download, Image as ImageIcon, Info, Smartphone, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Estimate, StyleProfile } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { generateResultPdf } from '../lib/pdfService';

interface ResultDisplayProps {
  name: string;
  styleProfile: StyleProfile;
  estimate: Estimate;
  renderUrl: string;
  imagePreview: string;
  choices: {
    category: string;
    product: string;
    priceTier?: string;
    priceLow?: number;
    priceHigh?: number;
  }[];
  roomArea?: number;
  roomWidth?: number;
  roomLength?: number;
}

export const ResultDisplay = ({ name, styleProfile, estimate, renderUrl, imagePreview, choices, roomArea, roomWidth, roomLength }: ResultDisplayProps) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const totalLow = Math.round((estimate.grandTotal) * 0.85);
  const totalHigh = Math.round((estimate.grandTotal) * 1.15);

  const currency = estimate.currency || 'USD';
  const symbol = currency === 'USD' ? '$' : '€';
  const locale = currency === 'USD' ? 'en-US' : 'nl-BE';

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateResultPdf({
        name,
        selectedStyle: styleProfile.presetName || styleProfile.summary.slice(0, 40),
        styleSummary: styleProfile.summary,
        estimateLow: totalLow,
        estimateHigh: totalHigh,
        currency,
        beforeImage: imagePreview,
        afterImage: renderUrl,
        choices,
        roomArea,
        roomWidth,
        roomLength,
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleAppointment = () => {
    window.open('mailto:info@bathroom-tiles.com?subject=Appointment%20bathroom%20tile%20renovation&body=Hi%20Bathroom%20Tiles%2C%0A%0AI%20would%20like%20to%20schedule%20an%20appointment%20for%20a%20consultation%20about%20my%20bathroom%20tile%20renovation.%0A%0ABest%20regards%2C%0A' + encodeURIComponent(name), '_blank');
  };

  return (
    <div className="space-y-10 md:space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="max-w-xl">
          <p className="text-primary font-semibold uppercase tracking-wide text-xs mb-3 md:mb-4">Your personal proposal</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-4 md:mb-6">Your New <span className="text-primary">Bathroom</span>.</h2>
          <p className="text-neutral-500 text-sm md:text-lg leading-relaxed">Based on your style profile we've put together this unique proposal.</p>
        </div>
        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
           <button
             onClick={handleDownloadPdf}
             disabled={generatingPdf}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-white border border-neutral-300/50 rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-surface transition-all"
           >
             {generatingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>} PDF
           </button>
           <button
             onClick={handleAppointment}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-accent text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-accent-hover transition-all"
           >
             <Calendar size={18}/> Schedule
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
         <div className="space-y-6 md:space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ImageIcon size={18} /></div>
              <h3 className="font-bold uppercase tracking-widest text-sm text-neutral-500">Renovation Visualization</h3>
           </div>
           <div className="relative">
              <BeforeAfterSlider before={imagePreview} after={renderUrl} />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-10" />
           </div>
           <div className="bg-surface p-6 md:p-8 rounded-2xl border border-neutral-300/30">
              <h4 className="font-bold text-xs tracking-widest mb-3 md:mb-4 flex items-center gap-2 text-neutral-500"><Info size={16} /> Legal Notice</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">This visualization is AI-generated based on your input and is for inspiration only. Dimensions and product details may differ in reality. An on-site survey is required for accurate quotes.</p>
           </div>
         </div>

         <div className="space-y-6 md:space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900/10 flex items-center justify-center text-neutral-900"><DollarSign size={18} /></div>
              <h3 className="font-bold uppercase tracking-widest text-sm text-neutral-500">Investment Estimate</h3>
           </div>
           <div className="bg-white border border-neutral-300/50 shadow-xl rounded-2xl overflow-hidden">
             <div className="bg-primary-dark p-8 md:p-10 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-3 md:mb-4">Expected Range</p>
                 <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-3 md:mb-4">
                   <span className="text-3xl md:text-5xl font-black tracking-tight">{symbol}{totalLow.toLocaleString(locale)} - {symbol}{totalHigh.toLocaleString(locale)}</span>
                 </div>
                 <p className="text-xs text-white/50 leading-relaxed">Indicative estimate including materials, installation and delivery.</p>
               </div>
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
             </div>
             <div className="p-6 md:p-10 space-y-4 md:space-y-6 bg-white">
               <div className="space-y-3 md:space-y-4">
                 {['Tiles & materials', 'Professional installation', 'Delivery & transport', 'Demo & disposal'].map((item, i) => (
                   <div key={i} className={`flex justify-between items-center ${i < 3 ? 'border-b border-neutral-300/30 pb-3 md:pb-4' : ''}`}>
                     <div>
                       <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-0.5">Included</p>
                       <p className="font-bold text-sm text-neutral-900">{item}</p>
                     </div>
                     <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-success"></div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-neutral-300/30">
                 <p className="text-[11px] text-neutral-500 leading-relaxed">
                   This estimate is non-binding and based on average market rates. A definitive quote follows after a consultation and on-site survey.
                 </p>
               </div>
             </div>
             <div className="bg-surface p-6 md:p-8 border-t border-neutral-300/30 flex items-center gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0"><Smartphone size={20}/></div>
               <div>
                  <p className="text-xs font-bold text-neutral-900 mb-0.5">Questions about this estimate?</p>
                  <p className="text-xs text-neutral-500">Our experts will call you back within 24 hours.</p>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};
