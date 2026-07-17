import { defineHandler } from "nitro";
import { createError, readBody, setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../../utils/cors";
import { enforceAdminAuth } from "../../../utils/admin-auth";
import { removePromoCode, listPromoCodes } from "../../../utils/promo-store";

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  enforceAdminAuth(event);

  const body = await readBody(event);
  const code = body?.code;

  if (!code || typeof code !== "string" || !code.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Missing code" });
  }

  await removePromoCode(code);
  const codes = await listPromoCodes();
  return { success: true, codes };
});
