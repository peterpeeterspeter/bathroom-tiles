import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string;
  published_at: string;
}

export default function AdviesPage() {
  useSEO({ title: 'Advies & Inspiratie voor Badkamer Renovatie - De Badkamer', description: 'Tips, inspiratie en advies voor uw badkamer renovatie. Van kosten tot trends: alles wat u moet weten.' });

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, category, image_url, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setArticles(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <nav className="text-sm text-neutral-500 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">Advies</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 mb-4">Advies & Inspiratie</h1>
          <p className="text-lg text-neutral-500 max-w-2xl">Tips, trends en praktische informatie voor uw badkamerrenovatie.</p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 mb-4">Binnenkort verschijnen hier onze eerste artikelen.</p>
              <Link to="/offerte-aanvragen" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                Vraag in de tussentijd een gratis offerte aan <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/advies/${article.slug}`}
                  className="group bg-white rounded-2xl border border-neutral-300/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  {article.image_url && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full capitalize">{article.category}</span>
                      {article.published_at && (
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(article.published_at).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">{article.title}</h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
