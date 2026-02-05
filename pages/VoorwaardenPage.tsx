import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

export default function VoorwaardenPage() {
  useSEO({ title: 'Gebruiksvoorwaarden - De Badkamer', description: 'Gebruiksvoorwaarden van DeBadkamer.com en de digitale badkamer tool.' });

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-sm text-neutral-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">Gebruiksvoorwaarden</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-10">Gebruiksvoorwaarden</h1>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Dienstverlening</h2>
            <p className="text-sm">DeBadkamer.com is een platform dat consumenten koppelt aan gekwalificeerde badkamerspecialisten. Wij voeren zelf geen renovatiewerkzaamheden uit. Onze dienst bestaat uit het verzamelen van projectwensen en het doorsturen hiervan naar geschikte vakmensen in uw regio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">AI Badkamer Planner</h2>
            <p className="text-sm">De AI Badkamer Planner is een pre-sales instrument bedoeld ter inspiratie en voorbereiding.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
              <li>Alle visualisaties zijn AI-generaties en dienen puur ter inspiratie</li>
              <li>Afmetingen en productdetails kunnen in de realiteit afwijken</li>
              <li>Prijsindicaties zijn niet-bindend en gebaseerd op gemiddelde markttarieven</li>
              <li>Een definitieve opname ter plaatse is steeds noodzakelijk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Geen offerte</h2>
            <p className="text-sm">De getoonde prijzen op deze website vormen geen offerte en scheppen geen contractuele verbintenis. Definitieve prijsafspraken worden uitsluitend gemaakt tussen u en de door ons aanbevolen vakspecialist, na persoonlijk adviesgesprek en technische opname.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Aansprakelijkheid</h2>
            <p className="text-sm">DeBadkamer.com is niet aansprakelijk voor beslissingen genomen op basis van de indicatieve informatie op deze website of in de AI Planner tool. Wij zijn evenmin aansprakelijk voor de werkzaamheden uitgevoerd door de vakspecialisten waarmee u in contact wordt gebracht.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Intellectueel eigendom</h2>
            <p className="text-sm">Alle content op deze website, inclusief teksten, afbeeldingen en de AI Planner tool, is eigendom van DeBadkamer.com en mag niet worden gereproduceerd zonder schriftelijke toestemming.</p>
          </section>

          <p className="text-sm text-neutral-500">Voor vragen over deze voorwaarden kunt u contact opnemen via info@debadkamer.com.</p>
        </div>
      </div>
    </div>
  );
}
