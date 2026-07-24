import { defineHandler } from "nitro";
import { setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../../utils/cors";
import { enforceAdminAuth } from "../../../utils/admin-auth";
import { getAffiliateSummary } from "../../../utils/affiliate-store";
import { getPlayInstallCountsByRef, getPlayPurchaseCountsByRef, getWebappOpenCountsByRef } from "../../../utils/ga4-analytics";

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  enforceAdminAuth(event);

  const purchaseSummary = await getAffiliateSummary();

  // GA4 is a separate system from the purchase ledger - a failure here
  // (misconfigured credentials, API outage) shouldn't hide purchase data
  // that's already known to be correct, so these just default to empty.
  let webOpensByRef: Record<string, number> = {};
  let playInstallsByRef: Record<string, number> = {};
  let playPurchasesByRef: Record<string, { count: number; total: number }> = {};
  try {
    [webOpensByRef, playInstallsByRef, playPurchasesByRef] = await Promise.all([
      getWebappOpenCountsByRef(),
      getPlayInstallCountsByRef(),
      getPlayPurchaseCountsByRef(),
    ]);
  } catch (error) {
    console.error("Failed to fetch GA4 metrics:", error);
  }

  const purchaseByRef = new Map(purchaseSummary.map((row) => [row.ref, row]));
  const allRefs = new Set([
    ...purchaseByRef.keys(),
    ...Object.keys(webOpensByRef),
    ...Object.keys(playInstallsByRef),
    ...Object.keys(playPurchasesByRef),
  ]);

  // Totals are in the smallest currency unit (cents for USD), matching how
  // Lemon Squeezy itself reports order totals.
  const summary = Array.from(allRefs)
    .sort()
    .map((ref) => {
      const purchaseRow = purchaseByRef.get(ref);
      const playPurchases = playPurchasesByRef[ref];
      return {
        ref,
        webOpens: webOpensByRef[ref] ?? 0,
        currency: purchaseRow?.currency ?? null,
        webPaidCount: purchaseRow?.paidCount ?? 0,
        webPaidTotal: purchaseRow?.paidTotal ?? 0,
        webRefundedCount: purchaseRow?.refundedCount ?? 0,
        webRefundedTotal: purchaseRow?.refundedTotal ?? 0,
        playInstalls: playInstallsByRef[ref] ?? 0,
        playPurchaseCount: playPurchases?.count ?? 0,
        playPurchaseTotal: playPurchases?.total ?? 0,
      };
    });

  return { success: true, summary };
});
