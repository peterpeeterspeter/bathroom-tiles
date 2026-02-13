import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

const TIPS = [
  "Tip: een nis in de douche oogt strak \u00e9n is praktisch.",
  "Tip: matte kranen tonen minder vingerafdrukken dan hoogglans.",
  "Tip: grote tegels = rustiger beeld, maar let op antislip in de douche.",
  "Tip: 3000K (warm wit) voelt 'hotel', 4000K is functioneler.",
  "Tip: kies 2 basismaterialen + 1 accent; voorkomt 'drukte'.",
  "Tip: spiegel met indirect licht maakt kleine badkamers groter.",
  "Tip: denk aan stopcontact bij spiegelkast (tandenborstel/haardroger).",
  "Tip: voldoende ventilatie voorkomt schimmel \u2014 zeker bij inloopdouche.",
  "Trend 2026: 'Minimal Opulence' \u2014 sculpturale rust ontmoet rijke materialen. Denk aan strakke lijnen met warme, tactiele oppervlakken.",
  "Grote inloopdouches vervangen steeds vaker het bad. Praktisch, modern en visueel ruimer \u2014 d\u00e9 badkamertrend van 2026.",
  "'Smart bathrooms' zijn in opmars: denk aan slimme toiletten, sensorgestuurde kranen en verwarmde handdoekrekken.",
  "Microcement, plafond-hoge douchegordijnen en vintage-ge\u00efnspireerde tegels \u2014 dat zijn de materialen die je overal terugziet in 2026.",
  "Een waterbesparend toilet gebruikt slechts 3\u20134 liter per spoeling, terwijl oudere modellen tot 12 liter verbruiken. Goed voor je portemonnee \u00e9n het milieu.",
  "Door je oude douchekop te vervangen door een waterbesparend model bespaar je tot 2.700 liter water per jaar.",
  "Een dual-flush toilet bespaart gemiddeld 31% water ten opzichte van een standaard spoelsysteem.",
  "Wist je dat de badkamer verantwoordelijk is voor meer dan de helft van het totale waterverbruik in huis?",
];

interface LoadingOverlayProps {
  message: string;
  elapsedSeconds: number;
}

export const LoadingOverlay = ({ message, elapsedSeconds }: LoadingOverlayProps) => {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setTipIndex(prev => {
          let next = prev;
          while (next === prev) {
            next = Math.floor(Math.random() * TIPS.length);
          }
          return next;
        });
        setFadeIn(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8">
      <div className="relative mb-12">
        <div className="w-28 h-28 md:w-32 md:h-32 border-8 border-neutral-100 rounded-full" />
        <div className="absolute inset-0 w-28 h-28 md:w-32 md:h-32 border-8 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo compact />
        </div>
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4 animate-pulse">{message}</h2>
        <p className={`text-neutral-500 text-sm leading-relaxed mb-6 min-h-[3rem] transition-opacity duration-400 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {TIPS[tipIndex]}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-neutral-300">{elapsedSeconds}s</span>
        </div>
        {elapsedSeconds > 150 && (
          <p className="mt-4 text-xs font-medium text-warning">Dit duurt langer dan verwacht. Even geduld...</p>
        )}
      </div>
    </div>
  );
};
