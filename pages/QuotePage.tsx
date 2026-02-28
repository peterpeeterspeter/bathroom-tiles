import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Bath, Paintbrush, Home, Ruler, Clock, Sparkles, User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitLead } from '../lib/leadService';
import { trackEvent } from '../lib/analytics';
import { useSEO } from '../lib/useSEO';

const renovationTypes = [
  { id: 'full', label: 'Full tile replacement', desc: 'Floor and wall tiles, new from scratch', icon: Bath },
  { id: 'partial', label: 'Partial refresh', desc: 'Some areas only (e.g. floor or shower)', icon: Paintbrush },
  { id: 'new_build', label: 'New construction', desc: 'Bathroom in new build', icon: Home },
];

const bathroomSizes = [
  { id: 'small', label: 'Small', desc: 'Up to 65 sq ft', icon: Ruler },
  { id: 'medium', label: 'Medium', desc: '65 – 100 sq ft', icon: Ruler },
  { id: 'large', label: 'Large', desc: '100+ sq ft', icon: Ruler },
];

const timelines = [
  { id: '1_month', label: 'Within 1 month' },
  { id: '1_3_months', label: '1 – 3 months' },
  { id: '3_6_months', label: '3 – 6 months' },
  { id: 'exploring', label: 'Just exploring' },
];

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [renovationType, setRenovationType] = useState('');
  const [bathroomSize, setBathroomSize] = useState('');
  const [timeline, setTimeline] = useState('');
  const [country, setCountry] = useState<'US'>('US');
  const [form, setForm] = useState({ name: '', email: '', phone: '', postcode: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    trackEvent('quote_step_completed', { step });
    setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        postcode: form.postcode,
        source: 'quote_form',
        country,
        renovationType,
        bathroomSize,
        preferredTimeline: timeline,
      });
      trackEvent('lead_submitted', { source: 'quote_form', renovationType, bathroomSize, timeline, country });
      setSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again later.';
      setError(errorMessage);
      trackEvent('lead_submit_error', { source: 'quote_form', error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  // Call useSEO with different values based on submitted state
  // This is safe because `submitted` only changes from false->true once per mount
  useSEO(submitted
    ? { title: 'Thank you - Bathroom Tiles' }
    : { title: 'Free Quote Request - Bathroom Tile Renovation | Bathroom Tiles', description: 'Request free, no-obligation quotes for your bathroom tile renovation. Get quotes from local contractors within 24 hours.' }
  );

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 md:py-32 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Thank you &mdash; your request has been received!</h1>
        <p className="text-neutral-500 text-lg mb-3">Within 24 hours you will receive up to 3 no-obligation quotes from selected contractors in your area. You decide whether and with whom to proceed.</p>
        <p className="text-neutral-500 mb-10">In the meantime: try our AI Planner and visualize your new bathroom.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/planner"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            <Sparkles size={18} /> Try the AI Planner
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-neutral-300/50 text-neutral-700 font-semibold px-8 py-4 rounded-full transition-all hover:border-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const stepLabels = ['Scope', 'Size', 'Timeline', 'Details'];

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-3">Request a free quote</h1>
          <p className="text-neutral-500">Complete the steps and receive no-obligation quotes.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                i + 1 === step ? 'bg-primary border-primary text-white' :
                i + 1 < step ? 'bg-primary border-primary text-white' :
                'bg-white border-neutral-300/50 text-neutral-500'
              }`}>
                {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${i + 1 === step ? 'text-primary' : 'text-neutral-500'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Renovation Type */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">What type of tile work do you need?</h2>
            {renovationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => { setRenovationType(type.id); goNext(); }}
                className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary-light/30 ${
                  renovationType === type.id ? 'border-primary bg-primary-light/30' : 'border-neutral-300/50 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <type.icon size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{type.label}</p>
                  <p className="text-sm text-neutral-500">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Size */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">How large is your bathroom?</h2>
            {bathroomSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => { setBathroomSize(size.id); goNext(); }}
                className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary-light/30 ${
                  bathroomSize === size.id ? 'border-primary bg-primary-light/30' : 'border-neutral-300/50 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <size.icon size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{size.label}</p>
                  <p className="text-sm text-neutral-500">{size.desc}</p>
                </div>
              </button>
            ))}
            <button onClick={goBack} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary mt-4 font-medium"><ArrowLeft size={14} /> Previous step</button>
          </div>
        )}

        {/* Step 3: Timeline */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">When do you want to start?</h2>
            <div className="grid grid-cols-2 gap-3">
              {timelines.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTimeline(t.id); goNext(); }}
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary-light/30 ${
                    timeline === t.id ? 'border-primary bg-primary-light/30' : 'border-neutral-300/50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-primary" />
                    <span className="font-bold text-sm text-neutral-900">{t.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={goBack} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary mt-4 font-medium"><ArrowLeft size={14} /> Previous step</button>
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Your contact details</h2>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input required placeholder="Your name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input required placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input required placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input required placeholder="ZIP code (e.g. 90210)" type="text" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-neutral-300 accent-primary cursor-pointer" />
              <span className="text-xs text-neutral-500 leading-relaxed">
                I agree to the processing of my personal data in accordance with the <a href="/privacy" className="underline text-primary">privacy policy</a>.
              </span>
            </label>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={goBack} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-neutral-300/50 text-neutral-700 font-semibold text-sm hover:bg-surface transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={!consent || submitting}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${
                  !consent ? 'bg-neutral-300/50 text-neutral-500 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
                }`}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit Request <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
