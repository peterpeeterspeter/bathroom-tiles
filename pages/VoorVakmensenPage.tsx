import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, XCircle, ChevronDown, Users, TrendingUp, Mail, Phone, FileText, Camera, Palette, Ruler, Euro, Star, Clock, MapPin, Shield, BarChart3, Zap, Target, Award, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { submitLead, sendLeadNotification } from '../lib/leadService';
import { trackEvent } from '../lib/analytics';

const VoorVakmensenPage = () => {
  useSEO({
    title: 'Voor Vakmensen — Word Partner | De Badkamer',
    description: 'Ontvang AI-gekwalificeerde badkamer leads met compleet projectdossier. Stijlkeuze, productlijst, foto\'s, afmetingen en budget — nog vóór het eerste gesprek.',
  });

  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [roiValues, setRoiValues] = useState({
    orderValue: 12000,
    conversionRate: 25,
    leadsPerMonth: 10,
  });
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    contactpersoon: '',
    email: '',
    telefoon: '',
    kvk: '',
    werkgebied: '',
    specialisatie: [] as string[],
    plan: 'premium',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const roiLeads = roiValues.leadsPerMonth;
  const roiConversions = (roiLeads * roiValues.conversionRate) / 100;
  const roiRevenue = roiConversions * roiValues.orderValue;
  const roiCost = roiLeads * 45;
  const roiPercent = roiCost > 0 ? Math.round((roiRevenue / roiCost) * 100) : 0;

  const handleSpecialisatie = (val: string) => {
    setFormData(prev => ({
      ...prev,
      specialisatie: prev.specialisatie.includes(val)
        ? prev.specialisatie.filter(s => s !== val)
        : [...prev.specialisatie, val],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    try {
      const result = await submitLead({
        name: `${formData.contactpersoon} (${formData.bedrijfsnaam})`,
        email: formData.email,
        phone: formData.telefoon,
        postcode: formData.werkgebied,
        source: 'contractor_signup',
        renovationType: formData.plan,
      });

      if (result.success) {
        trackEvent('contractor_signup', {
          plan: formData.plan,
          specialisatie: formData.specialisatie.join(', '),
        });

        sendLeadNotification({
          name: `${formData.contactpersoon} (${formData.bedrijfsnaam})`,
          email: formData.email,
          phone: formData.telefoon,
          postcode: formData.werkgebied,
          leadScore: result.leadScore,
          styleName: `VAKMAN AANMELDING — Plan: ${formData.plan.toUpperCase()}`,
          styleSummary: `Bedrijf: ${formData.bedrijfsnaam} | KvK: ${formData.kvk || 'n.v.t.'} | Specialisatie: ${formData.specialisatie.join(', ') || 'Geen geselecteerd'} | Werkgebied: ${formData.werkgebied}`,
          preferredTimeline: 'direct',
        });

        setFormSubmitted(true);
      } else {
        setFormError(result.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Er is iets misgegaan. Probeer het later opnieuw.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'Hoe exclusief zijn de leads?',
      a: 'Dat hangt af van uw plan. Bij Standaard worden leads gedeeld met maximaal 5 vakmensen. Bij Premium maximaal 3. Bij Exclusief ontvangt alleen u de lead — 100% exclusief.',
    },
    {
      q: 'Kan ik leads filteren op regio?',
      a: 'Ja, u stelt uw postcode-regio\'s in bij aanmelding. U ontvangt alleen leads in uw werkgebied.',
    },
    {
      q: 'Wat als de klant niet opneemt?',
      a: 'U krijgt de lead terug als credit als er binnen 72 uur geen contact gemaakt kan worden.',
    },
    {
      q: 'Hoe nauwkeurig is de AI-prijsindicatie?',
      a: 'Binnen 20% van de werkelijke kosten op basis van Q1 2026 markttarieven. Het is indicatief — u maakt altijd uw eigen offerte.',
    },
    {
      q: 'Moet ik een contract tekenen?',
      a: 'Nee, maandelijks opzegbaar. Geen minimale afname.',
    },
    {
      q: 'Hoe snel ontvang ik leads na aanmelding?',
      a: 'Direct na goedkeuring (meestal binnen 24 uur). U ontvangt leads via email en optioneel via SMS.',
    },
  ];

  return (
    <div className="bg-white">

      {/* SECTION 1: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Building2 size={16} />
                Voor installateurs & aannemers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Ontvang leads die al een compleet plan hebben
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-lg">
                Onze AI-planner levert u klanten met stijlkeuze, productlijst, foto's, afmetingen en budget — nog vóór het eerste gesprek.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a
                  href="#aanmelden"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:shadow-lg hover:shadow-accent/30"
                >
                  Word Partner — Gratis Aanmelden <ArrowRight size={18} />
                </a>
                <a
                  href="#wat-in-lead"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:bg-white/10"
                >
                  Bekijk een Voorbeeld Lead
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Nieuwe Lead Ontvangen</p>
                    <p className="text-xs text-neutral-500">Zojuist — via De Badkamer AI Planner</p>
                  </div>
                  <span className="ml-auto bg-success/10 text-success text-xs font-bold px-2.5 py-1 rounded-full">Score 85</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Naam</span>
                    <span className="font-semibold text-neutral-900">Sophie de Vries</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Postcode</span>
                    <span className="font-semibold text-neutral-900">3011 Rotterdam</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Stijl</span>
                    <span className="font-semibold text-neutral-900">Modern Industrieel</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Budget</span>
                    <span className="font-semibold text-primary">€12.000 – €16.000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Timeline</span>
                    <span className="font-semibold text-neutral-900">Binnen 3 maanden</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-500">Producten</span>
                    <span className="font-semibold text-neutral-900">8 geselecteerd</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 bg-primary/5 rounded-lg p-2 text-center">
                    <Camera size={16} className="mx-auto text-primary mb-1" />
                    <span className="text-xs text-primary font-medium">Foto</span>
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-lg p-2 text-center">
                    <Palette size={16} className="mx-auto text-primary mb-1" />
                    <span className="text-xs text-primary font-medium">AI Render</span>
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-lg p-2 text-center">
                    <FileText size={16} className="mx-auto text-primary mb-1" />
                    <span className="text-xs text-primary font-medium">PDF</span>
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-lg p-2 text-center">
                    <Ruler size={16} className="mx-auto text-primary mb-1" />
                    <span className="text-xs text-primary font-medium">3.2 × 2.8m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: Users, text: '150+ aangesloten vakmensen' },
              { icon: Star, text: 'Gemiddeld 4.8/5 klanttevredenheid' },
              { icon: MapPin, text: 'Alleen leads in uw regio' },
              { icon: Euro, text: 'Geen vaste abonnementskosten' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <badge.icon size={18} className="text-accent shrink-0" />
                <span className="text-white/90 text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem Comparison */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              Het probleem met traditionele leads
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Een gewone lead kost u 30 minuten om te kwalificeren. Onze leads zijn al gekwalificeerd door AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-neutral-300/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                  <XCircle size={20} className="text-error" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Traditionele Lead</h3>
              </div>
              <div className="space-y-4">
                {[
                  '"Ik wil mijn badkamer renoveren"',
                  'Geen foto\'s, geen afmetingen',
                  'Geen idee over budget',
                  '"Ik kijk nog rond"',
                  'U belt, ze nemen niet op',
                  '10 offertes bij concurrenten aangevraagd',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-neutral-600">
                    <XCircle size={18} className="text-error/50 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-primary/20 shadow-lg shadow-primary/5 relative">
              <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                De Badkamer
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">De Badkamer Lead</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Compleet AI Project Dossier',
                  'Foto + AI-render van het resultaat',
                  'Prijsindicatie €8.000 – €15.000',
                  'Lead score 85/100 — klaar om te starten',
                  'Telefoonnummer + gewenste timeline',
                  'Exclusief in uw regio',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-neutral-700">
                    <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Hoe werkt het?</h2>
            <p className="text-lg text-neutral-500">Van consument naar opdracht in 4 stappen</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: Palette,
                title: 'Klant ontwerpt',
                desc: 'De klant gebruikt onze AI-planner om hun droombadkamer te ontwerpen met stijlkeuze en productenselectie.',
              },
              {
                step: '2',
                icon: Zap,
                title: 'AI analyseert',
                desc: 'Onze AI analyseert foto\'s, stijl, producten en berekent een nauwkeurige prijsindicatie.',
              },
              {
                step: '3',
                icon: Mail,
                title: 'Lead in uw inbox',
                desc: 'U ontvangt een compleet dossier: contactgegevens, stijlprofiel, producten, render en budget.',
              },
              {
                step: '4',
                icon: Award,
                title: 'U sluit de deal',
                desc: 'Het eerste gesprek is meteen inhoudelijk. U maakt een accurate offerte en wint de opdracht.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 bg-primary/5 rounded-2xl mb-6">
                    <item.icon size={32} className="text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white text-sm font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: What's in a Lead */}
      <section id="wat-in-lead" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Wat zit er in een lead?</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Elk lead bevat een compleet AI Project Dossier — dit is uw unieke voordeel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Phone, title: 'Contactgegevens', items: ['Naam & email', 'Telefoonnummer', 'Postcode & woonplaats', 'Gewenste timeline'] },
              { icon: Palette, title: 'Stijlprofiel', items: ['Geselecteerde stijl', 'AI-samenvatting', 'Inspiratiefoto\'s', 'Kleurvoorkeuren'] },
              { icon: FileText, title: 'Productkeuzes', items: ['Merk & model per categorie', 'Prijsklasse per product', 'Behouden/vervangen keuzes', 'Tot 8 productcategorieën'] },
              { icon: Ruler, title: 'Ruimteanalyse', items: ['Exacte afmetingen', 'Oppervlakte in m²', 'Originele badkamerfoto', 'AI visualisatie render'] },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-300/30 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">{card.title}</h3>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-neutral-600">
                      <CheckCircle size={14} className="text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto">
            <p className="text-lg text-neutral-700">
              <span className="font-bold">Gemiddeld besteden onze klanten 8 minuten</span> aan het plannen van hun badkamer.
              Dat is 8 minuten onderzoek dat u niet meer hoeft te doen.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Lead Score Explained */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              Lead Score: weet direct waar u aan toe bent
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Elke lead krijgt een score van 0-100. Zo weet u meteen de kwaliteit en intentie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <div className="bg-white rounded-2xl p-8 border border-neutral-300/30 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Voorbeeld Lead</span>
                  <span className="text-3xl font-black text-primary">82/100</span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Contact compleet', score: 20, max: 25, color: 'bg-primary' },
                    { label: 'Project volledigheid', score: 35, max: 35, color: 'bg-primary' },
                    { label: 'AI outputs', score: 20, max: 20, color: 'bg-primary' },
                    { label: 'Budgetsignaal', score: 7, max: 20, color: 'bg-accent' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-neutral-600 font-medium">{bar.label}</span>
                        <span className="font-bold text-neutral-900">{bar.score}/{bar.max}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-3">
                        <div
                          className={`${bar.color} rounded-full h-3 transition-all duration-1000`}
                          style={{ width: `${(bar.score / bar.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  range: '70–100',
                  color: 'bg-success',
                  title: 'Hoge intentie',
                  desc: 'Deze klant is klaar om te starten. Direct contact opnemen voor maximale conversie.',
                },
                {
                  range: '40–69',
                  color: 'bg-warning',
                  title: 'Oriëntatiefase',
                  desc: 'Goed voor opvolging binnen een week. Klant heeft interesse maar vergelijkt nog.',
                },
                {
                  range: '0–39',
                  color: 'bg-neutral-300',
                  title: 'Vroeg stadium',
                  desc: 'Deze sturen we niet door. Wij filteren op kwaliteit zodat u geen tijd verspilt.',
                },
              ].map((tier, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`${tier.color} text-white text-sm font-bold px-3 py-1.5 rounded-lg shrink-0 min-w-[70px] text-center`}>
                    {tier.range}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">{tier.title}</h4>
                    <p className="text-sm text-neutral-500">{tier.desc}</p>
                  </div>
                </div>
              ))}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-4">
                <p className="text-sm text-neutral-700 font-medium">
                  Wij sturen u alleen leads met een score van 40+. Lagere scores worden niet doorgestuurd.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Pricing */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              Transparante prijzen, geen verrassingen
            </h2>
            <p className="text-lg text-neutral-500">Geen opzegkosten. Maandelijks opzegbaar. Start vandaag.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Standaard',
                price: '25',
                unit: 'per lead',
                features: [
                  'Gedeeld (max 5 offertes)',
                  'Alle regio\'s',
                  'Score 40+',
                  'Email notificatie',
                  'Online dossier',
                ],
                highlight: false,
              },
              {
                name: 'Premium',
                price: '45',
                unit: 'per lead',
                features: [
                  'Max 3 offertes per lead',
                  'Uw regio\'s',
                  'Score 50+',
                  'Email + SMS notificatie',
                  'PDF dossier',
                ],
                highlight: true,
              },
              {
                name: 'Exclusief',
                price: '75',
                unit: 'per lead',
                features: [
                  '100% exclusief — alleen voor u',
                  'Uw regio\'s',
                  'Score 60+',
                  'Prioriteitsnotificatie',
                  'Direct bellen mogelijk',
                ],
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-white border-2 border-primary shadow-xl shadow-primary/10 scale-105'
                    : 'bg-white border border-neutral-300/50'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                    Meest gekozen
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-primary">€{plan.price}</span>
                  <span className="text-neutral-500 text-sm ml-1">/{plan.unit}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#aanmelden"
                  className={`block text-center font-bold text-sm py-3 px-6 rounded-full transition-all ${
                    plan.highlight
                      ? 'bg-accent hover:bg-accent-hover text-white hover:shadow-lg'
                      : 'bg-primary/10 hover:bg-primary/20 text-primary'
                  }`}
                >
                  Kies {plan.name}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-8">
            Geen opzegkosten. Maandelijks opzegbaar. Start vandaag, ontvang morgen uw eerste lead.
          </p>
        </div>
      </section>

      {/* SECTION 7: ROI Calculator */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Bereken uw rendement</h2>
            <p className="text-lg text-neutral-500">Zie direct wat De Badkamer leads u opleveren</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Gemiddelde opdrachtwaarde</label>
                  <span className="text-sm font-bold text-primary">€{roiValues.orderValue.toLocaleString('nl-NL')}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={30000}
                  step={1000}
                  value={roiValues.orderValue}
                  onChange={e => setRoiValues(v => ({ ...v, orderValue: +e.target.value }))}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>€5.000</span>
                  <span>€30.000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Conversiepercentage</label>
                  <span className="text-sm font-bold text-primary">{roiValues.conversionRate}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={roiValues.conversionRate}
                  onChange={e => setRoiValues(v => ({ ...v, conversionRate: +e.target.value }))}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Aantal leads per maand</label>
                  <span className="text-sm font-bold text-primary">{roiValues.leadsPerMonth}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={roiValues.leadsPerMonth}
                  onChange={e => setRoiValues(v => ({ ...v, leadsPerMonth: +e.target.value }))}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
              <h3 className="text-lg font-bold text-white/80 mb-6">Uw maandelijks rendement</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Leads per maand</span>
                  <span className="font-bold text-xl">{roiLeads}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Opdrachten ({roiValues.conversionRate}% conversie)</span>
                  <span className="font-bold text-xl">{roiConversions.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Omzet per maand</span>
                  <span className="font-bold text-xl">€{roiRevenue.toLocaleString('nl-NL')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Leadkosten (€45/lead)</span>
                  <span className="font-bold">€{roiCost.toLocaleString('nl-NL')}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-white/70 text-sm mb-1">Return on Investment</p>
                <p className="text-5xl font-black text-accent">{roiPercent.toLocaleString('nl-NL')}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Testimonials */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Wat vakmensen zeggen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: 'De leads van De Badkamer zijn anders. De klant heeft al nagedacht over stijl, producten en budget. Het eerste gesprek is meteen inhoudelijk.',
                name: 'Jan V.',
                role: 'Sanitairtechniek Rotterdam',
                since: 'Partner sinds 2025',
              },
              {
                quote: 'Ik was sceptisch over AI-leads, maar het AI-render helpt enorm. De klant weet precies wat hij wil en ik kan direct een accurate offerte maken.',
                name: 'Marco D.',
                role: 'Badkamer Specialist Antwerpen',
                since: 'Partner sinds 2025',
              },
              {
                quote: 'Vroeger reed ik 5x per week naar mensen die nog aan het vergelijken waren. Nu heb ik 3 vaste opdrachten per maand via De Badkamer.',
                name: 'Pieter K.',
                role: 'Installatietechniek Eindhoven',
                since: 'Partner sinds 2026',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-neutral-300/30 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="border-t border-neutral-100 pt-4">
                  <p className="font-bold text-neutral-900 text-sm">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                  <p className="text-xs text-primary font-medium mt-1">{t.since}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: Before/After Showcase */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Resultaten van onze AI-planner</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Uw klanten zien vooraf hoe hun renovatie eruitziet. Dat maakt het verkoopgesprek eenvoudiger.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { style: 'Modern Industrieel', budget: '€12.000 – €16.000', area: '6 m²' },
              { style: 'Scandinavisch Warm', budget: '€9.000 – €13.000', area: '4.5 m²' },
              { style: 'Luxe Klassiek', budget: '€18.000 – €24.000', area: '8 m²' },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Camera size={28} className="text-primary" />
                    </div>
                    <p className="text-sm text-neutral-500">AI-render voorbeeld</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">Voor</span>
                      <div className="flex-1 h-px bg-white/30" />
                      <span className="text-white text-xs font-bold bg-accent/80 backdrop-blur-sm px-2 py-0.5 rounded">Na</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{item.style}</h3>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1"><Euro size={14} /> {item.budget}</span>
                  <span className="flex items-center gap-1"><Ruler size={14} /> {item.area}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/badkamer-inspiratie"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
            >
              Bekijk meer AI-resultaten <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Veelgestelde vragen</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-300/30 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-neutral-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-400 shrink-0 transition-transform duration-300 ${faqOpen === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: Final CTA */}
      <section className="bg-gradient-to-r from-accent to-accent-hover py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Klaar om te groeien?</h2>
          <p className="text-lg text-white/80 mb-8">
            Meld u vandaag aan en ontvang uw eerste lead binnen 24 uur.
          </p>
          <a
            href="#aanmelden"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-accent font-bold text-lg px-10 py-4 rounded-full transition-all hover:shadow-xl"
          >
            Word Partner <ArrowRight size={20} />
          </a>
          <p className="text-white/60 text-sm mt-4">
            Gratis aanmelden — geen vaste kosten — direct opzegbaar
          </p>
        </div>
      </section>

      {/* SECTION 12: Sign-up Form */}
      <section id="aanmelden" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Word Partner</h2>
            <p className="text-lg text-neutral-500">
              Vul het formulier in en ontvang uw eerste leads binnen 24 uur na goedkeuring.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Bedankt voor uw aanmelding!</h3>
              <p className="text-neutral-500">
                Wij nemen binnen 24 uur contact met u op om uw account te activeren.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-neutral-300/30 p-8 md:p-10 shadow-lg">
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-700 font-medium">{formError}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Bedrijfsnaam *</label>
                  <input
                    type="text"
                    required
                    value={formData.bedrijfsnaam}
                    onChange={e => setFormData(f => ({ ...f, bedrijfsnaam: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Contactpersoon *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactpersoon}
                    onChange={e => setFormData(f => ({ ...f, contactpersoon: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Uw naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="info@uwbedrijf.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Telefoon *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefoon}
                    onChange={e => setFormData(f => ({ ...f, telefoon: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="06-12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">KvK-nummer</label>
                  <input
                    type="text"
                    value={formData.kvk}
                    onChange={e => setFormData(f => ({ ...f, kvk: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Werkgebied (postcodes) *</label>
                  <input
                    type="text"
                    required
                    value={formData.werkgebied}
                    onChange={e => setFormData(f => ({ ...f, werkgebied: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="bijv. 3000-3099, 1000-1099"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Specialisatie</label>
                <div className="flex flex-wrap gap-2">
                  {['Complete badkamer', 'Sanitair', 'Tegels', 'Loodgieter', 'Elektra'].map(spec => (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => handleSpecialisatie(spec)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.specialisatie.includes(spec)
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Gewenst plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standaard', label: 'Standaard', price: '€25/lead' },
                    { value: 'premium', label: 'Premium', price: '€45/lead' },
                    { value: 'exclusief', label: 'Exclusief', price: '€75/lead' },
                  ].map(plan => (
                    <button
                      type="button"
                      key={plan.value}
                      onClick={() => setFormData(f => ({ ...f, plan: plan.value }))}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        formData.plan === plan.value
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <p className={`text-sm font-bold ${formData.plan === plan.value ? 'text-primary' : 'text-neutral-900'}`}>
                        {plan.label}
                      </p>
                      <p className="text-xs text-neutral-500">{plan.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full mt-8 bg-accent hover:bg-accent-hover text-white font-bold text-base py-4 rounded-full transition-all hover:shadow-lg hover:shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Bezig met verzenden...
                  </>
                ) : (
                  <>
                    Aanmelding versturen <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-400 text-center mt-4">
                Door u aan te melden gaat u akkoord met onze{' '}
                <Link to="/voorwaarden" className="underline hover:text-neutral-600">algemene voorwaarden</Link>{' '}
                en{' '}
                <Link to="/privacy" className="underline hover:text-neutral-600">privacybeleid</Link>.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default VoorVakmensenPage;
