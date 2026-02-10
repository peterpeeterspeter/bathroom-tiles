import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ChevronLeft, ChevronRight, Euro, Clock, Ruler, ChevronDown } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

interface InspiratieCard {
  id: number;
  image: string;
  title: string;
  context: string;
  changes: string[];
  investment: string;
  duration: string;
  area: string;
  style: string;
  tags: string[];
}

const inspiratieCards: InspiratieCard[] = [
  {
    id: 1,
    image: '/inspiratie/inspiratie-01-kleine-badkamer-modern.webp',
    title: 'Kleine badkamer — Modern',
    context: 'Rijtjeshuis, ca. 4 m\u00B2',
    changes: [
      'Douchecabine \u2192 inloopdouche met glazen wand',
      'Staand toilet \u2192 wandhangend rimfree toilet',
      'Losstaande wastafel \u2192 zwevend meubel in eikenhout',
      'Kleine witte tegels \u2192 groot formaat betonlook',
    ],
    investment: '\u20AC8.000 \u2013 \u20AC12.000',
    duration: '4-5 werkdagen',
    area: 'ca. 4 m\u00B2',
    style: 'modern',
    tags: ['Kleine badkamer', 'Modern', 'Budget'],
  },
  {
    id: 2,
    image: '/inspiratie/inspiratie-02-gezinsbadkamer-scandinavisch.webp',
    title: 'Gezinsbadkamer — Scandinavisch Modern',
    context: 'Rijtjeshuis, ca. 6 m\u00B2',
    changes: [
      'Beige tegels \u2192 wit marmer-look porselein',
      'Oud ligbad \u2192 inloopdouche met regendouche',
      'Enkele wastafel \u2192 dubbel meubel met twee spiegels',
      'Bruine vloer \u2192 lichtgrijze grootformaat tegels',
      'Radiator \u2192 matzwart handdoekradiator',
    ],
    investment: '\u20AC14.000 \u2013 \u20AC18.000',
    duration: '7-8 werkdagen',
    area: 'ca. 6 m\u00B2',
    style: 'scandinavisch',
    tags: ['Gezinsbadkamer', 'Midden', 'Scandinavisch'],
  },
  {
    id: 3,
    image: '/inspiratie/inspiratie-03-ruime-badkamer-luxe.webp',
    title: 'Ruime badkamer — Hotel Luxe',
    context: 'Vrijstaand woning, ca. 9 m\u00B2',
    changes: [
      'Hoekbad \u2192 vrijstaand ovaal bad als centerpiece',
      'Aparte douche \u2192 ruime inloopdouche met dubbele douchekop',
      'Kersen houten meubel \u2192 zwevend walnoot meubel',
      'Zeegroen tegels \u2192 Calacatta marmer-look wandplaten',
      'Bidet verwijderd \u2014 ruimte gewonnen',
    ],
    investment: '\u20AC20.000 \u2013 \u20AC28.000',
    duration: '10-12 werkdagen',
    area: 'ca. 9 m\u00B2',
    style: 'luxe',
    tags: ['Luxe', 'Gezinsbadkamer'],
  },
  {
    id: 4,
    image: '/inspiratie/inspiratie-04-zolderbadkamer-slim.webp',
    title: 'Zolderbadkamer — Slim Ontworpen',
    context: 'Zolderkamer met schuin dak, ca. 5 m\u00B2',
    changes: [
      'Douchebak met gordijn \u2192 verzonken inloopdouche onder schuin dak',
      'Zellige tegels op de schuine douchewand als accent',
      'Klein fonteintje \u2192 compact zwevend meubel in licht eiken',
      'Vinyl \u2192 doorlopende lichtgrijze betonlook tegels',
      'Schone Velux brengt meer licht in de ruimte',
    ],
    investment: '\u20AC10.000 \u2013 \u20AC15.000',
    duration: '5-7 werkdagen',
    area: 'ca. 5 m\u00B2',
    style: 'modern',
    tags: ['Zolderbadkamer', 'Modern'],
  },
  {
    id: 5,
    image: '/inspiratie/inspiratie-05-apart-toilet-boutique.webp',
    title: 'Apart toilet — Boutique Stijl',
    context: 'Rijtjeshuis, ca. 1 m\u00B2',
    changes: [
      'Staand toilet \u2192 wandhangend met verborgen reservoir',
      'Witte tegels \u2192 diep bosgroen geschilderd',
      'Linoleum \u2192 zwarte hexagonale moza\u00EFektegels',
      'Kaal peertje \u2192 inbouwspot + wandlamp',
      'Messing accenten voor een boutique hotelgevoel',
    ],
    investment: '\u20AC2.500 \u2013 \u20AC4.000',
    duration: '1-2 werkdagen',
    area: 'ca. 1 m\u00B2',
    style: 'modern',
    tags: ['Kleine badkamer', 'Budget'],
  },
  {
    id: 6,
    image: '/inspiratie/inspiratie-06-jaren-80-transformatie.webp',
    title: 'Jaren-80 badkamer — Totale Transformatie',
    context: 'Tussenwoning, ca. 5 m\u00B2',
    changes: [
      'Roze sanitair volledig vervangen door wit',
      'Roze tegels \u2192 terrazzo-look porselein',
      'Ligbad \u2192 ruime inloopdouche met zwart frame',
      'Zwevend meubel in saliegroen als stijlaccent',
      'Matzwarte kranen en accessoires',
    ],
    investment: '\u20AC12.000 \u2013 \u20AC16.000',
    duration: '6-8 werkdagen',
    area: 'ca. 5 m\u00B2',
    style: 'modern',
    tags: ['Midden', 'Modern'],
  },
  {
    id: 7,
    image: '/inspiratie/inspiratie-07-en-suite-slaapkamer.webp',
    title: 'En-suite — Verlengstuk van de slaapkamer',
    context: 'Master bedroom, ca. 4 m\u00B2',
    changes: [
      'Plastic douchecabine \u2192 open inloopdouche met glazen paneel',
      'Laminaat meubel \u2192 slank zwevend meubel in wit/eiken',
      'Deur verwijderd \u2014 open overgang van slaapkamer naar badkamer',
      'Vloer loopt door vanuit de slaapkamer voor ruimtelijk effect',
    ],
    investment: '\u20AC10.000 \u2013 \u20AC14.000',
    duration: '5-6 werkdagen',
    area: 'ca. 4 m\u00B2',
    style: 'modern',
    tags: ['Modern', 'Midden'],
  },
  {
    id: 8,
    image: '/inspiratie/inspiratie-08-samenvoegen-bad-toilet.webp',
    title: 'Samenvoegen badkamer + toilet',
    context: 'Rijtjeshuis, ca. 5 m\u00B2 (samengevoegd)',
    changes: [
      'Tussenmuur verwijderd \u2014 twee kleine ruimtes worden \u00E9\u00E9n',
      'Twee deuren \u2192 \u00E9\u00E9n brede opening',
      'Twee gescheiden vloeren \u2192 doorlopende kalksteenlook tegel',
      'Ruimte voor inloopdouche + compact vrijstaand bad',
      '30-50% meer bruikbare ruimte',
    ],
    investment: '\u20AC18.000 \u2013 \u20AC25.000',
    duration: '8-10 werkdagen',
    area: 'ca. 5 m\u00B2',
    style: 'modern',
    tags: ['Gezinsbadkamer', 'Midden'],
  },
  {
    id: 9,
    image: '/inspiratie/inspiratie-09-senioren-veilig-stijlvol.webp',
    title: 'Seniorenbadkamer — Veilig & Stijlvol',
    context: 'Gelijkvloerse woning, ca. 6 m\u00B2',
    changes: [
      'Hoog bad \u2192 drempelvrije inloopdouche met zitbank',
      'Gladde vloer \u2192 antislip matte tegels (R10)',
      'Standaard toilet \u2192 comforthoogte (46cm zithoogte)',
      'Subtiele grijpstangen ge\u00EFntegreerd in het design',
      'Goede verlichting op alle plekken',
    ],
    investment: '\u20AC14.000 \u2013 \u20AC20.000',
    duration: '7-9 werkdagen',
    area: 'ca. 6 m\u00B2',
    style: 'modern',
    tags: ['Senioren', 'Midden'],
  },
  {
    id: 10,
    image: '/inspiratie/inspiratie-10-industrieel-loft.webp',
    title: 'Industrieel Loft',
    context: 'Appartement, ca. 7 m\u00B2',
    changes: [
      'Witte tegels \u2192 gepolijste donkere betonvloer',
      'Accentmuur in exposed baksteen',
      'Wit acrylbad \u2192 vrijstaand matzwart bad',
      'Meubel van hergebruikt hout op stalen beugels',
      'Zwart stalen douchewand in fabrieksraam-stijl',
      'Koperen kraan met patina als accent',
    ],
    investment: '\u20AC16.000 \u2013 \u20AC22.000',
    duration: '8-10 werkdagen',
    area: 'ca. 7 m\u00B2',
    style: 'industrieel',
    tags: ['Industrieel', 'Midden'],
  },
  {
    id: 11,
    image: '/inspiratie/inspiratie-11-scandinavisch-gezin.webp',
    title: 'Lichte gezinsbadkamer — Scandinavisch',
    context: 'Tussenwoning, ca. 7 m\u00B2',
    changes: [
      'Cr\u00E8me tegels met moza\u00EFekrand \u2192 witte handgemaakte zellige',
      'Hoekbad met kapotte jets \u2192 ingebouwd bad met tegelsurround',
      'Donker houten meubel \u2192 berken multiplex zwevend meubel',
      'Bruine vloer \u2192 warme eikenlook porseleinen planken',
      'Dubbele ronde spiegels in eikenhouten lijst',
    ],
    investment: '\u20AC14.000 \u2013 \u20AC19.000',
    duration: '7-9 werkdagen',
    area: 'ca. 7 m\u00B2',
    style: 'scandinavisch',
    tags: ['Scandinavisch', 'Gezinsbadkamer'],
  },
  {
    id: 12,
    image: '/inspiratie/inspiratie-12-donker-sfeervol.webp',
    title: 'Donker & Sfeervol — Boutique',
    context: 'Appartement, ca. 5 m\u00B2',
    changes: [
      'Witte tegels \u2192 matzwarte grootformaat tegels',
      'Witte muren \u2192 diepe houtskool kalkpleister',
      'Bad \u2192 inloopdouche met donkergroene marmerlook platen',
      'Witte wastafel op donker eiken meubel als contrast',
      'Geborsteld gouden kraan, spiegel en accessoires',
    ],
    investment: '\u20AC12.000 \u2013 \u20AC17.000',
    duration: '6-8 werkdagen',
    area: 'ca. 5 m\u00B2',
    style: 'modern',
    tags: ['Modern', 'Midden'],
  },
  {
    id: 13,
    image: '/inspiratie/inspiratie-13-douchecabine-inloopdouche.webp',
    title: 'Douchecabine \u2192 Inloopdouche',
    context: 'Rijtjeshuis, ca. 4 m\u00B2',
    changes: [
      'Afgesloten plastic douchecabine volledig verwijderd',
      'Drempelvrije inloopdouche met twee glazen panelen',
      'Doorlopende cementlook tegels voor ruimtelijk effect',
      'Lineaire douchegoot in plaats van verhoogde douchebak',
      'Ruimte voelt direct groter door open karakter',
    ],
    investment: '\u20AC6.000 \u2013 \u20AC10.000',
    duration: '3-5 werkdagen',
    area: 'ca. 4 m\u00B2',
    style: 'modern',
    tags: ['Kleine badkamer', 'Budget'],
  },
  {
    id: 14,
    image: '/inspiratie/inspiratie-14-mediterraans-warm.webp',
    title: 'Mediterraans Warm',
    context: 'Tussenwoning, ca. 6 m\u00B2',
    changes: [
      'Blauwgrijze koude tegels \u2192 warme terracotta porseleintegels',
      'Kale wanden \u2192 handgemaakte cr\u00E8me zellige tegels',
      'Bad \u2192 inloopdouche met boogvormige nis',
      'Zwevend eiken meubel met geribbeld front',
      'Vergrijsd messing kranen en accessoires',
      'Linnen raamgordijn in plaats van rolgordijn',
    ],
    investment: '\u20AC14.000 \u2013 \u20AC19.000',
    duration: '7-8 werkdagen',
    area: 'ca. 6 m\u00B2',
    style: 'warm',
    tags: ['Warm & Natuurlijk', 'Midden'],
  },
];

const ALL_FILTERS = [
  'Alle', 'Kleine badkamer', 'Gezinsbadkamer', 'Zolderbadkamer',
  'Senioren', 'Budget', 'Midden', 'Luxe', 'Industrieel',
  'Scandinavisch', 'Modern', 'Warm & Natuurlijk',
];

const faqs = [
  {
    q: 'Zijn dit echte renovaties?',
    a: 'Deze visualisaties zijn gegenereerd met onze AI Badkamer Planner op basis van typische Nederlandse badkamers. Ze tonen wat er mogelijk is met verschillende budgetten en stijlen. Elke situatie is uniek \u2014 gebruik de AI Planner om een visualisatie te krijgen op basis van uw eigen badkamer.',
  },
  {
    q: 'Kloppen de genoemde prijzen?',
    a: 'De prijsindicaties zijn gebaseerd op actuele marktprijzen in Nederland (februari 2026), inclusief materialen, arbeid en BTW. Exacte kosten hangen af van uw specifieke situatie, locatie en materiaalkeuzes. Vraag een gratis offerte aan voor een nauwkeurige prijsopgave.',
  },
  {
    q: 'Kan ik dezelfde stijl kiezen in de AI Planner?',
    a: 'Ja. Alle getoonde stijlen zijn beschikbaar als voorkeur in onze AI Planner. U kunt ook eigen inspiratiefoto\u2019s uploaden of een Pinterest-link plakken.',
  },
];

export default function InspiratiePage() {
  useSEO({
    title: 'Badkamer Inspiratie 2026 | Voor & Na Renovaties - De Badkamer',
    description: 'Bekijk realistische voor- en na-visualisaties van badkamerrenovaties. Van kleine badkamer tot luxe verbouwing. Ontdek wat er mogelijk is met uw ruimte.',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>(['Alle']);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const touchStartX = React.useRef<number | null>(null);

  const toggleFilter = (filter: string) => {
    if (filter === 'Alle') {
      setActiveFilters(['Alle']);
      return;
    }
    setActiveFilters((prev) => {
      const without = prev.filter((f) => f !== 'Alle' && f !== filter);
      if (prev.includes(filter)) {
        return without.length === 0 ? ['Alle'] : without;
      }
      return [...without, filter];
    });
  };

  const filteredCards = activeFilters.includes('Alle')
    ? inspiratieCards
    : inspiratieCards.filter((card) =>
        activeFilters.some((f) => card.tags.includes(f))
      );

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = useCallback(
    (dir: number) => {
      if (lightboxIndex === null) return;
      const len = filteredCards.length;
      setLightboxIndex((lightboxIndex + dir + len) % len);
    },
    [lightboxIndex, filteredCards.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [lightboxIndex, navigateLightbox]);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Wat is er mogelijk met <span className="text-primary">uw</span> badkamer?
          </h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Realistische voor- en na-visualisaties van badkamerrenovaties in Nederland.
            Van opfrisbeurt tot complete verbouwing.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {ALL_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilters.includes(filter)
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCards.map((card, idx) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className="relative cursor-pointer overflow-hidden group"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-lg font-black tracking-tight text-neutral-900">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-500 mb-4">{card.context}</p>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    Wat is er veranderd:
                  </p>
                  <ul className="space-y-1">
                    {card.changes.map((change, i) => (
                      <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">&bull;</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-neutral-50 rounded-xl p-3 text-center">
                    <Euro size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.investment}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Investering</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 text-center">
                    <Clock size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.duration}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Doorlooptijd</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 text-center">
                    <Ruler size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.area}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Oppervlakte</p>
                  </div>
                </div>

                <Link
                  to={`/planner?style=${card.style}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group/cta"
                >
                  Probeer dit met uw eigen badkamer
                  <ArrowRight size={16} className="transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg">Geen resultaten voor deze filters.</p>
            <button
              onClick={() => setActiveFilters(['Alle'])}
              className="mt-4 text-primary font-bold text-sm hover:underline"
            >
              Toon alle transformaties
            </button>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-b from-neutral-50 to-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 mb-3">
            Benieuwd wat er mogelijk is met uw badkamer?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Upload een foto en ontvang binnen enkele minuten een persoonlijke visualisatie — inclusief prijsindicatie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Start AI Visualisatie — Gratis
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/offerte-aanvragen"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors"
            >
              Ontvang Offertes
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-8 pb-16 md:pb-20">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 mb-6 text-center">
          Veelgestelde vragen
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="font-bold text-sm text-neutral-900">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-neutral-400 transition-transform shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && filteredCards[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            className="absolute left-3 md:left-6 text-white/50 hover:text-white transition-colors z-10"
          >
            <ChevronLeft size={36} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            className="absolute right-3 md:right-6 text-white/50 hover:text-white transition-colors z-10"
          >
            <ChevronRight size={36} />
          </button>

          <div
            className="max-w-6xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) > 50) {
                navigateLightbox(delta < 0 ? 1 : -1);
              }
              touchStartX.current = null;
            }}
          >
            <img
              src={filteredCards[lightboxIndex].image}
              alt={filteredCards[lightboxIndex].title}
              className="w-full rounded-lg object-contain max-h-[85vh]"
            />
            <p className="text-white/80 text-center mt-4 font-bold text-sm">
              {filteredCards[lightboxIndex].title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
