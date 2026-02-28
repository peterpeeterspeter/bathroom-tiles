import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Info, Sparkles } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';
import { useSEO } from '../lib/useSEO';

const mainCosts = [
  { item: 'Tile renovation (floor + walls, ~100 sq ft)', low: '4,000', high: '12,000', note: 'Materials + labor' },
  { item: 'Floor tiles only', low: '1,200', high: '2,500', note: 'Ceramic or porcelain' },
  { item: 'Wall tiles only', low: '1,500', high: '3,000', note: 'Standard to premium' },
  { item: 'Demo & prep', low: '800', high: '1,500', note: 'Removal, leveling' },
  { item: 'Labor (per hour)', low: '45', high: '75', note: 'Tile setter rates' },
];

const tiers = [
  {
    name: 'Budget',
    range: '$4,000 – $6,500',
    desc: 'Standard ceramic or porcelain tiles, basic installation. Ideal for a refresh without premium materials.',
    items: ['Standard tiles', 'Basic adhesive & grout', 'Simple layouts', 'Included demo & prep'],
  },
  {
    name: 'Mid',
    range: '$6,500 – $10,000',
    desc: 'Quality porcelain, design tiles, and professional installation. The most popular option.',
    items: ['Porcelain or marble-look tiles', 'Large-format options', 'Decorative accents', 'Professional finish'],
    featured: true,
  },
  {
    name: 'Premium',
    range: '$10,000 – $15,000+',
    desc: 'Premium natural stone or large-format porcelain, expert installation.',
    items: ['Natural stone or premium porcelain', 'Custom layouts', 'Niche details', 'Premium grout & sealant'],
  },
];

const extras = [
  { item: 'Heated floor', price: 'from $500', note: 'Up to ~100 sq ft' },
  { item: 'Niches & shelves', price: '$200 – $600', note: 'Per niche' },
  { item: 'Decorative border', price: '$150 – $400', note: 'Per linear foot' },
];

const tips = [
  'Remove old tiles yourself — save $300–$500 on demo costs if you can handle disposal.',
  'Compare tile brands: often similar quality for 20–40% less.',
  'Choose a contractor near you — saves on travel costs and makes follow-up easier.',
  'Order materials 4–6 weeks ahead — lead times are longer in 2026 due to high demand.',
  'Keep existing tile if it\'s still good — tiling over old tile can save demo and disposal.',
  'Get at least 3 quotes to compare — prices vary significantly by contractor.',
];

export default function KostenPage() {
  useSEO({ title: 'Bathroom Tile Costs 2026 | Prices per Sq Ft - Bathroom Tiles', description: 'What does a bathroom tile renovation cost in 2026? Guide prices: $4,000–$12,000 (materials + labor). Cost per sq ft, by item, and money-saving tips.' });

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <nav className="text-sm text-neutral-500 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">Tile Costs</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 mb-4">What does a bathroom tile renovation cost in 2026?</h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl">
            A tile-only renovation costs on average <strong className="text-neutral-900">$4,000</strong> to <strong className="text-neutral-900">$12,000</strong>, depending on size, materials, and scope. For a standard bathroom of ~100 sq ft, expect $5,000 to $8,000 for floor and wall tiles (materials + labor). Below is a guide to costs — by item, per sq ft, and by quality level.
          </p>
        </div>
      </section>

      {/* Main Cost Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Costs by item</h2>
          <p className="text-neutral-500 text-sm mb-8">Including materials and labor. Based on an average bathroom of ~100 sq ft.</p>
          <div className="border border-neutral-300/50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-primary-dark text-white px-6 py-4">
              <div className="col-span-5 text-sm font-bold">Item</div>
              <div className="col-span-4 text-sm font-bold">Typical price</div>
              <div className="col-span-3 text-sm font-bold hidden sm:block">Note</div>
            </div>
            {mainCosts.map((cost, i) => (
              <div key={i} className={`grid grid-cols-12 px-6 py-4 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-100/50'}`}>
                <div className="col-span-5 text-sm font-medium text-neutral-700">{cost.item}</div>
                <div className="col-span-4 text-sm font-bold text-neutral-900">${cost.low} &ndash; ${cost.high}</div>
                <div className="col-span-3 text-xs text-neutral-500 hidden sm:block">{cost.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Price examples</h2>
          <p className="text-neutral-500 text-sm mb-10">Three scenarios for a bathroom of ~100 sq ft, including materials and labor.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`rounded-2xl p-6 border-2 ${tier.featured ? 'border-primary bg-primary-light/30' : 'border-neutral-300/50 bg-white'}`}>
                {tier.featured && <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Most popular</p>}
                <h3 className="text-lg font-bold text-neutral-900 mb-1">{tier.name}</h3>
                <p className="text-2xl font-black text-neutral-900 mb-3">{tier.range}</p>
                <p className="text-sm text-neutral-500 mb-5">{tier.desc}</p>
                <ul className="space-y-2">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle size={14} className="text-success flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline Lead Form */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <InlineLeadForm />
        </div>
      </section>

      {/* Per sq ft */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Cost per square foot</h2>
          <p className="text-neutral-500 leading-relaxed mb-4">
            Average cost per sq ft runs between <strong className="text-neutral-900">$12</strong> and <strong className="text-neutral-900">$35</strong> — including materials, labor, and demo. For typical bathrooms:
          </p>
          <div className="border border-neutral-300/50 rounded-xl overflow-hidden mb-6">
            <div className="flex justify-between items-center px-6 py-3 bg-neutral-100/50">
              <span className="text-sm font-medium text-neutral-700">Small (25–40 sq ft)</span>
              <span className="text-sm font-bold text-neutral-900">$2,500 – $5,000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3 bg-white">
              <span className="text-sm font-medium text-neutral-700">Medium (40–65 sq ft)</span>
              <span className="text-sm font-bold text-neutral-900">$4,000 – $8,000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3 bg-neutral-100/50">
              <span className="text-sm font-medium text-neutral-700">Large (65+ sq ft)</span>
              <span className="text-sm font-bold text-neutral-900">$6,000 – $12,000</span>
            </div>
          </div>
          <p className="text-neutral-500 leading-relaxed mb-6">
            Prices tend to run 10–15% higher in major metro areas. Exact costs depend on your layout, tile choice, and local contractor rates.
          </p>
          <div className="bg-primary-light/50 rounded-xl p-6 flex items-start gap-4">
            <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-700">
              Prices are indicative and may vary based on your situation. Request a <Link to="/get-quote" className="text-primary font-semibold hover:underline">free quote</Link> for an exact price.
            </p>
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Extra options and costs</h2>
          <div className="space-y-4">
            {extras.map((extra) => (
              <div key={extra.item} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl border border-neutral-300/50 p-5 gap-2">
                <div>
                  <p className="font-bold text-neutral-900">{extra.item}</p>
                  <p className="text-xs text-neutral-500">{extra.note}</p>
                </div>
                <p className="font-bold text-neutral-900 whitespace-nowrap">{extra.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Money-saving tips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-primary-light/30 rounded-xl p-5">
                <CheckCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 mb-4">Want to know what your bathroom will cost?</h2>
          <p className="text-neutral-500 mb-8">Use the free AI Planner for a personalized estimate, or get no-obligation quotes from contractors in your area.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25"
            >
              <Sparkles size={18} /> Start AI Planner — Free <ArrowRight size={20} />
            </Link>
            <Link
              to="/get-quote"
              className="inline-flex items-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-lg px-10 py-5 rounded-full transition-all hover:border-primary hover:text-primary"
            >
              Get Quotes <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
