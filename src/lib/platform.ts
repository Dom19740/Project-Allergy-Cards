import { Capacitor } from '@capacitor/core';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dpbcreative.simpleallergyalert';

export type MobileOS = 'ios' | 'android' | null;

export const getMobileOS = (): MobileOS => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
};

// True iOS Safari only - third-party iOS browsers (Chrome, Firefox, Brave,
// DuckDuckGo, etc.) are required by Apple to use WebKit under the hood, so
// their user agent otherwise looks Safari-like; their own browser token is
// what distinguishes them here. Only Safari's "Add to Home Screen" flow is
// well-established, so this drives which install instructions to show.
export const isIOSSafari = (): boolean => {
  if (getMobileOS() !== 'ios') return false;
  return !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Brave|Mercury/.test(navigator.userAgent);
};

// Any mobile browser tab - not the installed native Android app, not an
// installed/standalone home-screen web app - regardless of which browser.
// This is the scenario the saved-card backup/install-banner features exist
// to protect against: local-only storage that a "clear browsing data" tap
// (or, on iOS, Safari's own automatic eviction) can wipe out.
export const isMobileWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web' && getMobileOS() !== null;
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};
