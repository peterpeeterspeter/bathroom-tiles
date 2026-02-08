import React, { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { submitLead } from '../lib/leadService';
import { trackEvent } from '../lib/analytics';

export const InlineLeadForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', postcode: '' });
  const [country, setCountry] = useState<'NL' | 'BE'>('NL');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        postcode: form.postcode,
        source: 'inline_form',
        country,
      });
      if (result.success) {
        trackEvent('lead_submitted', { source: 'inline_form', country });
        setSubmitted(true);
      } else {
        setError(result.error || 'Er is iets misgegaan bij het verzenden. Probeer het later opnieuw.');
        trackEvent('lead_submit_error', { source: 'inline_form', error: result.error });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er is iets misgegaan bij het verzenden. Probeer het later opnieuw.';
      setError(errorMessage);
      trackEvent('lead_submit_error', { source: 'inline_form', error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-primary-light rounded-2xl p-8 md:p-10 text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-3">Bedankt voor uw aanvraag!</h3>
        <p className="text-neutral-500">We nemen binnen 24 uur contact met u op met passende offertes.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-8 md:p-10 border border-neutral-300/30">
      <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ontvang gratis offertes</h3>
      <p className="text-neutral-500 text-sm mb-6">Vul uw gegevens in en ontvang binnen 24 uur vrijblijvende offertes.</p>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            required
            placeholder="Uw naam"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <input
            required
            placeholder="E-mailadres"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            required
            placeholder="Telefoonnummer"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input
              required
              placeholder={country === 'NL' ? 'Postcode (bijv. 1234 AB)' : 'Postcode (bijv. 2000)'}
              type="text"
              value={form.postcode}
              onChange={(e) => setForm({ ...form, postcode: e.target.value })}
              className="w-full bg-white border border-neutral-300/50 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="flex rounded-xl border border-neutral-300/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setCountry('NL')}
              className={`px-4 py-3.5 text-xs font-bold transition-colors ${country === 'NL' ? 'bg-primary text-white' : 'bg-white text-neutral-500 hover:bg-neutral-100/50'}`}
            >
              NL
            </button>
            <button
              type="button"
              onClick={() => setCountry('BE')}
              className={`px-4 py-3.5 text-xs font-bold transition-colors ${country === 'BE' ? 'bg-primary text-white' : 'bg-white text-neutral-500 hover:bg-neutral-100/50'}`}
            >
              BE
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 accent-primary cursor-pointer"
          />
          <span className="text-xs text-neutral-500 leading-relaxed">
            Ik ga akkoord met de verwerking van mijn gegevens conform de privacyverklaring.
          </span>
        </label>

        <button
          type="submit"
          disabled={!consent || submitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${
            !consent ? 'bg-neutral-300/50 text-neutral-500 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
          }`}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Ontvang Gratis Offertes <ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
};
