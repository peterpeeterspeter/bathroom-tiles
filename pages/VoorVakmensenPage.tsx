import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, XCircle, ChevronDown, Users, TrendingUp, Mail, Phone, FileText, Camera, Palette, Ruler, DollarSign, Star, Clock, MapPin, Shield, BarChart3, Zap, Target, Award, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { submitLead, sendLeadNotification } from '../lib/leadService';
import { trackEvent } from '../lib/analytics';

const VoorVakmensenPage = () => {
  useSEO({
    title: 'For Contractors — Become a Partner | Bathroom Tiles',
    description: 'Receive AI-qualified bathroom leads with complete project dossier. Style choice, product list, photos, dimensions, and budget — before the first conversation.',
  });

  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [roiValues, setRoiValues] = useState({
    orderValue: 13000,
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
  const roiCost = roiLeads * 49;
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
        styleName: `CONTRACTOR SIGNUP — Plan: ${formData.plan.toUpperCase()}`,
        styleSummary: `Company: ${formData.bedrijfsnaam} | EIN: ${formData.kvk || 'n/a'} | Specialization: ${formData.specialisatie.join(', ') || 'None selected'} | Service area: ${formData.werkgebied}`,
        preferredTimeline: 'direct',
      });

      setFormSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again later.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How exclusive are the leads?',
      a: 'It depends on your plan. Standard shares leads with up to 5 contractors. Premium with up to 3. Exclusive sends the lead only to you — 100% exclusive.',
    },
    {
      q: 'Can I filter leads by region?',
      a: 'Yes, you set your ZIP code regions when signing up. You only receive leads in your service area.',
    },
    {
      q: 'What if the customer doesn\'t respond?',
      a: 'You get the lead back as credit if no contact can be made within 72 hours.',
    },
    {
      q: 'How accurate is the AI price estimate?',
      a: 'Within 20% of actual costs based on Q1 2026 market rates. It\'s indicative — you always create your own quote.',
    },
    {
      q: 'Do I need to sign a contract?',
      a: 'No, cancel anytime. No minimum commitment.',
    },
    {
      q: 'How quickly do I receive leads after signup?',
      a: 'Right after approval (usually within 24 hours). You receive leads by email and optionally by SMS.',
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
                For installers & contractors
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Receive leads that already have a complete plan
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-lg">
                Our AI planner delivers customers with style choice, product list, photos, dimensions, and budget — before the first conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a
                  href="#aanmelden"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:shadow-lg hover:shadow-accent/30"
                >
                  Become Partner — Free Sign Up <ArrowRight size={18} />
                </a>
                <a
                  href="#wat-in-lead"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:bg-white/10"
                >
                  View Sample Lead
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
                    <p className="text-sm font-bold text-neutral-900">New Lead Received</p>
                    <p className="text-xs text-neutral-500">Just now — via Bathroom Tiles AI Planner</p>
                  </div>
                  <span className="ml-auto bg-success/10 text-success text-xs font-bold px-2.5 py-1 rounded-full">Score 85</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Name</span>
                    <span className="font-semibold text-neutral-900">Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">ZIP</span>
                    <span className="font-semibold text-neutral-900">90210 Los Angeles</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Style</span>
                    <span className="font-semibold text-neutral-900">Modern Industrial</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Budget</span>
                    <span className="font-semibold text-primary">$13,000 – $17,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Timeline</span>
                    <span className="font-semibold text-neutral-900">Within 3 months</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-500">Products</span>
                    <span className="font-semibold text-neutral-900">8 selected</span>
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
                    <span className="text-xs text-primary font-medium">10.5 × 9.2 ft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: Users, text: '150+ partner contractors' },
              { icon: Star, text: 'Avg 4.8/5 customer satisfaction' },
              { icon: MapPin, text: 'Leads only in your region' },
              { icon: DollarSign, text: 'No fixed subscription fees' },
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
              The problem with traditional leads
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              A typical lead takes 30 minutes to qualify. Our leads are pre-qualified by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-neutral-300/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                  <XCircle size={20} className="text-error" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Traditional Lead</h3>
              </div>
              <div className="space-y-4">
                {[
                  '"I want to renovate my bathroom"',
                  'No photos, no dimensions',
                  'No budget clarity',
                  '"I\'m just looking"',
                  'You call, they don\'t pick up',
                  '10 quotes requested from competitors',
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
                Bathroom Tiles
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Bathroom Tiles Lead</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Complete AI Project Dossier',
                  'Photo + AI render of the result',
                  'Price estimate $9,000 – $16,000',
                  'Lead score 85/100 — ready to start',
                  'Phone + preferred timeline',
                  'Exclusive in your region',
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
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">How does it work?</h2>
            <p className="text-lg text-neutral-500">From consumer to project in 4 steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: Palette,
                title: 'Customer designs',
                desc: 'The customer uses our AI planner to design their dream bathroom with style choice and product selection.',
              },
              {
                step: '2',
                icon: Zap,
                title: 'AI analyzes',
                desc: 'Our AI analyzes photos, style, products, and calculates an accurate price estimate.',
              },
              {
                step: '3',
                icon: Mail,
                title: 'Lead in your inbox',
                desc: 'You receive a complete dossier: contact info, style profile, products, render, and budget.',
              },
              {
                step: '4',
                icon: Award,
                title: 'You close the deal',
                desc: 'The first conversation gets straight to the point. You create an accurate quote and win the project.',
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
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">What&apos;s in a lead?</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Every lead includes a complete AI Project Dossier — your unique advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Phone, title: 'Contact info', items: ['Name & email', 'Phone number', 'ZIP & city', 'Preferred timeline'] },
              { icon: Palette, title: 'Style profile', items: ['Selected style', 'AI summary', 'Inspiration photos', 'Color preferences'] },
              { icon: FileText, title: 'Product choices', items: ['Brand & model per category', 'Price tier per product', 'Keep/replace choices', 'Up to 8 product categories'] },
              { icon: Ruler, title: 'Room analysis', items: ['Exact dimensions', 'Area in sq ft', 'Original bathroom photo', 'AI visualization render'] },
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
              <span className="font-bold">Our customers spend an average of 8 minutes</span> planning their bathroom.
              That&apos;s 8 minutes of research you no longer need to do.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Lead Score Explained */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              Lead Score: know exactly what you&apos;re getting
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Every lead gets a score of 0–100. Instantly know the quality and intent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <div className="bg-white rounded-2xl p-8 border border-neutral-300/30 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Sample Lead</span>
                  <span className="text-3xl font-black text-primary">82/100</span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Contact complete', score: 20, max: 25, color: 'bg-primary' },
                    { label: 'Project completeness', score: 35, max: 35, color: 'bg-primary' },
                    { label: 'AI outputs', score: 20, max: 20, color: 'bg-primary' },
                    { label: 'Budget signal', score: 7, max: 20, color: 'bg-accent' },
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
                  title: 'High intent',
                  desc: 'This customer is ready to start. Reach out immediately for maximum conversion.',
                },
                {
                  range: '40–69',
                  color: 'bg-warning',
                  title: 'Browsing phase',
                  desc: 'Good for follow-up within a week. Customer is interested but still comparing.',
                },
                {
                  range: '0–39',
                  color: 'bg-neutral-300',
                  title: 'Early stage',
                  desc: 'We don\'t forward these. We filter for quality so you don\'t waste time.',
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
                  We only send you leads with a score of 40+. Lower scores are not forwarded.
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
              Transparent pricing, no surprises
            </h2>
            <p className="text-lg text-neutral-500">No cancellation fees. Cancel anytime. Start today.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Standard',
                price: '27',
                unit: 'per lead',
                features: [
                  'Shared (max 5 quotes)',
                  'All regions',
                  'Score 40+',
                  'Email notification',
                  'Online dossier',
                ],
                highlight: false,
              },
              {
                name: 'Premium',
                price: '49',
                unit: 'per lead',
                features: [
                  'Max 3 quotes per lead',
                  'Your regions',
                  'Score 50+',
                  'Email + SMS notification',
                  'PDF dossier',
                ],
                highlight: true,
              },
              {
                name: 'Exclusive',
                price: '81',
                unit: 'per lead',
                features: [
                  '100% exclusive — only you',
                  'Your regions',
                  'Score 60+',
                  'Priority notification',
                  'Direct call option',
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
                    Most popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-primary">${plan.price}</span>
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
                  Choose {plan.name}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-8">
            No cancellation fees. Cancel anytime. Start today, receive your first lead tomorrow.
          </p>
        </div>
      </section>

      {/* SECTION 7: ROI Calculator */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Calculate your return</h2>
            <p className="text-lg text-neutral-500">See what Bathroom Tiles leads can deliver</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Average job value</label>
                  <span className="text-sm font-bold text-primary">${roiValues.orderValue.toLocaleString('en-US')}</span>
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
                  <span>$5,000</span>
                  <span>$30,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Conversion rate</label>
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
                  <label className="text-sm font-semibold text-neutral-700">Leads per month</label>
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
              <h3 className="text-lg font-bold text-white/80 mb-6">Your monthly return</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Leads per month</span>
                  <span className="font-bold text-xl">{roiLeads}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Jobs ({roiValues.conversionRate}% conversion)</span>
                  <span className="font-bold text-xl">{roiConversions.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Revenue per month</span>
                  <span className="font-bold text-xl">${roiRevenue.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Lead cost ($49/lead)</span>
                  <span className="font-bold">${roiCost.toLocaleString('en-US')}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-white/70 text-sm mb-1">Return on Investment</p>
                <p className="text-5xl font-black text-accent">{roiPercent.toLocaleString('en-US')}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Testimonials */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">What contractors say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: 'Bathroom Tiles leads are different. The customer has already thought about style, products, and budget. The first conversation gets straight to the point.',
                name: 'Mike R.',
                role: 'Plumbing & Tile, Los Angeles',
                since: 'Partner since 2025',
              },
              {
                quote: 'I was skeptical about AI leads, but the AI render helps a lot. The customer knows exactly what they want and I can create an accurate quote right away.',
                name: 'James D.',
                role: 'Bathroom Specialist, Chicago',
                since: 'Partner since 2025',
              },
              {
                quote: 'I used to drive 5x a week to people who were still comparing. Now I have 3 steady projects per month through Bathroom Tiles.',
                name: 'Chris K.',
                role: 'Installation Tech, Austin',
                since: 'Partner since 2026',
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
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Results from our AI planner</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Your customers see in advance how their renovation will look. That makes the sales conversation easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { style: 'Modern Industrial', budget: '$13,000 – $17,000', area: '65 sq ft' },
              { style: 'Scandinavian Warm', budget: '$10,000 – $14,000', area: '48 sq ft' },
              { style: 'Luxury Classic', budget: '$19,000 – $26,000', area: '86 sq ft' },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Camera size={28} className="text-primary" />
                    </div>
                    <p className="text-sm text-neutral-500">AI render sample</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">Before</span>
                      <div className="flex-1 h-px bg-white/30" />
                      <span className="text-white text-xs font-bold bg-accent/80 backdrop-blur-sm px-2 py-0.5 rounded">After</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{item.style}</h3>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1"><DollarSign size={14} /> {item.budget}</span>
                  <span className="flex items-center gap-1"><Ruler size={14} /> {item.area}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/inspiration"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
            >
              View more AI results <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Frequently asked questions</h2>
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
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to grow?</h2>
          <p className="text-lg text-white/80 mb-8">
            Sign up today and receive your first lead within 24 hours.
          </p>
          <a
            href="#aanmelden"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-accent font-bold text-lg px-10 py-4 rounded-full transition-all hover:shadow-xl"
          >
            Become Partner <ArrowRight size={20} />
          </a>
          <p className="text-white/60 text-sm mt-4">
            Free sign up — no fixed costs — cancel anytime
          </p>
        </div>
      </section>

      {/* SECTION 12: Sign-up Form */}
      <section id="aanmelden" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Become a Partner</h2>
            <p className="text-lg text-neutral-500">
              Fill out the form and receive your first leads within 24 hours after approval.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Thank you for signing up!</h3>
              <p className="text-neutral-500">
                We will contact you within 24 hours to activate your account.
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
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Company name *</label>
                  <input
                    type="text"
                    required
                    value={formData.bedrijfsnaam}
                    onChange={e => setFormData(f => ({ ...f, bedrijfsnaam: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Contact person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactpersoon}
                    onChange={e => setFormData(f => ({ ...f, contactpersoon: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Your name"
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
                    placeholder="info@yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefoon}
                    onChange={e => setFormData(f => ({ ...f, telefoon: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">EIN / Business ID</label>
                  <input
                    type="text"
                    value={formData.kvk}
                    onChange={e => setFormData(f => ({ ...f, kvk: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="12-3456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Service area (ZIP codes) *</label>
                  <input
                    type="text"
                    required
                    value={formData.werkgebied}
                    onChange={e => setFormData(f => ({ ...f, werkgebied: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. 90210, 10001-10099"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Specialization</label>
                <div className="flex flex-wrap gap-2">
                  {['Full bathroom', 'Plumbing', 'Tiling', 'HVAC', 'Electrical'].map(spec => (
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
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Preferred plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standaard', label: 'Standard', price: '$27/lead' },
                    { value: 'premium', label: 'Premium', price: '$49/lead' },
                    { value: 'exclusief', label: 'Exclusive', price: '$81/lead' },
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
                    <Loader2 size={18} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit signup <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-400 text-center mt-4">
                By signing up you agree to our{' '}
                <Link to="/terms" className="underline hover:text-neutral-600">terms of service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-neutral-600">privacy policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default VoorVakmensenPage;
