import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RAW_SITE_URL =
  (import.meta as any).env?.VITE_SITE_URL || 'https://bathroom-tiles.com';

// normalize (no trailing slash)
const SITE_URL = String(RAW_SITE_URL).replace(/\/+$/, '');

interface SEOProps {
  title: string;
  description?: string;
}

function upsertMeta(selector: string, create: () => HTMLMetaElement): HTMLMetaElement {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function upsertLink(selector: string, create: () => HTMLLinkElement): HTMLLinkElement {
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

export function useSEO({ title, description }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    // meta description
    if (description) {
      const meta = upsertMeta('meta[name="description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      });
      meta.setAttribute('content', description);
    }

    // canonical path normalize: keep "/" but remove trailing slash on others
    const rawPath = location.pathname || '/';
    const path = rawPath !== '/' ? rawPath.replace(/\/+$/, '') : '/';

    const canonicalUrl = (SITE_URL + path).replace(/([^:]\/)\/+/g, '$1');

    // canonical link
    const canon = upsertLink('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    canon.setAttribute('href', canonicalUrl);

    // OpenGraph URL
    const ogUrl = upsertMeta('meta[property="og:url"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    });
    ogUrl.setAttribute('content', canonicalUrl);

    // OpenGraph title/description (recommended)
    const ogTitle = upsertMeta('meta[property="og:title"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:title');
      return m;
    });
    ogTitle.setAttribute('content', title);

    if (description) {
      const ogDesc = upsertMeta('meta[property="og:description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:description');
        return m;
      });
      ogDesc.setAttribute('content', description);
    }
  }, [title, description, location.pathname]);
}
