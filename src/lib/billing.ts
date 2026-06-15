"use client";

import { Capacitor } from '@capacitor/core';

export const PREMIUM_PRODUCT_ID = 'premium_unlock';
export const PRODUCT_ID = PREMIUM_PRODUCT_ID;

export const LEMON_SQUEEZY_CHECKOUT_URL = '/api/create-checkout';
const PREMIUM_CACHE_KEY = 'isPremium';

const setPremiumCache = (value: boolean) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PREMIUM_CACHE_KEY, value ? 'true' : 'false');
};

const readPremiumCache = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PREMIUM_CACHE_KEY) === 'true';
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
  const product = store.get(PREMIUM_PRODUCT_ID);
  const isOwned = product?.owned || false;
  setPremiumCache(isOwned);
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