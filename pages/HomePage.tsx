import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ClipboardList, Users, Star, ChevronDown, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';
import { useSEO } from '../lib/useSEO';

const stats = [
  { value: '500+', label: 'Tevreden Huiseigenaren' },
  { value: '150+', label: 'Gecertificeerde Vakmensen' },
  { value: '4.8/5', label: 'Klantbeoordeling' },
];

const steps = [
  { icon: ClipboardList, title: 'Foto uploaden, resultaat zien', description: 'Maak een foto van uw huidige badkamer. Onze AI analyseert de ruimte en toont binnen 2 minuten hoe uw renovatie eruitziet — met directe prijsindicatie.' },
  { icon: Users, title: 'Wij vinden uw vakman', description: 'Geen eindeloos zoeken. Wij matchen u automatisch met de beste gecertificeerde specialisten bij u in de buurt, afgestemd op uw wensen en budget.' },
  { icon: Star, title: 'Vergelijk en bespaar', description: 'Ontvang tot 3 vrijblijvende offertes naast elkaar. Vergelijk op prijs, ervaring en reviews — en kies met vertrouwen. Geen verplichtingen, nooit.' },
];

const trustBadges = [
  { icon: ShieldCheck, text: '100% Gratis & Vrijblijvend' },
  { icon: Users, text: '150+ Geverifieerde Vakmensen' },
  { icon: Clock, text: 'Offertes binnen 24 uur' },
  { icon: MapPin, text: 'Heel Nederland & België' },
];

const costOverview = [
  { item: 'Complete badkamer (9 m²)', range: '€ 8.000 – € 25.000' },
  { item: 'Douche', range: '€ 500 – € 2.000' },
  { item: 'Toilet', range: '€ 450 – € 900' },
  { item: 'Wastafel + meubel', range: '€ 200 – € 1.000' },
  { item: 'Vloertegels', range: '€ 700 – € 1.800' },
  { item: 'Ligbad', range: '€ 700 – € 1.500' },
  { item: 'Arbeid (per uur)', range: '€ 40 – € 70' },
];

const faqs = [
  {
    q: 'Wat kost een badkamer renovatie?',
    a: 'Een complete renovatie kost gemiddeld €8.000 tot €25.000 in 2026 — afhankelijk van grootte, materialen en afwerking. Een standaard badkamer van 9 m² valt meestal tussen €14.000 en €18.500 (materiaal + arbeid + BTW). Budget beperkt? Onze AI Planner berekent exact wat uw specifieke wensen kosten.',
  },
  {
    q: 'Hoeveel kost een badkamer renovatie per m²?',
    a: 'Reken op €390 tot €1.700 per m² in 2026. Concreet: een kleine badkamer (2–4 m²) kost €8.000–€15.000, middelgroot (4–6 m²) €12.000–€20.000, en groot (6+ m²) €18.000–€30.000. De prijs hangt af van materiaalwensen en of leidingwerk verplaatst moet worden.',
  },
  {
    q: 'Hoe lang duurt een badkamer renovatie?',
    a: 'Een opfrisbeurt: 2–6 werkdagen. Volledige renovatie met nieuw sanitair en tegelwerk: 1–3 weken. Verbouwing met structurele wijzigingen: 2–4 weken. Pro tip: bestel materialen minstens 4 weken vooruit om vertragingen te voorkomen.',
  },
  {
    q: 'Wat is het verschil tussen een renovatie en een verbouwing?',
    a: 'Renovatie = vernieuwen binnen de bestaande ruimte (nieuw sanitair, tegels, afwerking). Kosten: €8.000–€25.000. Verbouwing = muren verplaatsen, leidingen verleggen of ruimtes samenvoegen. Kosten: €15.000–€35.000+. Twijfelt u? Onze AI Planner analyseert uw situatie en laat zien wat mogelijk is.',
  },
  {
    q: 'Kan ik mijn badkamer zelf renoveren?',
    a: 'Schilderen en kleine aanpassingen kunt u prima zelf. Maar voor loodgieterswerk, elektra en tegelwerk raden wij altijd een vakspecialist aan — fouten kosten u op de lange termijn meer dan de besparing oplevert. Via ons netwerk vindt u snel een betrouwbare vakman.',
  },
  {
    q: 'Welke badkamertrends zijn populair in 2026?',
    a: 'Grote verschuiving naar wandpanelen in plaats van tegels (geen voegen, minder onderhoud). Verder: duurzame materialen met 25+ jaar levensduur en comfort boven opvallende luxe. Regendouches, rimfree toiletten en inbouwkranen zijn inmiddels standaard — zelfs in middenklasse renovaties.',
  },
  {
    q: 'Is de offerte echt gratis en vrijblijvend?',
    a: 'Ja, 100%. U ontvangt offertes van geverifieerde lokale vakmensen en beslist volledig zelf of en met wie u in zee gaat. Geen verplichtingen, geen verborgen kosten, geen verrassingen.',
  },
];

export default function HomePage() {
  useSEO({ title: 'Badkamer Renovatie | AI Visualisatie & Gratis Offertes - De Badkamer', description: 'Zie uw nieuwe badkamer vóórdat u begint. Upload een foto, ontvang een AI-visualisatie en vergelijk gratis offertes van 150+ vakmensen in Nederland en België.' });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary font-semibold text-sm mb-4 tracking-wide">Nr. 1 badkamer renovatieplatform van Nederland & België</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-neutral-900 mb-6">
                Uw droomkamer in beeld <span className="text-primary">— binnen 2 minuten</span>.
              </h1>
              <p className="text-lg text-neutral-700 leading-relaxed mb-4 max-w-lg">
                Upload een foto van uw badkamer en onze AI toont direct hoe uw renovatie eruitziet. Kies uw stijl, vergelijk prijzen en ontvang vrijblijvende offertes van gecertificeerde vakmensen bij u in de buurt.
              </p>
              <p className="text-sm text-neutral-500 mb-8 max-w-lg">
                Gemiddelde investering: <strong className="text-neutral-700">&euro;8.000 &ndash; &euro;25.000</strong> (incl. materiaal, arbeid en BTW). Geen verrassingen achteraf.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/planner"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} /> Visualiseer Uw Badkamer <ArrowRight size={18} />
                </Link>
                <Link
                  to="/offerte-aanvragen"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-base px-8 py-4 rounded-full transition-all hover:border-primary hover:text-primary"
                >
                  Gratis Offertes Aanvragen <ArrowRight size={18} />
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
                  <p className="font-bold text-sm text-neutral-900">500+ huiseigenaren</p>
                  <p className="text-xs text-neutral-500">gingen u voor</p>
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
            <p className="text-primary font-semibold text-sm mb-3">Simpel. Snel. Slim.</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">Van foto tot offerte &mdash; in 3 stappen</h2>
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
              <p className="text-primary font-semibold text-sm mb-3">Transparante prijzen</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Weet wat u betaalt &mdash; vóórdat u begint</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">Actuele richtprijzen 2026 per onderdeel &mdash; inclusief materiaal, arbeid en BTW. Geen verborgen kosten.</p>
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
                <p className="text-white/70 font-semibold text-sm mb-3">Exclusieve AI-tool &mdash; gratis voor iedereen</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Niet dromen, maar zien. Vóór de eerste tegelhamer valt.</h2>
                <p className="text-white/80 leading-relaxed mb-8">Upload een foto, kies uw stijl en materialen, en ontvang een fotorealistische AI-visualisatie van uw nieuwe badkamer &mdash; inclusief een persoonlijke kostenberekening op basis van uw m² en keuzes. Zo weet u precies waar u aan toe bent.</p>
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl"
                >
                  <Sparkles size={18} /> Start Gratis Visualisatie <ArrowRight size={16} />
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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">Uw vragen, eerlijk beantwoord</h2>
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
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Uw droomkamer begint hier</h2>
          <p className="text-neutral-500 mb-8 text-lg">Zie binnen 2 minuten hoe uw nieuwe badkamer eruitziet, of ontvang direct vrijblijvende offertes van vakmensen bij u in de buurt.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
            >
              <Sparkles size={20} /> Visualiseer Uw Badkamer <ArrowRight size={20} />
            </Link>
            <Link
              to="/offerte-aanvragen"
              className="inline-flex items-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-lg px-10 py-5 rounded-full transition-all hover:border-primary hover:text-primary"
            >
              Gratis Offertes Aanvragen <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
