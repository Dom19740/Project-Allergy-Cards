import { defineHandler } from "nitro";
import { createError, getQuery, getRequestIP, setResponseHeader } from "nitro/h3";

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();
const orderIdRateLimit = new Map<string, { count: number; resetAt: number }>();

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
  const query = getQuery(event);
  const orderId = query.order_id;

  if (!orderId || typeof orderId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter",
    });
  }

  // Primary defense: throttle by requesting IP, so guessing a different
  // order_id on every request doesn't grant a fresh rate-limit bucket.
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  enforceRateLimit(ipRateLimit, clientIp, 10);

  // Secondary layer: also cap requests per order_id, so a single ID can't
  // be hammered from many different IPs.
  enforceRateLimit(orderIdRateLimit, orderId, 10);

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  // Wrapped so a raw network error never propagates as an unhandled
  // exception that might get logged verbatim by the hosting platform.
  let response: Response;
  try {
    response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to verify purchase",
    });
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  const status = data.data?.attributes?.status;

  if (status === "paid") {
    return { success: true };
  }

  throw createError({
    statusCode: 403,
    statusMessage: "Purchase not verified",
  });
});