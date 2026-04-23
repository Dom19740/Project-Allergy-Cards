"use client";

import { storage, STORAGE_KEYS } from './storage';

// Define the product ID for the premium unlock
export const PREMIUM_PRODUCT_ID = 'premium_unlock';

export const isPremiumUser = async (): Promise<boolean> => {
  const status = await storage.get<boolean>('isPremium');
  return !!status;
};

export const setPremiumStatus = async (status: boolean): Promise<void> => {
  await storage.set('isPremium', status);
  // Dispatch event for real-time UI updates
  window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: status }));
};

/**
 * Initialize the store and register products.
 * This should be called early in the app lifecycle.
 */
export const initBilling = () => {
  if (typeof window === 'undefined' || !(window as any).CdvPurchase) return;

  const { store, ProductType, Platform } = (window as any).CdvPurchase;

  // Register the product
  store.register([{
    id: PREMIUM_PRODUCT_ID,
    type: ProductType.NON_CONSUMABLE,
    platform: Platform.GOOGLE_PLAY,
  }]);

  // Handle approved purchases
  store.when().approved((transaction: any) => {
    console.log('Purchase approved:', transaction);
    transaction.verify();
  });

  // Handle verified purchases
  store.when().verified((receipt: any) => {
    console.log('Purchase verified:', receipt);
    receipt.finish();
    setPremiumStatus(true);
  });

  // Handle errors
  store.error((error: any) => {
    console.error('Store Error:', error);
  });

  // Initialize the store
  store.initialize([Platform.GOOGLE_PLAY]);
};

/**
 * Trigger the purchase flow
 */
export const purchasePremium = async () => {
  if (!(window as any).CdvPurchase) {
    throw new Error('Billing system not available');
  }

  const { store } = (window as any).CdvPurchase;
  const product = store.get(PREMIUM_PRODUCT_ID);

  if (product && product.canPurchase) {
    product.getOffer().order();
  } else {
    throw new Error('Product not available for purchase');
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async () => {
  if (!(window as any).CdvPurchase) return;
  const { store } = (window as any).CdvPurchase;
  store.restore();
};