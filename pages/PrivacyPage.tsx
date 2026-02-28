import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

export default function PrivacyPage() {
  useSEO({ title: 'Privacy Policy - Bathroom Tiles', description: 'Privacy policy of bathroom-tiles.com. Learn how we handle your personal data.' });

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-sm text-neutral-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-10">Privacy Policy</h1>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <p>bathroom-tiles.com values the protection of your personal data.</p>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">What data do we collect?</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Name, email address, phone number, and ZIP code (when filling out the contact form)</li>
              <li>Country (United States)</li>
              <li>Photos you upload of your bathroom (only via the AI Planner)</li>
              <li>Your style preferences and product choices</li>
              <li>Technical session data (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">How do we use your data?</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>To match you with qualified bathroom tile specialists in your area</li>
              <li>To provide you with a personalized renovation proposal</li>
              <li>To contact you for a no-obligation consultation</li>
              <li>To improve our service (anonymized analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Sharing with third parties</h2>
            <p className="text-sm">Your contact details are shared with up to 3 selected bathroom specialists in your area, so they can provide you with a no-obligation quote. Your data is not shared with third parties beyond what is necessary for the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Your rights</h2>
            <p className="text-sm">You have the right to access, correct, and delete your personal data. Contact us at privacy@bathroom-tiles.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Retention</h2>
            <p className="text-sm">Your data is retained for up to 24 months after your last interaction, unless you request deletion sooner.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Cookies</h2>
            <p className="text-sm">This website uses strictly necessary cookies for the application to function correctly. No third-party tracking cookies or marketing/advertising cookies are used.</p>
          </section>

          <p className="text-sm text-neutral-500">For questions about this privacy policy, contact us at privacy@bathroom-tiles.com.</p>
        </div>
      </div>
    </div>
  );
}
