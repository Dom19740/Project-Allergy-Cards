"use client";

import { Capacitor } from '@capacitor/core';
import { storage } from './storage';

export const PREMIUM_PRODUCT_ID = 'premium_unlock';
export const PRODUCT_ID = PREMIUM_PRODUCT_ID;

export const LEMON_SQUEEZY_CHECKOUT_URL = 'https://happymunkeestudio.lemonsqueezy.com/checkout/buy/91c95564-fa69-44ce-afcf-6422dfea4ed5';
const PREMIUM_CACHE_KEY = 'isPremium';
const STORE_READY_TIMEOUT_MS = 5000;

// Persisted via Capacitor Preferences (native Android SharedPreferences,
// file "CapacitorStorage") rather than session/local storage so that:
// - it survives the app being fully closed and reopened (a fresh WebView
//   session has no sessionStorage/localStorage carried over, which used to
//   make premium status appear "reset" on every cold start), and
// - the home-screen widget, which runs in its own native process, can read
//   the same flag directly.
const setPremiumCache = async (value: boolean): Promise<void> => {
  await storage.set(PREMIUM_CACHE_KEY, value ? 'true' : 'false');
};

const readPremiumCache = async (): Promise<boolean> => {
  const stored = await storage.get<string>(PREMIUM_CACHE_KEY);
  return stored === 'true';
};

// cdv-purchase resolves `product.owned` asynchronously as it loads and
// verifies receipts from the platform store. Right after `store.initialize()`
// is called, `owned` is reliably `false` regardless of actual ownership -
// checking it before the store reports itself ready previously caused a
// cold-started app to conclude (and persist) "not premium" every time, even
// for a user who had already purchased. `store.ready()` is cdv-purchase's
// documented signal that receipts have been loaded and applied, so it's safe
// to trust `owned` afterwards. A timeout guards against this never firing
// (e.g. no network on first launch), falling back to the last known status.
const waitForStoreReady = (store: any): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, STORE_READY_TIMEOUT_MS);

    store.ready(() => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(true);
      }
    });
  });
};

export const syncPremiumCache = (value: boolean) => {
  setPremiumCache(value);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: value }));
  }
};

/**
 * Initializes the billing store and registers the premium product.
 */
export const initBilling = () => {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }

  if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
    const { store, ProductType, Platform } = (window as any).CdvPurchase;

    store.register([
      {
        id: PREMIUM_PRODUCT_ID,
        type: ProductType.NON_CONSUMABLE,
        platform: Platform.GOOGLE_PLAY,
      },
    ]);

    store.when().approved((transaction: any) => {
      transaction.verify();
    });

    store.when().verified((receipt: any) => {
      receipt.finish();
      syncPremiumCache(true);
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }
};

export const refreshPremiumStatus = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!(window as any).CdvPurchase) {
    return readPremiumCache();
  }

  const { store } = (window as any).CdvPurchase;
  const isReady = await waitForStoreReady(store);
  if (!isReady) {
    // The store hasn't finished loading/verifying receipts yet (e.g. no
    // network on a cold start) - trust the last known verified status
    // instead of concluding "not premium" from an unpopulated product.
    return readPremiumCache();
  }

  const product = store.get(PREMIUM_PRODUCT_ID);
  const isOwned = product?.owned || false;
  await setPremiumCache(isOwned);
  return isOwned;
};

export const isPremiumUser = async (): Promise<boolean> => {
  return refreshPremiumStatus();
};

export const purchasePremium = async () => {
  if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
    const { store } = (window as any).CdvPurchase;
    const product = store.get(PREMIUM_PRODUCT_ID);
    if (product) {
      const offer = product.getOffer();
      if (offer) {
        await offer.order();
      }
    }
  }
};

export const restorePurchases = async () => {
  if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
    const { store } = (window as any).CdvPurchase;
    await store.restorePurchases();
  }
};

export function getPremiumPrice(): string {
  const FALLBACK = '€3.99';

  if (Capacitor.getPlatform() !== 'android') {
    return FALLBACK;
  }

  if (typeof window === 'undefined' || !(window as any).CdvPurchase) {
    return FALLBACK;
  }

  try {
    const { store } = (window as any).CdvPurchase;
    const product = store.get(PREMIUM_PRODUCT_ID);

    if (product && product.offers && product.offers[0]) {
      return product.offers[0].pricingPhases[0].price;
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}