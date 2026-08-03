import { defineHandler } from "nitro";
import { setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../../utils/cors";
import { enforceAdminAuth } from "../../../utils/admin-auth";
import { listPromoCodes } from "../../../utils/promo-store";
import { getPromoCodeRedemptionCounts } from "../../../utils/ga4-analytics";

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  enforceAdminAuth(event);

  const codes = await listPromoCodes();

  let redemptionCounts: Record<string, number> = {};
  try {
    redemptionCounts = await getPromoCodeRedemptionCounts();
  } catch (error) {
    console.error("Failed to fetch promo code redemption counts:", error);
  }

  return { success: true, codes, redemptionCounts };
});
