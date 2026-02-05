import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Info } from 'lucide-react';
import { InlineLeadForm } from '../components/InlineLeadForm';

const mainCosts = [
  { item: 'Complete badkamer renoveren (gem. 9 m\u00B2)', low: '3.500', high: '15.000', note: '' },
  { item: 'Ligbad', low: '700', high: '1.500', note: 'Basic of luxe ligbad' },
  { item: 'Douche', low: '500', high: '2.000', note: 'Cabine- of inloopdouche' },
  { item: 'Toilet', low: '450', high: '900', note: '' },
  { item: 'Wastafel', low: '200', high: '1.000', note: 'Enkele of dubbele wastafel' },
  { item: 'Kraan', low: '150', high: '450', note: '' },
  { item: 'Vloertegels', low: '700', high: '1.800', note: 'Keramisch of natuursteen' },
  { item: 'Overige materialen', low: '150', high: '350', note: 'Leidingen, elektra, sifons' },
];

const tiers = [
  {
    name: 'Budget',
    range: '\u20AC 3.500 \u2013 \u20AC 5.500',
    desc: 'Functionele, eenvoudige renovatie met standaard materialen.',
    items: ['Standaard tegels', 'Douchecabine', 'Enkele wastafel', 'Hangtoilet', 'Basisverlichting'],
  },
  {
    name: 'Gemiddeld',
    range: '\u20AC 5.000 \u2013 \u20AC 8.000',
    desc: 'Stijlvolle renovatie met goede kwaliteit materialen.',
    items: ['Designtegels', 'Inloopdouche', 'Dubbele wastafel', 'Inbouwkranen', 'Sfeerverlichting'],
    featured: true,
  },
  {
    name: 'Luxe',
    range: '\u20AC 10.000+',
    desc: 'Premium materialen en design op maat.',
    items: ['Natuursteen tegels', 'Regendouche + spabad', 'Designsanitair', 'Vloerverwarming', 'Maatwerk meubels'],
  },
];

const extras = [
  { item: 'Vloerverwarming', price: 'vanaf \u20AC 755', note: 'Tot 10 m\u00B2 als hoofdverwarming' },
  { item: 'Whirlpool / spabad', price: '\u20AC 2.700 \u2013 \u20AC 6.700', note: 'Wellness badmeubel met bubbels' },
  { item: 'Stoom/spa douchecabine', price: '\u20AC 1.600 \u2013 \u20AC 4.300', note: 'Met massagestralen en LED' },
];

const tips = [
  'Voer zelf het oude meubilair af en bespaar gemiddeld \u20AC 350.',
  'Vergelijk A- en B-merken: vaak dezelfde kwaliteit voor een lagere prijs.',
  'Kies een lokale aannemer om voorrijkosten te beperken.',
  'Plan materialen ruim op voorhand om vertragingen te voorkomen.',
];

export default function KostenPage() {
  return (
    <>
      <Helmet>
        <title>Badkamer Renovatie Kosten 2025 | Prijzen per m\u00B2 - De Badkamer</title>
        <meta name="description" content="Wat kost een badkamer renovatie? Complete kosten per onderdeel: \u20AC3.500 - \u20AC15.000. Vergelijk prijzen en bespaar met onze tips." />
      </Helmet>

      {/* Hero */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <nav className="text-sm text-neutral-500 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">Kosten Badkamer Renovatie</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 mb-4">Wat kost een badkamer renovatie?</h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl">
            Gemiddeld kost een complete badkamerrenovatie tussen de <strong className="text-neutral-900">&euro;3.500</strong> en <strong className="text-neutral-900">&euro;15.000</strong>.
            Hieronder vindt u een compleet overzicht van alle kosten per onderdeel.
          </p>
        </div>
      </section>

      {/* Main Cost Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Kosten per onderdeel</h2>
          <p className="text-neutral-500 text-sm mb-8">Inclusief materiaal, montage en BTW. Gebaseerd op een gemiddelde badkamer van 9 m&sup2;.</p>
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
          <p className="text-neutral-500 text-sm mb-10">Drie scenario's voor een badkamer van 9 m&sup2;, inclusief montage, materiaal en BTW.</p>
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
          <p className="text-neutral-500 leading-relaxed mb-6">
            De gemiddelde kosten per m&sup2; liggen tussen <strong className="text-neutral-900">&euro;390</strong> en <strong className="text-neutral-900">&euro;1.700</strong>.
            In de Randstad en grote steden als Amsterdam of Utrecht liggen de prijzen doorgaans hoger.
            In Belgi&euml; zijn vergelijkbare prijzen te verwachten, met regionale variaties tussen Vlaanderen en Walloni&euml;.
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
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 mb-4">Benieuwd naar de exacte kosten?</h2>
          <p className="text-neutral-500 mb-8">Ontvang gratis en vrijblijvend offertes op maat van lokale vakmensen.</p>
          <Link
            to="/offerte-aanvragen"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-10 py-5 rounded-full transition-all hover:shadow-xl hover:shadow-accent/25"
          >
            Ontvang Gratis Offertes <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
