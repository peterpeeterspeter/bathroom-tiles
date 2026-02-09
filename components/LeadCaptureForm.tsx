import React, { useState } from 'react';
import { ArrowRight, CheckCircle, User, Mail, Smartphone, MapPin, Loader2 } from 'lucide-react';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  postcode: string;
}

interface LeadCaptureFormProps {
  onSubmit: (data: LeadData, gdprConsent: boolean) => Promise<void>;
}

const fields = [
  { id: 'name' as const, label: 'Naam', icon: User, type: 'text' },
  { id: 'email' as const, label: 'E-mailadres', icon: Mail, type: 'email' },
  { id: 'phone' as const, label: 'Telefoonnummer', icon: Smartphone, type: 'tel' },
  { id: 'postcode' as const, label: 'Postcode', icon: MapPin, type: 'text' },
];

export const LeadCaptureForm = ({ onSubmit }: LeadCaptureFormProps) => {
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '', postcode: '' });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprConsent) return;
    setSubmitting(true);
    try {
      await onSubmit(leadData, gdprConsent);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 md:p-12 border border-neutral-300/50 shadow-xl rounded-2xl md:rounded-3xl">
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6"><CheckCircle size={32} /></div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Ontvang uw prijsindicatie</h2>
          <p className="text-neutral-500 text-sm">Vul uw gegevens in om uw persoonlijke prijsindicatie en visueel voorstel als PDF te ontvangen &mdash; gratis en vrijblijvend.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="space-y-3 md:space-y-4">
            {fields.map(field => (
              <div key={field.id} className="relative">
                <field.icon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                  required
                  placeholder={field.label}
                  type={field.type}
                  value={leadData[field.id]}
                  onChange={(e) => setLeadData({...leadData, [field.id]: e.target.value})}
                  className="w-full bg-neutral-100 border border-neutral-300/50 rounded-xl md:rounded-2xl p-4 md:p-5 pl-12 md:pl-14 font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-neutral-300 accent-primary cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-neutral-500 leading-relaxed">
              Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de privacyverklaring van De Badkamer. Mijn gegevens worden gebruikt om mij een gepersonaliseerd voorstel te bezorgen en contact met mij op te nemen.
            </span>
          </label>

          <button
            type="submit"
            disabled={!gdprConsent || submitting}
            className={`w-full py-5 md:py-6 rounded-xl md:rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 mt-6 md:mt-8 ${
              !gdprConsent ? 'bg-neutral-300/50 text-neutral-500 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
            }`}
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <>Bekijk Prijsindicatie <ArrowRight size={20}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};
