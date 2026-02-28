import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ChevronLeft, ChevronRight, DollarSign, Clock, Ruler, ChevronDown } from 'lucide-react';
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
    title: 'Small bathroom — Modern',
    context: 'Row house, ~43 sq ft',
    changes: [
      'Shower stall → walk-in shower with glass panel',
      'Standard toilet → wall-hung toilet',
      'Pedestal sink → floating vanity in oak',
      'Small white tiles → large-format concrete-look tiles',
    ],
    investment: '$9,000 – $13,000',
    duration: '4–5 days',
    area: '~43 sq ft',
    style: 'modern',
    tags: ['Small bathroom', 'Modern', 'Budget'],
  },
  {
    id: 2,
    image: '/inspiratie/inspiratie-02-gezinsbadkamer-scandinavisch.webp',
    title: 'Family bathroom — Scandinavian Modern',
    context: 'Row house, ~65 sq ft',
    changes: [
      'Beige tiles → white marble-look porcelain',
      'Old bathtub → walk-in shower with rainfall head',
      'Single vanity → double vanity with two mirrors',
      'Brown floor → light gray large-format tiles',
      'Radiator → matte black towel radiator',
    ],
    investment: '$15,000 – $19,000',
    duration: '7–8 days',
    area: '~65 sq ft',
    style: 'scandinavisch',
    tags: ['Family bathroom', 'Mid-range', 'Scandinavian'],
  },
  {
    id: 3,
    image: '/inspiratie/inspiratie-03-ruime-badkamer-luxe.webp',
    title: 'Spacious bathroom — Hotel Luxury',
    context: 'Detached home, ~97 sq ft',
    changes: [
      'Corner tub → freestanding oval tub as centerpiece',
      'Separate shower → spacious walk-in with dual showerhead',
      'Cherry wood vanity → floating walnut vanity',
      'Seafoam tiles → Calacatta marble-look wall tiles',
      'Bidet removed — space gained',
    ],
    investment: '$22,000 – $30,000',
    duration: '10–12 days',
    area: '~97 sq ft',
    style: 'luxe',
    tags: ['Luxury', 'Family bathroom'],
  },
  {
    id: 4,
    image: '/inspiratie/inspiratie-04-zolderbadkamer-slim.webp',
    title: 'Attic bathroom — Smart design',
    context: 'Converted attic with sloped ceiling, ~54 sq ft',
    changes: [
      'Shower tub with curtain → sunken walk-in under slope',
      'Zellige tiles on sloped shower wall as accent',
      'Small pedestal → compact floating vanity in light oak',
      'Vinyl → continuous light gray concrete-look tiles',
      'Skylight brings more light into the space',
    ],
    investment: '$11,000 – $16,000',
    duration: '5–7 days',
    area: '~54 sq ft',
    style: 'modern',
    tags: ['Attic bathroom', 'Modern'],
  },
  {
    id: 5,
    image: '/inspiratie/inspiratie-05-apart-toilet-boutique.webp',
    title: 'Half bath — Boutique style',
    context: 'Row house, ~11 sq ft',
    changes: [
      'Standard toilet → wall-hung with concealed tank',
      'White tiles → deep forest green painted walls',
      'Linoleum → black hexagonal mosaic tiles',
      'Bare bulb → recessed light + sconce',
      'Brass accents for boutique hotel feel',
    ],
    investment: '$2,700 – $4,500',
    duration: '1–2 days',
    area: '~11 sq ft',
    style: 'modern',
    tags: ['Small bathroom', 'Budget'],
  },
  {
    id: 6,
    image: '/inspiratie/inspiratie-06-jaren-80-transformatie.webp',
    title: '1980s bathroom — Total transformation',
    context: 'Townhouse, ~54 sq ft',
    changes: [
      'Pink fixtures fully replaced with white',
      'Pink tiles → terrazzo-look porcelain',
      'Bathtub → spacious walk-in shower with black frame',
      'Floating vanity in sage green as style accent',
      'Matte black faucets and accessories',
    ],
    investment: '$13,000 – $17,000',
    duration: '6–8 days',
    area: '~54 sq ft',
    style: 'modern',
    tags: ['Mid-range', 'Modern'],
  },
  {
    id: 7,
    image: '/inspiratie/inspiratie-07-en-suite-slaapkamer.webp',
    title: 'En-suite — Extension of the bedroom',
    context: 'Master bedroom, ~43 sq ft',
    changes: [
      'Plastic shower stall → open walk-in with glass panel',
      'Laminate vanity → slim floating vanity in white/oak',
      'Door removed — open flow from bedroom to bathroom',
      'Floor continues from bedroom for seamless look',
    ],
    investment: '$11,000 – $15,000',
    duration: '5–6 days',
    area: '~43 sq ft',
    style: 'modern',
    tags: ['Modern', 'Mid-range'],
  },
  {
    id: 8,
    image: '/inspiratie/inspiratie-08-samenvoegen-bad-toilet.webp',
    title: 'Combining bathroom + toilet',
    context: 'Row house, ~54 sq ft (combined)',
    changes: [
      'Wall removed — two small spaces become one',
      'Two doors → one wide opening',
      'Two separate floors → continuous limestone-look tile',
      'Room for walk-in shower + compact freestanding tub',
      '30–50% more usable space',
    ],
    investment: '$19,000 – $27,000',
    duration: '8–10 days',
    area: '~54 sq ft',
    style: 'modern',
    tags: ['Family bathroom', 'Mid-range'],
  },
  {
    id: 9,
    image: '/inspiratie/inspiratie-09-senioren-veilig-stijlvol.webp',
    title: 'Aging-in-place bathroom — Safe & stylish',
    context: 'Single-level home, ~65 sq ft',
    changes: [
      'High tub → curbless walk-in shower with bench',
      'Slippery floor → slip-resistant matte tiles (R10)',
      'Standard toilet → comfort-height (18" seat)',
      'Subtle grab bars integrated into design',
      'Good lighting throughout',
    ],
    investment: '$15,000 – $21,000',
    duration: '7–9 days',
    area: '~65 sq ft',
    style: 'modern',
    tags: ['Aging-in-place', 'Mid-range'],
  },
  {
    id: 10,
    image: '/inspiratie/inspiratie-10-industrieel-loft.webp',
    title: 'Industrial loft',
    context: 'Apartment, ~75 sq ft',
    changes: [
      'White tiles → polished dark concrete floor',
      'Accent wall in exposed brick',
      'White acrylic tub → freestanding matte black tub',
      'Reclaimed wood vanity on steel brackets',
      'Black steel shower enclosure in factory-window style',
      'Copper faucet with patina as accent',
    ],
    investment: '$17,000 – $24,000',
    duration: '8–10 days',
    area: '~75 sq ft',
    style: 'industrieel',
    tags: ['Industrial', 'Mid-range'],
  },
  {
    id: 11,
    image: '/inspiratie/inspiratie-11-scandinavisch-gezin.webp',
    title: 'Light family bathroom — Scandinavian',
    context: 'Townhouse, ~75 sq ft',
    changes: [
      'Cream tiles with mosaic border → white handmade zellige',
      'Corner tub with broken jets → built-in tub with tile surround',
      'Dark wood vanity → birch ply floating vanity',
      'Brown floor → warm oak-look porcelain planks',
      'Dual round mirrors in oak frames',
    ],
    investment: '$15,000 – $20,000',
    duration: '7–9 days',
    area: '~75 sq ft',
    style: 'scandinavisch',
    tags: ['Scandinavian', 'Family bathroom'],
  },
  {
    id: 12,
    image: '/inspiratie/inspiratie-12-donker-sfeervol.webp',
    title: 'Dark & moody — Boutique',
    context: 'Apartment, ~54 sq ft',
    changes: [
      'White tiles → matte black large-format tiles',
      'White walls → deep charcoal plaster',
      'Tub → walk-in shower with dark green marble-look slabs',
      'White sink on dark oak vanity for contrast',
      'Brushed gold faucet, mirror, and accessories',
    ],
    investment: '$13,000 – $18,000',
    duration: '6–8 days',
    area: '~54 sq ft',
    style: 'modern',
    tags: ['Modern', 'Mid-range'],
  },
  {
    id: 13,
    image: '/inspiratie/inspiratie-13-douchecabine-inloopdouche.webp',
    title: 'Shower stall → Walk-in shower',
    context: 'Row house, ~43 sq ft',
    changes: [
      'Enclosed plastic shower stall fully removed',
      'Curbless walk-in shower with two glass panels',
      'Continuous cement-look tiles for spacious feel',
      'Linear drain instead of raised shower base',
      'Space feels instantly larger with open layout',
    ],
    investment: '$6,500 – $11,000',
    duration: '3–5 days',
    area: '~43 sq ft',
    style: 'modern',
    tags: ['Small bathroom', 'Budget'],
  },
  {
    id: 14,
    image: '/inspiratie/inspiratie-14-mediterraans-warm.webp',
    title: 'Mediterranean warm',
    context: 'Townhouse, ~65 sq ft',
    changes: [
      'Cool blue-gray tiles → warm terracotta porcelain tiles',
      'Bare walls → handmade cream zellige tiles',
      'Tub → walk-in shower with arched niche',
      'Floating oak vanity with ribbed front',
      'Brushed brass faucets and accessories',
      'Linen window treatment instead of roller blind',
    ],
    investment: '$15,000 – $20,000',
    duration: '7–8 days',
    area: '~65 sq ft',
    style: 'warm',
    tags: ['Warm & Natural', 'Mid-range'],
  },
];

const ALL_FILTERS = [
  'All', 'Small bathroom', 'Family bathroom', 'Attic bathroom',
  'Aging-in-place', 'Budget', 'Mid-range', 'Luxury', 'Industrial',
  'Scandinavian', 'Modern', 'Warm & Natural',
];

const faqs = [
  {
    q: 'Are these real renovations?',
    a: 'These visualizations are generated with our AI Bathroom Planner based on typical US bathrooms. They show what\'s possible with different budgets and styles. Every situation is unique — use the AI Planner to get a visualization based on your own bathroom.',
  },
  {
    q: 'Are the prices accurate?',
    a: 'Price estimates are based on current US market rates (February 2026), including materials, labor, and taxes. Exact costs depend on your specific situation, location, and material choices. Request a free quote for an accurate estimate.',
  },
  {
    q: 'Can I choose the same style in the AI Planner?',
    a: 'Yes. All shown styles are available as preferences in our AI Planner. You can also upload your own inspiration photos or paste a Pinterest link.',
  },
];

export default function InspiratiePage() {
  useSEO({
    title: 'Bathroom Inspiration 2026 | Before & After Renovations - Bathroom Tiles',
    description: 'View realistic before-and-after visualizations of bathroom renovations. From small bathroom to luxury remodel. Discover what\'s possible with your space.',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const touchStartX = React.useRef<number | null>(null);

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setActiveFilters(['All']);
      return;
    }
    setActiveFilters((prev) => {
      const without = prev.filter((f) => f !== 'All' && f !== filter);
      if (prev.includes(filter)) {
        return without.length === 0 ? ['All'] : without;
      }
      return [...without, filter];
    });
  };

  const filteredCards = activeFilters.includes('All')
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
            What&apos;s possible with <span className="text-primary">your</span> bathroom?
          </h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Realistic before-and-after visualizations of bathroom renovations.
            From refresh to complete remodel.
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
                    What changed:
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
                    <DollarSign size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.investment}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Investment</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 text-center">
                    <Clock size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.duration}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Duration</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 text-center">
                    <Ruler size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs font-bold text-neutral-900 leading-tight">{card.area}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Area</p>
                  </div>
                </div>

                <Link
                  to={`/planner?style=${card.style}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group/cta"
                >
                  Try this with your own bathroom
                  <ArrowRight size={16} className="transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg">No results for these filters.</p>
            <button
              onClick={() => setActiveFilters(['All'])}
              className="mt-4 text-primary font-bold text-sm hover:underline"
            >
              Show all transformations
            </button>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-b from-neutral-50 to-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 mb-3">
            Curious what&apos;s possible with your bathroom?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Upload a photo and get a personalized visualization in minutes — including price estimate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Start AI Visualization — Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/get-quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors"
            >
              Get Quotes
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-8 pb-16 md:pb-20">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 mb-6 text-center">
          Frequently asked questions
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
