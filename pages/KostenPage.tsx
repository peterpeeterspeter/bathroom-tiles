import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Info, Sparkles } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';
import { useSEO } from '../lib/useSEO';

const mainCosts = [
  { item: 'Complete badkamer renoveren (gem. 9 m²)', low: '8.000', high: '25.000', note: 'Incl. arbeid en BTW' },
  { item: 'Ligbad', low: '700', high: '1.500', note: 'Basic of luxe ligbad' },
  { item: 'Douche', low: '500', high: '2.000', note: 'Cabine- of inloopdouche' },
  { item: 'Toilet', low: '450', high: '900', note: '' },
  { item: 'Wastafel + meubel', low: '200', high: '1.000', note: 'Enkele of dubbele wastafel' },
  { item: 'Kraan', low: '150', high: '450', note: '' },
  { item: 'Vloertegels', low: '700', high: '1.800', note: 'Keramisch of natuursteen' },
  { item: 'Arbeid (per uur)', low: '40', high: '70', note: 'Loodgieter, tegelzetter, elektricien' },
];

const tiers = [
  {
    name: 'Budget',
    range: '€ 8.000 – € 12.000',
    desc: 'Functionele renovatie met standaard sanitair en tegels. Ideaal voor wie de badkamer wil vernieuwen zonder luxe toevoegingen.',
    items: ['Standaard tegels', 'Douchecabine', 'Enkele wastafel met meubel', 'Hangtoilet', 'Basisverlichting', 'Inclusief arbeid en afvoer'],
  },
  {
    name: 'Gemiddeld',
    range: '€ 12.000 – € 18.000',
    desc: 'Stijlvolle renovatie met kwaliteitsmaterialen en modern comfort. De meest gekozen optie.',
    items: ['Designtegels of wandpanelen', 'Inloopdouche met regendouchekop', 'Wastafelmeubel met lades', 'Rimfree toilet met softclose', 'Thermostatische kranen', 'Sfeerverlichting'],
    featured: true,
  },
  {
    name: 'Luxe',
    range: '€ 18.000 – € 25.000+',
    desc: 'Premium materialen, maatwerk en luxe comfort op het hoogste niveau.',
    items: ['Natuursteen of grootformaat tegels', 'Regendouche met thermostaatsysteem', 'Designsanitair', 'Vloerverwarming', 'Maatwerk meubels', 'Optioneel: whirlpool of stoominrichting'],
  },
];

const extras = [
  { item: 'Vloerverwarming', price: 'vanaf € 755', note: 'Tot 10 m² als hoofdverwarming' },
  { item: 'Whirlpool / spabad', price: '€ 2.700 – € 6.700', note: 'Wellness badmeubel met bubbels' },
  { item: 'Stoom/spa douchecabine', price: '€ 1.600 – € 4.300', note: 'Met massagestralen en LED' },
];

const tips = [
  'Voer zelf het oude sanitair en meubilair af — bespaar gemiddeld €350 op sloopkosten.',
  'Vergelijk A- en B-merken: vaak dezelfde kwaliteit voor 20-40% minder.',
  'Kies een vakman bij u in de buurt — dit bespaart op voorrijkosten en maakt opvolging eenvoudiger.',
  'Overweeg wandpanelen in plaats van tegels: snellere installatie (minder arbeidsuren) en geen voegonderhoud.',
  'Plan materialen minstens 4-6 weken vooruit — levertijden zijn in 2026 langer door hoge vraag.',
  'Laat bestaand tegelwerk zitten als het nog goed is — nieuwe tegels óver oude tegels besparen sloop- en afvoerkosten.',
];

export default function KostenPage() {
  useSEO({ title: 'Badkamer Renovatie Kosten 2026 | Actuele Prijzen per m² - De Badkamer', description: 'Wat kost een badkamerrenovatie in 2026? Actuele prijzen: €8.000 - €25.000 (incl. arbeid en BTW). Kosten per m², per onderdeel, en bespaartips.' });

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <nav className="text-sm text-neutral-500 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">Kosten Badkamer Renovatie</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 mb-4">Wat kost een badkamerrenovatie in 2026?</h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl">
            Een complete badkamerrenovatie kost gemiddeld <strong className="text-neutral-900">&euro;8.000</strong> tot <strong className="text-neutral-900">&euro;25.000</strong>, afhankelijk van grootte, materialen en afwerkingsniveau. Het marktgemiddelde voor een standaard badkamer van 9 m² ligt op &euro;14.000 tot &euro;18.500. Hieronder vindt u een actueel overzicht van alle kosten &mdash; per onderdeel, per m² en per kwaliteitsniveau.
          </p>
        </div>
      </section>

      {/* Main Cost Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Kosten per onderdeel</h2>
          <p className="text-neutral-500 text-sm mb-8">Inclusief materiaal, arbeid en BTW. Gebaseerd op een gemiddelde badkamer van 9 m&sup2;.</p>
          <div className="border border-neutral-300/50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-primary-dark text-white px-6 py-4">
              <div className="col-span-5 text-sm font-bold">Onderdeel</div>
              <div className="col-span-4 text-sm font-bold">Gemiddelde prijs</div>
              <div className="col-span-3 text-sm font-bold hidden sm:block">Opmerking</div>
            </div>
            {mainCosts.map((cost, i) => (
              <div key={i} className={`grid grid-cols-12 px-6 py-4 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-100/50'}`}>
                <div className="col-span-5 text-sm font-medium text-neutral-700">{cost.item}</div>
                <div className="col-span-4 text-sm font-bold text-neutral-900">&euro; {cost.low} &ndash; &euro; {cost.high}</div>
                <div className="col-span-3 text-xs text-neutral-500 hidden sm:block">{cost.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Prijsvoorbeelden</h2>
          <p className="text-neutral-500 text-sm mb-10">Drie scenario's voor een badkamer van 9 m&sup2;, inclusief materiaal, arbeid en BTW.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`rounded-2xl p-6 border-2 ${tier.featured ? 'border-primary bg-primary-light/30' : 'border-neutral-300/50 bg-white'}`}>
                {tier.featured && <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Meest gekozen</p>}
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

      {/* Per m2 */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Kosten per vierkante meter</h2>
          <p className="text-neutral-500 leading-relaxed mb-4">
            De gemiddelde kosten per m&sup2; liggen tussen <strong className="text-neutral-900">&euro;390</strong> en <strong className="text-neutral-900">&euro;1.700</strong> &mdash; inclusief materialen, arbeid en afvoer. Concreet:
          </p>
          <div className="border border-neutral-300/50 rounded-xl overflow-hidden mb-6">
            <div className="flex justify-between items-center px-6 py-3 bg-neutral-100/50">
              <span className="text-sm font-medium text-neutral-700">Klein (2-4 m²)</span>
              <span className="text-sm font-bold text-neutral-900">&euro;8.000 &ndash; &euro;15.000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3 bg-white">
              <span className="text-sm font-medium text-neutral-700">Gemiddeld (4-6 m²)</span>
              <span className="text-sm font-bold text-neutral-900">&euro;12.000 &ndash; &euro;20.000</span>
            </div>
            <div className="flex justify-between items-center px-6 py-3 bg-neutral-100/50">
              <span className="text-sm font-medium text-neutral-700">Groot (6+ m²)</span>
              <span className="text-sm font-bold text-neutral-900">&euro;18.000 &ndash; &euro;30.000</span>
            </div>
          </div>
          <p className="text-neutral-500 leading-relaxed mb-6">
            In de Randstad en grote steden liggen prijzen doorgaans 10-15% hoger. In Belgi&euml; zijn vergelijkbare prijzen te verwachten, met regionale variaties tussen Vlaanderen en Walloni&euml;.
          </p>
          <div className="bg-primary-light/50 rounded-xl p-6 flex items-start gap-4">
            <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-700">
              Prijzen zijn indicatief en kunnen afwijken afhankelijk van uw specifieke situatie. Vraag altijd een <Link to="/offerte-aanvragen" className="text-primary font-semibold hover:underline">vrijblijvende offerte</Link> aan voor een exacte prijs.
            </p>
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Extra opties en kosten</h2>
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Bespaartips</h2>
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
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 mb-4">Wilt u weten wat úw badkamer gaat kosten?</h2>
          <p className="text-neutral-500 mb-8">Gebruik de gratis AI Planner voor een gepersonaliseerde prijsindicatie, of ontvang direct vrijblijvende offertes van vakmensen in uw regio.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25"
            >
              <Sparkles size={18} /> Start AI Planner &mdash; Gratis <ArrowRight size={20} />
            </Link>
            <Link
              to="/offerte-aanvragen"
              className="inline-flex items-center gap-2 bg-white border-2 border-neutral-300/50 text-neutral-700 font-semibold text-lg px-10 py-5 rounded-full transition-all hover:border-primary hover:text-primary"
            >
              Ontvang Offertes <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
