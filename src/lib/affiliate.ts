"use client";

const AFFILIATE_REF_KEY = 'affiliateRef';
const REF_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// Reads ?ref= from the current URL and persists it to localStorage so it
// survives the rest of the session (onboarding, then checkout, then the
// Lemon Squeezy redirect back to /premium-success) without needing to be
// threaded through every route as a query param.
export const captureAffiliateRef = (): string | null => {
  if (typeof window === 'undefined') return null;

  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref && REF_PATTERN.test(ref)) {
    window.localStorage.setItem(AFFILIATE_REF_KEY, ref);
    return ref;
  }

  return window.localStorage.getItem(AFFILIATE_REF_KEY);
};

export const getAffiliateRef = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AFFILIATE_REF_KEY);
};
