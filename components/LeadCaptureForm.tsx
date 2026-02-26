import React, { useState } from 'react';
import { ArrowRight, CheckCircle, User, Mail, Smartphone, MapPin, Calendar, Loader2, AlertCircle, RotateCcw, FileText, Palette, Calculator, Lightbulb, Shield } from 'lucide-react';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  preferredTimeline: string;
}

interface LeadCaptureFormProps {
  onSubmit: (data: LeadData, gdprConsent: boolean) => Promise<void>;
}

const fields = [
  { id: 'name' as const, label: 'Name', icon: User, type: 'text' },
  { id: 'email' as const, label: 'Email', icon: Mail, type: 'email' },
  { id: 'phone' as const, label: 'Phone', icon: Smartphone, type: 'tel' },
  { id: 'postcode' as const, label: 'ZIP code', icon: MapPin, type: 'text' },
];

const timelineOptions = [
  { value: '', label: 'When do you plan to renovate?' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '1_3_months', label: 'Within 1-3 months' },
  { value: '3_6_months', label: 'Within 3-6 months' },
  { value: 'exploring', label: 'Just exploring' },
];

const deliverables = [
  { icon: Palette, text: 'Your AI renovation design in high resolution' },
  { icon: Calculator, text: 'Detailed cost estimate with product prices' },
  { icon: Lightbulb, text: 'Personal advice from our AI architect' },
  { icon: FileText, text: 'Complete renovation dossier as PDF' },
];

export const LeadCaptureForm = ({ onSubmit }: LeadCaptureFormProps) => {
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '', postcode: '', preferredTimeline: '' });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprConsent) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(leadData, gdprConsent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('timeout')) {
        setError('Sending took too long. Check your internet connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-neutral-300/50 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">

        <div className="bg-gradient-to-br from-primary to-primary-dark px-8 md:px-12 py-8 md:py-10 text-white text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Your renovation dossier is ready</h2>
          <p className="text-white/80 text-sm md:text-base">Receive everything in your inbox — free and no obligation</p>
        </div>

        <div className="px-8 md:px-12 py-6 md:py-8 bg-primary/[0.03] border-b border-neutral-300/30">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">What you receive by email</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliverables.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon size={16} className="text-primary" />
                </div>
                <span className="text-sm text-neutral-700 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 md:px-12 py-8 md:py-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {fields.map(field => (
                <div key={field.id} className="relative">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                  <input
                    required
                    placeholder={field.label}
                    type={field.type}
                    value={leadData[field.id]}
                    onChange={(e) => setLeadData({...leadData, [field.id]: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 pl-11 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
              <select
                value={leadData.preferredTimeline}
                onChange={(e) => setLeadData({...leadData, preferredTimeline: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 pl-11 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
              >
                {timelineOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <div className="mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-2 border-neutral-300 accent-primary cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-neutral-500 leading-relaxed">
                I agree to the processing of my personal data in accordance with Bathroom Tiles' privacy policy. My data will be used to provide me with a personalized proposal and to contact me.
              </span>
            </label>

            <button
              type="submit"
              disabled={!gdprConsent || submitting}
              className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                !gdprConsent ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <><Loader2 size={20} className="animate-spin" /> Sending...</>
              ) : error ? (
                <><RotateCcw size={20} /> Try again</>
              ) : (
                <>Get Your Renovation Dossier <ArrowRight size={20}/></>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5 text-neutral-400">
            <Shield size={14} />
            <span className="text-xs">Your data is secure and will never be shared</span>
          </div>
        </div>

      </div>
    </div>
  );
};
