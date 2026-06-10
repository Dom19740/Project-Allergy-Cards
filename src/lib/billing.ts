"use client";

import { Capacitor } from '@capacitor/core';

export const PREMIUM_PRODUCT_ID = 'premium_unlock';
export const PRODUCT_ID = PREMIUM_PRODUCT_ID;

// Replace this with your actual Lemon Squeezy checkout link
export const LEMON_SQUEEZY_CHECKOUT_URL = 'https://happymunkeestudio.lemonsqueezy.com/checkout/buy/e1fd4e62-2d89-42b2-aaf5-4e8148c81e33';

/**
 * Initializes the billing store and registers the premium product.
 */
export const initBilling = () => {
  if (Capacitor.getPlatform() !== 'android') {
    // Skip Google Play initialization on Web/iOS
    return;
  }

  if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
    const { store, ProductType, Platform } = (window as any).CdvPurchase;
    
    store.register([{
      id: PREMIUM_PRODUCT_ID,
      type: ProductType.NON_CONSUMABLE,
      platform: Platform.GOOGLE_PLAY,
    }]);

    store.when().approved((transaction: any) => {
      transaction.verify();
    });

    store.when().verified((receipt: any) => {
      receipt.finish();
      localStorage.setItem('isPremium', 'true');
      window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }
};

export const isPremiumUser = async (): Promise<boolean> => {
  if (localStorage.getItem('isPremium') === 'true') return true;
  
  if (typeof window === 'undefined' || !(window as any).CdvPurchase) {
    return false;
  }

  const { store } = (window as any).CdvPurchase;
  const product = store.get(PREMIUM_PRODUCT_ID);
  return product?.owned || false;
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

/**
 * Fetches the localized price for the premium product.
 */
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
  } catch (error) {
    return FALLBACK;
  }
}