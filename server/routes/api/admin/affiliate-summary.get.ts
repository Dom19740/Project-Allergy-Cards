import { defineHandler } from "nitro";
import { setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../../utils/cors";
import { enforceAdminAuth } from "../../../utils/admin-auth";
import { getAffiliateSummary } from "../../../utils/affiliate-store";
import { getWebappOpenCountsByRef } from "../../../utils/ga4-analytics";

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  enforceAdminAuth(event);

  const purchaseSummary = await getAffiliateSummary();

  // GA4 is a separate system from the purchase ledger - a failure here
  // (misconfigured credentials, API outage) shouldn't hide purchase data
  // that's already known to be correct, so opens just default to 0.
  let opensByRef: Record<string, number> = {};
  try {
    opensByRef = await getWebappOpenCountsByRef();
  } catch (error) {
    console.error("Failed to fetch GA4 webapp-open counts:", error);
  }

  const purchaseByRef = new Map(purchaseSummary.map((row) => [row.ref, row]));
  const allRefs = new Set([...purchaseByRef.keys(), ...Object.keys(opensByRef)]);

  // Totals are in the smallest currency unit (cents for USD), matching how
  // Lemon Squeezy itself reports order totals.
  const summary = Array.from(allRefs)
    .sort()
    .map((ref) => {
      const purchaseRow = purchaseByRef.get(ref);
      return {
        ref,
        opens: opensByRef[ref] ?? 0,
        currency: purchaseRow?.currency ?? null,
        paidCount: purchaseRow?.paidCount ?? 0,
        paidTotal: purchaseRow?.paidTotal ?? 0,
        refundedCount: purchaseRow?.refundedCount ?? 0,
        refundedTotal: purchaseRow?.refundedTotal ?? 0,
      };
    });

  return { success: true, summary };
});
