import { defineHandler } from "nitro";
import { setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../../utils/cors";
import { enforceAdminAuth } from "../../../utils/admin-auth";
import { getAffiliateSummary, getEventCountersByRef } from "../../../utils/affiliate-store";
import {
  // getPlayInstallCountsByRef,   -- now sourced from our own Redis counters (see getEventCountersByRef)
  // getPlayPurchaseCountsByRef,  -- now sourced from our own Redis counters (see getEventCountersByRef)
  getSiteTotals,
  // getWebappOpenCountsByRef,    -- now sourced from our own Redis counters (see getEventCountersByRef)
} from "../../../utils/ga4-analytics";

// GA4's own placeholder values for "no campaign attribution" - not real
// referrers, so excluded from the per-referrer breakdown. Organic activity
// still shows up, just in the site-wide totals instead.
const NON_REFERRAL_VALUES = new Set(["(direct)", "(not set)", "(none)"]);

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  enforceAdminAuth(event);

  const purchaseSummary = await getAffiliateSummary();

  // Web opens / Play installs / Play purchases now come from our own Redis
  // counters (real-time, written by /api/track), not GA4. Site-wide totals
  // still need GA4 - our own pipeline only ever sees traffic that already has
  // a ref, so it has no organic (non-referred) numbers to report.
  let eventCountersByRef: Awaited<ReturnType<typeof getEventCountersByRef>> = {};
  let totals: Awaited<ReturnType<typeof getSiteTotals>> | null = null;
  try {
    [eventCountersByRef, totals] = await Promise.all([getEventCountersByRef(), getSiteTotals()]);
  } catch (error) {
    console.error("Failed to fetch traffic metrics:", error);
  }

  const purchaseByRef = new Map(purchaseSummary.map((row) => [row.ref, row]));
  const allRefs = new Set([...purchaseByRef.keys(), ...Object.keys(eventCountersByRef)]);
  for (const value of NON_REFERRAL_VALUES) allRefs.delete(value);

  // Totals are in the smallest currency unit (cents for USD), matching how
  // Lemon Squeezy itself reports order totals.
  const summary = Array.from(allRefs)
    .sort()
    .map((ref) => {
      const purchaseRow = purchaseByRef.get(ref);
      const counters = eventCountersByRef[ref];
      return {
        ref,
        webOpens: counters?.webOpens ?? 0,
        currency: purchaseRow?.currency ?? null,
        webPaidCount: purchaseRow?.paidCount ?? 0,
        webPaidTotal: purchaseRow?.paidTotal ?? 0,
        webRefundedCount: purchaseRow?.refundedCount ?? 0,
        webRefundedTotal: purchaseRow?.refundedTotal ?? 0,
        playInstalls: counters?.playInstalls ?? 0,
        playPurchaseCount: counters?.playPurchaseCount ?? 0,
        playPurchaseRevenueByCurrency: counters?.playPurchaseRevenueByCurrency ?? {},
      };
    });

  return { success: true, totals, summary };
});
