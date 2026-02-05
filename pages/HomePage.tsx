import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, ClipboardList, Users, Star, ChevronDown, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';

const stats = [
  { value: '500+', label: 'Projecten Gematcht' },
  { value: '150+', label: 'Vakspecialisten' },
  { value: '4.8/5', label: 'Klanttevredenheid' },
];

const steps = [
  { icon: ClipboardList, title: 'Beschrijf uw project', description: 'Vertel ons over uw badkamer en uw wensen. Het duurt slechts 2 minuten.' },
  { icon: Users, title: 'Wij matchen vakmensen', description: 'Wij vinden de beste lokale specialisten die passen bij uw project en budget.' },
  { icon: Star, title: 'Ontvang gratis offertes', description: 'Vergelijk vrijblijvende offertes en kies de specialist die bij u past.' },
];

const trustBadges = [
  { icon: ShieldCheck, text: 'Gratis & Vrijblijvend' },
  { icon: Users, text: 'Lokale Vakmensen' },
  { icon: Clock, text: 'Binnen 24 uur reactie' },
  { icon: MapPin, text: 'NL & BE dekking' },
];

const costOverview = [
  { item: 'Complete badkamer (9 m\u00B2)', range: '\u20AC 3.500 \u2013 \u20AC 15.000' },
  { item: 'Douche', range: '\u20AC 500 \u2013 \u20AC 2.000' },
  { item: 'Toilet', range: '\u20AC 450 \u2013 \u20AC 900' },
  { item: 'Wastafel', range: '\u20AC 200 \u2013 \u20AC 1.000' },
  { item: 'Vloertegels', range: '\u20AC 700 \u2013 \u20AC 1.800' },
  { item: 'Ligbad', range: '\u20AC 700 \u2013 \u20AC 1.500' },
];

const faqs = [
  {
    q: 'Wat kost een badkamer renovatie?',
    a: 'Gemiddeld kost een complete badkamerrenovatie tussen de \u20AC 3.500 en \u20AC 15.000, afhankelijk van de grootte van uw badkamer, de gekozen materialen en de gewenste afwerking. Voor een standaard badkamer van 9 m\u00B2 met basis sanitair begint u rond \u20AC 3.500. Een luxe renovatie met premium materialen kan oplopen tot \u20AC 15.000 of meer.',
  },
  {
    q: 'Hoeveel kost een badkamer renovatie per m\u00B2?',
    a: 'De kosten voor een badkamerrenovatie liggen gemiddeld tussen \u20AC 390 en \u20AC 1.700 per vierkante meter. Dit is inclusief materialen, arbeid en afvoer. De exacte prijs hangt af van uw materiaalwensen en de complexiteit van de renovatie.',
  },
  {
    q: 'Hoe lang duurt een badkamer renovatie?',
    a: 'Een gemiddelde badkamerrenovatie duurt 1 tot 3 weken. Een eenvoudige opfrisbeurt kan in 1 week klaar zijn, terwijl een volledige renovatie met verplaatsing van leidingen tot 3 weken kan duren. Een goede planning en tijdige materiaalkeuze helpen de doorlooptijd te verkorten.',
  },
  {
    q: 'Kan ik mijn badkamer zelf renoveren?',
    a: 'Sommige werkzaamheden zoals schilderen en kleine aanpassingen kunt u zelf doen. Voor loodgieterswerk, elektra en tegelwerk raden wij altijd een vakspecialist aan. Dit garandeert de kwaliteit en voorkomt kostbare fouten. Via De Badkamer vindt u eenvoudig gekwalificeerde vakmensen.',
  },
  {
    q: 'Is de offerte echt gratis en vrijblijvend?',
    a: 'Ja, het aanvragen van offertes via De Badkamer is volledig gratis en vrijblijvend. U ontvangt offertes van lokale vakmensen en beslist zelf of en met wie u in zee gaat. Er zijn geen verplichtingen aan verbonden.',
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Badkamer Renovatie | Gratis Offertes NL & BE - De Badkamer</title>
        <meta name="description" content="Vergelijk gratis offertes voor uw badkamer renovatie. Kosten vanaf \u20AC3.500. Lokale vakmensen in Nederland en Belgi\u00EB. Binnen 24 uur reactie." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary font-semibold text-sm mb-4 tracking-wide">Badkamer renovatie in Nederland & Belgie</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-neutral-900 mb-6">
                Uw droomkamer begint met het juiste <span className="text-primary">plan</span>.
              </h1>
              <p className="text-lg text-neutral-700 leading-relaxed mb-8 max-w-lg">
                Vergelijk gratis offertes van gekwalificeerde badkamerspecialisten bij u in de buurt. Gemiddelde kosten: <strong>&euro;3.500 &ndash; &euro;15.000</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/offerte-aanvragen"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
                >
                  Ontvang Gratis Offertes <ArrowRight size={18} />
                </Link>
                <Link
                  to="/planner"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-base px-8 py-4 rounded-full transition-all hover:border-primary hover:text-primary"
                >
                  <Sparkles size={18} /> AI Badkamer Planner
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                <img
                  src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
                  alt="Moderne badkamer renovatie"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm text-neutral-900">500+ projecten</p>
                  <p className="text-xs text-neutral-500">succesvol gematcht</p>
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
            <p className="text-primary font-semibold text-sm mb-3">Hoe het werkt</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">In 3 stappen naar uw nieuwe badkamer</h2>
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
              <p className="text-primary font-semibold text-sm mb-3">Kosten overzicht</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Wat kost een badkamer renovatie?</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">Een overzicht van de gemiddelde kosten per onderdeel, inclusief materiaal en montage.</p>
              <div className="space-y-0 border border-neutral-300/50 rounded-2xl overflow-hidden">
                {costOverview.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-neutral-100/50' : 'bg-white'}`}>
                    <span className="text-sm font-medium text-neutral-700">{item.item}</span>
                    <span className="text-sm font-bold text-neutral-900">{item.range}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/badkamer-renovatie-kosten"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm mt-6 hover:underline"
              >
                Bekijk uitgebreid kostenoverzicht <ArrowRight size={14} />
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
                <p className="text-white/70 font-semibold text-sm mb-3">Exclusieve tool</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Visualiseer uw nieuwe badkamer met AI</h2>
                <p className="text-white/80 leading-relaxed mb-8">Upload een foto van uw huidige badkamer en ontvang direct een AI-gegenereerde visualisatie van uw droomkamer, inclusief prijsindicatie.</p>
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl"
                >
                  <Sparkles size={18} /> Start de AI Planner <ArrowRight size={16} />
                </Link>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&dpr=1"
                  alt="AI badkamer visualisatie"
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
            <p className="text-primary font-semibold text-sm mb-3">Veelgestelde vragen</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">Alles over badkamer renovatie</h2>
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
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Klaar om te beginnen?</h2>
          <p className="text-neutral-500 mb-8 text-lg">Ontvang gratis en vrijblijvend offertes van lokale badkamerspecialisten.</p>
          <Link
            to="/offerte-aanvragen"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
          >
            Ontvang Gratis Offertes <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
