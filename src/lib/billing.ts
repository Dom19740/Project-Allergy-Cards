"use client";

export const PREMIUM_PRODUCT_ID = 'premium_unlock';
export const PRODUCT_ID = PREMIUM_PRODUCT_ID;

/**
 * Initializes the billing store and registers the premium product.
 */
export const initBilling = () => {
  if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
    const { store, ProductType, Platform } = (window as any).CdvPurchase;
    
    store.register([{
      id: PREMIUM_PRODUCT_ID,
      type: ProductType.NON_CONSUMABLE,
      platform: Platform.GOOGLE_PLAY,
    }]);

    // Handle approved purchases
    store.when().approved((transaction: any) => {
      transaction.verify();
    });

    // Handle verified purchases
    store.when().verified((receipt: any) => {
      receipt.finish();
      localStorage.setItem('isPremium', 'true');
      window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }
};

/**
 * Checks if the user has already purchased the premium version.
 */
export const isPremiumUser = async (): Promise<boolean> => {
  if (localStorage.getItem('isPremium') === 'true') return true;
  
  if (typeof window === 'undefined' || !(window as any).CdvPurchase) {
    return false;
  }

  const { store } = (window as any).CdvPurchase;
  const product = store.get(PREMIUM_PRODUCT_ID);
  return product?.owned || false;
};

/**
 * Initiates the purchase flow for the premium product.
 */
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

/**
 * Restores previous purchases.
 */
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
  if (typeof window === 'undefined' || !(window as any).CdvPurchase) {
    return '€3.99';
  }

  try {
    const { store } = (window as any).CdvPurchase;
    const product = store.get(PREMIUM_PRODUCT_ID);
    return product?.offers?.[0]?.pricingPhases?.[0]?.price ?? '€3.99';
  } catch (error) {
    return '€3.99';
  }
}