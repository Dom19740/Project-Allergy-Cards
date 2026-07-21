import { Capacitor } from '@capacitor/core';

export const isIOSSafariWeb = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    Capacitor.getPlatform() === 'web' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};
