import { describe, it, expect, vi, afterEach } from "vitest";
import { Capacitor } from "@capacitor/core";
import {
  isPremiumUser,
  refreshPremiumStatus,
  syncPremiumCache,
  resetPremiumCacheForTesting,
  getPremiumPrice,
  initBilling,
  purchasePremium,
  restorePurchases,
  PREMIUM_PRODUCT_ID,
} from "../billing";

afterEach(() => {
  delete (window as any).CdvPurchase;
});

describe("premium cache (no store present, e.g. web)", () => {
  it("defaults to not premium when nothing has ever been cached", async () => {
    expect(await isPremiumUser()).toBe(false);
  });

  it("syncPremiumCache(true) persists across calls and dispatches a status-changed event", async () => {
    const handler = vi.fn();
    window.addEventListener("premium-status-changed", handler);

    syncPremiumCache(true);
    // syncPremiumCache fires the storage write without awaiting it internally;
    // give the microtask queue a turn to flush the underlying Preferences.set.
    await Promise.resolve();
    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toBe(true);
    expect(await isPremiumUser()).toBe(true);

    window.removeEventListener("premium-status-changed", handler);
  });

  it("resetPremiumCacheForTesting clears a previously cached premium flag", async () => {
    syncPremiumCache(true);
    await Promise.resolve();
    expect(await isPremiumUser()).toBe(true);

    await resetPremiumCacheForTesting();

    expect(await isPremiumUser()).toBe(false);
  });

  it("getPremiumPrice falls back to the fixed web price when there is no store", () => {
    expect(getPremiumPrice()).toBe("€3.99");
  });

  it("initBilling is a no-op outside Android (no CdvPurchase registration attempted)", () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    expect(() => initBilling()).not.toThrow();
    expect((window as any).CdvPurchase).toBeUndefined();
  });

  it("purchasePremium/restorePurchases are no-ops when there is no store (do not throw)", async () => {
    await expect(purchasePremium()).resolves.toBeUndefined();
    await expect(restorePurchases()).resolves.toBeUndefined();
  });
});

describe("premium cache reconciliation with a CdvPurchase store present (Android)", () => {
  const makeStore = (overrides: Partial<{ ready: boolean; owned: boolean }> = {}) => {
    const { ready = true, owned = false } = overrides;
    return {
      ready: vi.fn((cb: () => void) => {
        if (ready) cb();
      }),
      get: vi.fn(() => ({ owned, getOffer: () => null })),
    };
  };

  it("trusts the store's `owned` flag once the store reports ready, and caches it", async () => {
    const store = makeStore({ ready: true, owned: true });
    (window as any).CdvPurchase = { store };

    expect(await refreshPremiumStatus()).toBe(true);
    // A second, store-free check should now read back the cache that was just written.
    delete (window as any).CdvPurchase;
    expect(await isPremiumUser()).toBe(true);
  });

  it("falls back to the last cached status if the store never becomes ready (e.g. no network on cold start)", async () => {
    syncPremiumCache(true);
    await Promise.resolve();

    const store = makeStore({ ready: false });
    (window as any).CdvPurchase = { store };

    vi.useFakeTimers();
    try {
      const resultPromise = refreshPremiumStatus();
      await vi.advanceTimersByTimeAsync(5000); // STORE_READY_TIMEOUT_MS
      expect(await resultPromise).toBe(true); // trusts old cache, not "not owned"
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not erase a cached true when the store reports not-owned (promo/web-grant scenario)", async () => {
    syncPremiumCache(true);
    await Promise.resolve();

    const store = makeStore({ ready: true, owned: false });
    (window as any).CdvPurchase = { store };

    expect(await refreshPremiumStatus()).toBe(true);
  });

  it("purchasePremium orders the offer for the registered product when a store is present", async () => {
    const order = vi.fn(async () => undefined);
    const store = {
      get: vi.fn((id: string) => (id === PREMIUM_PRODUCT_ID ? { getOffer: () => ({ order }) } : undefined)),
    };
    (window as any).CdvPurchase = { store };

    await purchasePremium();

    expect(order).toHaveBeenCalledTimes(1);
  });
});
