import { defineHandler } from "nitro";
import { createError, getRequestIP, readBody, setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../utils/cors";
import { isValidPromoCode } from "../../utils/promo-store";

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

const enforceRateLimit = (map: Map<string, { count: number; resetAt: number }>, key: string, limit: number) => {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || entry.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (entry.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }

  entry.count += 1;
};

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  // Codes are short, memorable marketing strings rather than high-entropy
  // secrets, so this endpoint is guessable in principle - the rate limit is
  // the actual defense against enumeration, not the code length.
  enforceRateLimit(ipRateLimit, clientIp, 10);

  const body = await readBody(event);
  const code = body?.code;

  if (!code || typeof code !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Missing code" });
  }

  const normalizedCode = code.trim().toUpperCase();

  if (!(await isValidPromoCode(normalizedCode))) {
    throw createError({ statusCode: 403, statusMessage: "Invalid promo code" });
  }

  return { success: true, code: normalizedCode };
});
