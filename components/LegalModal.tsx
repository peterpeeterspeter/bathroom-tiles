import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'privacy' | 'terms' | 'cookies';
}

const privacyContent = `
DeBadkamer.com hecht groot belang aan de bescherming van uw persoonsgegevens.

Welke gegevens verzamelen wij?
- Naam, e-mailadres, telefoonnummer en postcode (bij invulling van het contactformulier)
- Foto's die u uploadt van uw badkamer
- Uw stijlvoorkeuren en productkeuzes
- Technische sessiegegevens (geanonimiseerd)

Waarvoor gebruiken wij uw gegevens?
- Om u een gepersonaliseerd renovatievoorstel te bezorgen
- Om contact met u op te nemen voor een vrijblijvend adviesgesprek
- Om onze dienstverlening te verbeteren (geanonimiseerde analyses)

Uw rechten
U heeft recht op inzage, correctie en verwijdering van uw persoonsgegevens. Neem hiervoor contact op via privacy@debadkamer.com.

Bewaartermijn
Uw gegevens worden maximaal 24 maanden bewaard na uw laatste interactie, tenzij u eerder om verwijdering verzoekt.

Gegevens worden niet gedeeld met derden buiten de noodzakelijke dienstverlening.
`.trim();

const termsContent = `
Gebruiksvoorwaarden De Badkamer Digitale Badkamer Tool

Deze tool is een pre-sales instrument bedoeld ter inspiratie en voorbereiding op een persoonlijk verkoopgesprek.

Indicatief karakter
- Alle visualisaties zijn AI-generaties en dienen puur ter inspiratie
- Afmetingen en productdetails kunnen in de realiteit afwijken
- Prijsindicaties zijn niet-bindend en gebaseerd op gemiddelde markttarieven
- Een definitieve opname ter plaatse is steeds noodzakelijk

Geen offerte
De getoonde prijzen vormen geen offerte en scheppen geen contractuele verbintenis. Definitieve prijsafspraken worden uitsluitend gemaakt na persoonlijk adviesgesprek en technische opname.

Productkeuzes
De getoonde productselecties dienen als inspiratierichting. Definitieve productkeuze gebeurt steeds samen met een De Badkamer-adviseur. Exacte merken, types en afmetingen zijn niet gegarandeerd.

Aansprakelijkheid
DeBadkamer.com is niet aansprakelijk voor beslissingen genomen op basis van de indicatieve informatie in deze tool.
`.trim();

const cookiesContent = `
Cookiebeleid

Deze tool maakt gebruik van strikt noodzakelijke cookies voor het correct functioneren van de applicatie.

Noodzakelijke cookies
- Sessie-identificatie (voor het bijhouden van uw voortgang in de tool)
- Geen tracking cookies van derden
- Geen marketing- of advertentiecookies

Door gebruik te maken van deze tool gaat u akkoord met het plaatsen van strikt noodzakelijke cookies.

Voor vragen over ons cookiebeleid kunt u contact opnemen via privacy@debadkamer.com.
`.trim();

const contentMap = {
  privacy: privacyContent,
  terms: termsContent,
  cookies: cookiesContent,
};

export const LegalModal = ({ isOpen, onClose, title, type }: LegalModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-300/30">
          <h2 className="font-bold text-sm">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-300/50 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
            {contentMap[type]}
          </div>
        </div>
        <div className="p-6 border-t border-neutral-300/30">
          <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition-all">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
