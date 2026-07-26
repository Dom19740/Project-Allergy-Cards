"use client";

import { Capacitor } from '@capacitor/core';
import { storage } from './storage';

const AFFILIATE_REF_KEY = 'affiliateRef';
const REF_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const INSTALL_REFERRER_REF_KEY = 'installReferrerRef';

// Purely cosmetic - removes ?ref= from the visible address bar once it's
// safely persisted to localStorage. Isolated in its own try/catch so a
// history API failure can never affect ref capture itself.
const stripRefFromAddressBar = () => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  } catch {
    // ignore
  }
};

// Reads ?ref= from the current URL and persists it to localStorage so it
// survives the rest of the session (onboarding, then checkout, then the
// Lemon Squeezy redirect back to /premium-success) without needing to be
// threaded through every route as a query param.
export const captureAffiliateRef = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && REF_PATTERN.test(ref)) {
      window.localStorage.setItem(AFFILIATE_REF_KEY, ref);
      stripRefFromAddressBar();
      return ref;
    }

    return window.localStorage.getItem(AFFILIATE_REF_KEY);
  } catch {
    // localStorage can throw (third-party iframe embeds, some in-app
    // browsers, locked-down enterprise configs) - this call must never
    // block the caller, since it runs before Firebase init/storage
    // migration in App.tsx.
    return null;
  }
};

export const getAffiliateRef = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(AFFILIATE_REF_KEY);
  } catch {
    return null;
  }
};

// Android-only. MainActivity.java reads the Play Install Referrer once per
// install and persists its utm_campaign value into Capacitor storage under
// 'installReferrerRef', since Android cold starts never carry a ?ref= the way
// captureAffiliateRef() reads on web. This picks that value up (if present),
// folds it into the same localStorage key getAffiliateRef() already reads so
// both platforms are indistinguishable from here on, and clears the
// native-side key so it's only ever consumed once.
export const consumeInstallReferrerRef = async (): Promise<string | null> => {
  if (Capacitor.getPlatform() !== 'android') return null;

  try {
    const ref = await storage.get<string>(INSTALL_REFERRER_REF_KEY);
    if (!ref || !REF_PATTERN.test(ref)) return null;

    window.localStorage.setItem(AFFILIATE_REF_KEY, ref);
    await storage.remove(INSTALL_REFERRER_REF_KEY);
    return ref;
  } catch {
    return null;
  }
};
