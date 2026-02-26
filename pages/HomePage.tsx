import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ClipboardList, Users, Star, ChevronDown, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';
import { useSEO } from '../lib/useSEO';

const stats = [
  { value: '500+', label: 'Happy Homeowners' },
  { value: '150+', label: 'Verified Contractors' },
  { value: '4.8/5', label: 'Customer Rating' },
];

const steps = [
  { icon: ClipboardList, title: 'Upload photo, see result', description: 'Take a photo of your bathroom. Our AI analyzes the space and shows how your tile renovation will look within 2 minutes — with an immediate price estimate.' },
  { icon: Users, title: 'We find your contractor', description: 'No endless searching. We match you with the best certified tile specialists near you, tailored to your style and budget.' },
  { icon: Star, title: 'Compare and save', description: 'Receive up to 3 no-obligation quotes side by side. Compare on price, experience and reviews — and choose with confidence. No obligations, ever.' },
];

const trustBadges = [
  { icon: ShieldCheck, text: '100% Free & No Obligation' },
  { icon: Users, text: '150+ Verified Contractors' },
  { icon: Clock, text: 'Quotes within 24 hours' },
  { icon: MapPin, text: 'Serving the US' },
];

const costOverview = [
  { item: 'Tile renovation (9 m²)', range: '$4,000 – $12,000' },
  { item: 'Floor tiles', range: '$1,200 – $2,500' },
  { item: 'Wall tiles', range: '$1,500 – $3,000' },
  { item: 'Demo & prep', range: '$800 – $1,500' },
  { item: 'Labor (per hour)', range: '$45 – $75' },
];

const faqs = [
  {
    q: 'How much does a bathroom tile renovation cost?',
    a: 'A tile-only renovation typically costs $4,000 to $12,000 in 2026 — depending on size, material choice and scope. A standard 9 m² bathroom falls between $5,000 and $8,000 for floor and wall tiles (materials + labor). Our AI Planner calculates exactly what your choices will cost.',
  },
  {
    q: 'How much per square foot for tile work?',
    a: 'Expect $12–$35 per sq ft for tile installation in 2026. A small bathroom (25–40 sq ft) runs $2,500–$5,000, medium (40–65 sq ft) $4,000–$8,000, and large (65+ sq ft) $6,000–$12,000. Price depends on tile grade and prep work needed.',
  },
  {
    q: 'How long does a tile renovation take?',
    a: 'Tile refresh only: 2–6 working days. Full floor and wall tile replacement: 1–2 weeks. Pro tip: order materials at least 4 weeks ahead to avoid delays.',
  },
  {
    q: 'Can I do bathroom tiling myself?',
    a: 'Painting and minor tweaks you can do yourself. But for tile work we always recommend a licensed contractor — mistakes cost more in the long run than the savings. Our network quickly connects you with reliable tile pros.',
  },
  {
    q: 'What tile trends are popular in 2026?',
    a: 'Large-format porcelain, marble-look tiles, and warm neutrals remain top choices. Sustainable materials with 25+ year lifespans and comfort over flashy luxury. Our AI Planner helps you visualize the latest styles in your own space.',
  },
  {
    q: 'Is the quote really free and no obligation?',
    a: 'Yes, 100%. You receive quotes from verified local contractors and decide entirely for yourself whether and with whom to proceed. No obligations, no hidden fees, no surprises.',
  },
];

export default function HomePage() {
  useSEO({ title: 'Bathroom Tile Renovation | AI Visualization & Free Quotes - Bathroom Tiles', description: 'See your new bathroom before you start. Upload a photo, get an AI visualization and compare free quotes from 150+ contractors across the US.' });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary font-semibold text-sm mb-4 tracking-wide">US tile renovation — AI visualization</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-neutral-900 mb-6">
                Your dream bathroom in view <span className="text-primary">— in 2 minutes</span>.
              </h1>
              <p className="text-lg text-neutral-700 leading-relaxed mb-4 max-w-lg">
                Upload a photo of your bathroom and our AI shows how your tile renovation will look. Choose your style, compare prices and get no-obligation quotes from certified contractors near you.
              </p>
              <p className="text-sm text-neutral-500 mb-8 max-w-lg">
                Average investment: <strong className="text-neutral-700">$4,000 &ndash; $12,000</strong> (tiles, labor). No surprises.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/planner"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} /> Visualize Your Bathroom <ArrowRight size={18} />
                </Link>
                <Link
                  to="/get-quote"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-base px-8 py-4 rounded-full transition-all hover:border-primary hover:text-primary"
                >
                  Get Free Quotes <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                <video
                  src="/hero-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm text-neutral-900">500+ homeowners</p>
                  <p className="text-xs text-neutral-500">went before you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-y border-neutral-300/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <badge.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-neutral-700">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm mb-3">Simple. Fast. Smart.</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">From photo to quote &mdash; in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-300/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <s.icon size={24} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="absolute top-6 right-6 text-6xl font-black text-neutral-300/30">{i + 1}</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Overview + Lead Form */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-primary font-semibold text-sm mb-3">Transparent pricing</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Know what you pay &mdash; before you start</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">2026 guide prices per item — including materials and labor. No hidden costs.</p>
              <div className="space-y-0 border border-neutral-300/50 rounded-2xl overflow-hidden">
                {costOverview.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-neutral-100/50' : 'bg-white'}`}>
                    <span className="text-sm font-medium text-neutral-700">{item.item}</span>
                    <span className="text-sm font-bold text-neutral-900">{item.range}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/tile-costs"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm mt-6 hover:underline"
              >
                View full cost overview <ArrowRight size={14} />
              </Link>
            </div>
            <div>
              <InlineLeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-5xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-sm text-white/70 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Planner CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-br from-primary-dark to-primary rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-white/70 font-semibold text-sm mb-3">Exclusive AI tool — free for everyone</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Don't dream — see. Before the first tile goes in.</h2>
                <p className="text-white/80 leading-relaxed mb-8">Upload a photo, choose your style and materials, and get a photorealistic AI visualization of your new bathroom — plus a personalized cost estimate based on your sq ft and choices. No surprises.</p>
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl"
                >
                  <Sparkles size={18} /> Start Free Visualization <ArrowRight size={16} />
                </Link>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&dpr=1"
                  alt="AI bathroom visualization"
                  className="w-full h-[300px] md:h-[350px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm mb-3">Frequently asked questions</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">Your questions, honestly answered</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-neutral-300/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-neutral-100/50 transition-colors"
                >
                  <span className="font-semibold text-neutral-900 pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-neutral-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 animate-fade-in">
                    <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-100 py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Your dream bathroom starts here</h2>
          <p className="text-neutral-500 mb-8 text-lg">See in 2 minutes how your new bathroom will look, or get no-obligation quotes from contractors near you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
            >
              <Sparkles size={20} /> Visualize Your Bathroom <ArrowRight size={20} />
            </Link>
            <Link
              to="/get-quote"
              className="inline-flex items-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-lg px-10 py-5 rounded-full transition-all hover:border-primary hover:text-primary"
            >
              Get Free Quotes <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
