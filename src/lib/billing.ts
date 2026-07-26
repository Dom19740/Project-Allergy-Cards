"use client";

import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { storage } from './storage';

export const PREMIUM_PRODUCT_ID = 'premium_unlock';
export const PRODUCT_ID = PREMIUM_PRODUCT_ID;

export const LEMON_SQUEEZY_CHECKOUT_URL = 'https://happymunkeestudio.lemonsqueezy.com/checkout/buy/91c95564-fa69-44ce-afcf-6422dfea4ed5';
const PREMIUM_CACHE_KEY = 'isPremium';
const LAST_LOGGED_PURCHASE_KEY = 'lastLoggedPlayPurchaseTransactionId';
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
  // storage.get() runs JSON.parse() on the raw value, so the literal string
  // "true" written by setPremiumCache() comes back as the boolean `true`,
  // not the string 'true' - check for both so this doesn't silently read as
  // false regardless of what was actually persisted.
  const stored = await storage.get<string | boolean>(PREMIUM_CACHE_KEY);
  return stored === 'true' || stored === true;
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

// Testing-only escape hatch: refreshPremiumStatus() deliberately never clears
// a cached "true" on its own (see the comment above), since the Play Store
// reporting "not owned" is ambiguous with a Lemon Squeezy/promo grant. That
// means a refunded-but-not-revoked test purchase stays cached as premium
// forever with no in-app way to undo it. This wipes the cache directly so a
// tester isn't stuck reaching for adb/bmgr every cycle.
export const resetPremiumCacheForTesting = async (): Promise<void> => {
  await storage.remove(PREMIUM_CACHE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: false }));
  }
};

// Google Play charges in the buyer's local currency, so the purchase value
// must come from the actual offer pricing at confirmation time rather than a
// hardcoded amount/currency - the price lookup is best-effort so a lookup
// failure never blocks the 'purchase' conversion event itself from firing.
const logPlayPurchaseEvent = (store: any) => {
  let value: number | undefined;
  let currency: string | undefined;

  try {
    const product = store.get(PREMIUM_PRODUCT_ID);
    const pricingPhase = product?.getOffer()?.pricingPhases?.[0];
    if (typeof pricingPhase?.priceMicros === 'number') {
      value = pricingPhase.priceMicros / 1_000_000;
    }
    currency = pricingPhase?.currency;
  } catch {
    // Fall through and log without value/currency.
  }

  FirebaseAnalytics.logEvent({
    name: 'purchase',
    params: { value, currency },
  }).catch(() => {});
};

// premium_unlock is non-consumable, so Play re-delivers and re-verifies its
// receipt any time the store reconciles receipts for a device that owns it -
// store.when().verified() (and .approved(), which cdv-purchase's Google Play
// adapter re-derives identically for an already-acknowledged non-consumable -
// see googleplay-adapter.ts's toState()) fires every time that happens, not
// just on the original purchase. Confirmed in production: this reconciliation
// can be triggered by things with no user action at all - Play's own
// automated build-validation opens on a fresh .aab upload, and what looks
// like a background app refresh when Play redistributes a release to an
// already-enrolled tester (e.g. after resuming a paused testing track) - so
// neither event name is a safe "a purchase happened" signal on its own.
// transactionId stays stable across re-deliveries of the same purchase, so
// it's a reliable per-purchase dedup key, but it isn't sufficient by itself -
// see isPurchaseInFlight() below for the other half of this guard.
// cdv-purchase's ReceiptsMonitor re-emits verification state from several
// independent triggers (the approve/verify flow, a receiptsReady pass, and a
// 10s polling interval), so store.when().verified() can fire several times
// in quick succession for the same receipt within one session. storage.get/
// set round-trip through the native Preferences bridge, so a purely
// await-based guard has a window where multiple concurrent calls all read
// "not yet logged" before the first write lands. This in-memory set closes
// that gap: it's set synchronously before any await, so no two calls in the
// same session can pass the check for the same transactionId - the persisted
// key still guards across app restarts.
const loggedThisSession = new Set<string>();

// The real problem isn't which cdv-purchase event to hook - verified() and
// approved() both fire for routine reconciliation of a purchase that already
// happened, indistinguishable from a fresh one by transactionId alone (it's
// the same id either way, by design). What actually distinguishes "the user
// is buying this right now" is whether purchasePremium() was called recently
// in this session. The timeout guards against a cancelled/abandoned Play
// purchase dialog leaving this stuck open - offer.order() resolves once the
// purchase flow is launched, not once the user finishes it, so there's no
// other reliable place to clear the flag if they back out.
const PURCHASE_IN_FLIGHT_TIMEOUT_MS = 5 * 60 * 1000;
let purchaseInFlightUntil = 0;

const isPurchaseInFlight = (): boolean => Date.now() < purchaseInFlightUntil;

const logPlayPurchaseEventOnce = async (store: any, receipt: any) => {
  const transactionId: string | undefined = receipt?.lastTransaction?.()?.transactionId;
  if (!transactionId) {
    // No stable id to dedupe against - log rather than silently drop what
    // could be a genuine purchase, matching prior behavior for this edge case.
    logPlayPurchaseEvent(store);
    return;
  }

  if (loggedThisSession.has(transactionId)) {
    return;
  }
  loggedThisSession.add(transactionId);

  const lastLogged = await storage.get<string>(LAST_LOGGED_PURCHASE_KEY);
  if (lastLogged === transactionId) {
    return;
  }

  await storage.set(LAST_LOGGED_PURCHASE_KEY, transactionId);
  logPlayPurchaseEvent(store);
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
      if (isPurchaseInFlight()) {
        logPlayPurchaseEventOnce(store, receipt);
      }
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
  if (isOwned) {
    await setPremiumCache(true);
    return true;
  }

  // Google Play doesn't know about this purchase, but premium may have been
  // granted through a different verified channel (a promo code, or a web
  // checkout via Lemon Squeezy) - the Play store has no visibility into
  // those, so "not owned on Play" must not erase a cache set by one of them.
  return readPremiumCache();
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
        purchaseInFlightUntil = Date.now() + PURCHASE_IN_FLIGHT_TIMEOUT_MS;
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