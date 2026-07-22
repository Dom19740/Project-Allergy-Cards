"use client";

import { useEffect } from 'react';

interface PageSEOOptions {
  title: string;
  description?: string;
  // Most routes here are interactive app-flow steps driven by localStorage
  // state (allergen selection, language selection, the rendered card itself)
  // rather than standalone content - indexing them separately would just be
  // thin/duplicate pages competing with the home page. Default to noindex
  // and opt individual pages into indexing explicitly.
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Simple Allergy Alert';
const DEFAULT_DESCRIPTION = 'Create and share personalized allergy alert cards in multiple languages. Quick, easy and travel-friendly.';

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

// React Router never touches document.head, so every route otherwise ships
// the exact same <title>/description from index.html. Each page calls this
// once to set its own title/description/robots tag, and the values reset to
// the app-wide defaults on unmount so navigating back to a page that doesn't
// call this (or back to Home) doesn't inherit a stale title or noindex.
export const usePageSEO = ({ title, description, noindex = true }: PageSEOOptions) => {
  useEffect(() => {
    document.title = title;
    setMetaTag('description', description || DEFAULT_DESCRIPTION);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('description', DEFAULT_DESCRIPTION);
      setMetaTag('robots', 'index, follow');
    };
  }, [title, description, noindex]);
};
