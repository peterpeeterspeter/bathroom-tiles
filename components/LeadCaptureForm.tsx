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
      <div className="bg-white p-8 md:p-12 border-4 border-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] rounded-2xl md:rounded-[3rem]">
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6"><CheckCircle size={32} /></div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-4 leading-tight uppercase">Ontvang uw prijsindicatie</h2>
          <p className="text-slate-500 font-bold text-sm">Vul uw gegevens in om uw prijsindicatie en PDF-voorstel te ontvangen.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            {fields.map(field => (
              <div key={field.id} className="relative">
                <field.icon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  placeholder={field.label}
                  type={field.type}
                  value={leadData[field.id]}
                  onChange={(e) => setLeadData({...leadData, [field.id]: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-4 md:p-5 pl-12 md:pl-14 font-bold outline-none focus:border-accent transition-all"
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
                className="w-5 h-5 rounded border-2 border-slate-300 accent-accent cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-slate-500 leading-relaxed">
              Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de privacyverklaring van De Badkamer. Mijn gegevens worden gebruikt om mij een gepersonaliseerd voorstel te bezorgen en contact met mij op te nemen.
            </span>
          </label>

          <button
            type="submit"
            disabled={!gdprConsent || submitting}
            className={`w-full py-5 md:py-6 rounded-xl md:rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 mt-6 md:mt-8 shadow-2xl ${
              !gdprConsent ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-800 shadow-black/20'
            }`}
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <>Bekijk Prijsindicatie <ArrowRight size={20}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};
