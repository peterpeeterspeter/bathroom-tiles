import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Calendar, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabase';
import { InlineLeadForm } from '../components/InlineLeadForm';
import { useSEO } from '../lib/useSEO';

interface Article {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  content: string;
  category: string;
  image_url: string;
  published_at: string;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      setArticle(data);
      setLoading(false);
    })();
  }, [slug]);

  // Call useSEO with article data when available, or fallback title when loading/not found
  useSEO(article
    ? { title: `${article.title} - De Badkamer`, description: article.meta_description || article.title }
    : { title: 'Artikel - De Badkamer' }
  );

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Artikel niet gevonden</h1>
        <Link to="/advice" className="text-primary font-semibold hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={14} /> Terug naar overzicht
        </Link>
      </div>
    );
  }

  return (
    <>
      <article className="bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <nav className="text-sm text-neutral-500 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/advice" className="hover:text-primary">Advies</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{article.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full capitalize">{article.category}</span>
            {article.published_at && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Calendar size={12} /> {new Date(article.published_at).toLocaleDateString('nl-NL')}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-8">{article.title}</h1>

          {article.image_url && (
            <div className="rounded-2xl overflow-hidden mb-10">
              <img src={article.image_url} alt={article.title} className="w-full h-[300px] md:h-[400px] object-cover" />
            </div>
          )}

          <div
            className="prose prose-neutral max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-neutral-700 [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:space-y-2 [&>ul>li]:text-neutral-700 [&>ol]:space-y-2 [&>ol>li]:text-neutral-700 [&>table]:w-full [&>table]:border-collapse [&>table_th]:bg-primary-dark [&>table_th]:text-white [&>table_th]:px-4 [&>table_th]:py-3 [&>table_th]:text-left [&>table_th]:text-sm [&>table_td]:px-4 [&>table_td]:py-3 [&>table_td]:text-sm [&>table_td]:border-b [&>table_td]:border-neutral-300/30"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
          />
        </div>
      </article>

      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <InlineLeadForm />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/advice" className="text-sm text-neutral-500 hover:text-primary flex items-center gap-2">
            <ArrowLeft size={14} /> Alle artikelen
          </Link>
          <Link to="/get-quote" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
            Gratis offerte aanvragen <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
