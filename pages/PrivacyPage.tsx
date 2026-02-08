import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

export default function PrivacyPage() {
  useSEO({ title: 'Privacyverklaring - De Badkamer', description: 'Privacyverklaring van DeBadkamer.com. Lees hoe wij omgaan met uw persoonsgegevens.' });

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-sm text-neutral-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">Privacyverklaring</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-10">Privacyverklaring</h1>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <p>DeBadkamer.com hecht groot belang aan de bescherming van uw persoonsgegevens.</p>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Welke gegevens verzamelen wij?</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Naam, e-mailadres, telefoonnummer en postcode (bij invulling van het contactformulier)</li>
              <li>Land (Nederland of Belgie)</li>
              <li>Foto's die u uploadt van uw badkamer (alleen via de AI Planner)</li>
              <li>Uw stijlvoorkeuren en productkeuzes</li>
              <li>Technische sessiegegevens (geanonimiseerd)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Waarvoor gebruiken wij uw gegevens?</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Om u te koppelen aan gekwalificeerde badkamerspecialisten in uw regio</li>
              <li>Om u een gepersonaliseerd renovatievoorstel te bezorgen</li>
              <li>Om contact met u op te nemen voor een vrijblijvend adviesgesprek</li>
              <li>Om onze dienstverlening te verbeteren (geanonimiseerde analyses)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Delen met derden</h2>
            <p className="text-sm">Uw contactgegevens worden gedeeld met maximaal 3 geselecteerde badkamerspecialisten in uw regio, zodat zij u een vrijblijvende offerte kunnen aanbieden. Verder worden uw gegevens niet gedeeld met derden buiten de noodzakelijke dienstverlening.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Uw rechten</h2>
            <p className="text-sm">U heeft recht op inzage, correctie en verwijdering van uw persoonsgegevens. Neem hiervoor contact op via privacy@debadkamer.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Bewaartermijn</h2>
            <p className="text-sm">Uw gegevens worden maximaal 24 maanden bewaard na uw laatste interactie, tenzij u eerder om verwijdering verzoekt.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Cookies</h2>
            <p className="text-sm">Deze website maakt gebruik van strikt noodzakelijke cookies voor het correct functioneren van de applicatie. Er worden geen tracking cookies van derden of marketing-/advertentiecookies gebruikt.</p>
          </section>

          <p className="text-sm text-neutral-500">Voor vragen over dit privacybeleid kunt u contact opnemen via privacy@debadkamer.com.</p>
        </div>
      </div>
    </div>
  );
}
