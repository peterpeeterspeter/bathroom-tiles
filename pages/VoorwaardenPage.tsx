import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

export default function VoorwaardenPage() {
  useSEO({ title: 'Terms of Service - Bathroom Tiles', description: 'Terms of service of bathroom-tiles.com and the digital bathroom planner tool.' });

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-sm text-neutral-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">Terms of Service</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-10">Terms of Service</h1>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Service</h2>
            <p className="text-sm">bathroom-tiles.com is a platform that connects consumers with qualified bathroom tile specialists. We do not perform renovation work ourselves. Our service consists of collecting project requirements and forwarding them to suitable contractors in your area.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">AI Bathroom Planner</h2>
            <p className="text-sm">The AI Bathroom Planner is a pre-sales tool intended for inspiration and preparation.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
              <li>All visualizations are AI-generated and are for inspiration only</li>
              <li>Dimensions and product details may differ in reality</li>
              <li>Price estimates are non-binding and based on average market rates</li>
              <li>An on-site assessment is always required for final pricing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Not a quote</h2>
            <p className="text-sm">The prices shown on this website do not constitute a quote and create no contractual obligation. Final pricing is agreed exclusively between you and the specialist we refer you to, after a personal consultation and on-site assessment.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Liability</h2>
            <p className="text-sm">bathroom-tiles.com is not liable for decisions made based on the indicative information on this website or in the AI Planner tool. We are also not liable for work performed by the specialists with whom you are connected.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Intellectual property</h2>
            <p className="text-sm">All content on this website, including text, images, and the AI Planner tool, is the property of bathroom-tiles.com and may not be reproduced without written permission.</p>
          </section>

          <p className="text-sm text-neutral-500">For questions about these terms, contact us at info@bathroom-tiles.com.</p>
        </div>
      </div>
    </div>
  );
}
