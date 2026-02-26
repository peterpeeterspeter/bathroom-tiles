import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'privacy' | 'terms' | 'cookies';
}

const privacyContent = `
Bathroom Tiles values the protection of your personal data.

What data do we collect?
- Name, email, phone and ZIP code (when you fill in the contact form)
- Photos you upload of your bathroom
- Your style preferences and product choices
- Technical session data (anonymized)

What do we use your data for?
- To provide you with a personalized renovation proposal
- To contact you for a no-obligation consultation
- To improve our service (anonymized analytics)

Your rights
You have the right to access, correct and delete your personal data. Contact privacy@bathroom-tiles.com for requests.

Retention
Your data is kept for up to 24 months after your last interaction, unless you request earlier deletion.

Data is not shared with third parties beyond necessary service provision.
`.trim();

const termsContent = `
Terms of Use — Bathroom Tiles Digital Tool

This tool is a pre-sales instrument for inspiration and preparation for a personal consultation.

Indicative nature
- All visualizations are AI-generated and for inspiration only
- Dimensions and product details may differ in reality
- Price estimates are non-binding and based on average market rates
- An on-site survey is always required for definitive quotes

No quote
The prices shown do not constitute a quote and create no contractual obligation. Definitive pricing is agreed only after personal consultation and on-site survey.

Product choices
The product selections shown serve as inspiration. Final product choice is made with a Bathroom Tiles advisor. Exact brands, types and dimensions are not guaranteed.

Liability
Bathroom Tiles is not liable for decisions made based on the indicative information in this tool.
`.trim();

const cookiesContent = `
Cookie Policy

This tool uses strictly necessary cookies for the app to function correctly.

Necessary cookies
- Session identification (to track your progress in the tool)
- No third-party tracking cookies
- No marketing or advertising cookies

By using this tool you agree to the placement of strictly necessary cookies.

For questions about our cookie policy, contact privacy@bathroom-tiles.com.
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
