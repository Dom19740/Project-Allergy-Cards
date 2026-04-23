"use client";

export const PRODUCT_ID = 'premium_unlock';

export function getPremiumPrice(): string {
  // Check if store and CdvPurchase are available (Cordova/Capacitor environment)
  // @ts-ignore
  if (typeof store === 'undefined' || typeof CdvPurchase === 'undefined') {
    return '€3.99';
  }

  try {
    // @ts-ignore
    const product = store().get(PRODUCT_ID, CdvPurchase.Platform.GOOGLE_PLAY);
    return product?.offers?.[0]?.pricingPhases?.[0]?.price ?? '€3.99';
  } catch (error) {
    return '€3.99';
  }
}