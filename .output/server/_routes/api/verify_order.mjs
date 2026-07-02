import { d as defineHandler, s as setResponseHeader, g as getQuery, c as createError, h as getRequestIP } from "../../_libs/h3.mjs";
import { e as enforceOrigin } from "../../_chunks/cors.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const ipRateLimit = /* @__PURE__ */ new Map();
const orderIdRateLimit = /* @__PURE__ */ new Map();
const enforceRateLimit = (map, key, limit) => {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || entry.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + 6e4 });
    return;
  }
  if (entry.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }
  entry.count += 1;
};
const verifyOrder_get = defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);
  const query = getQuery(event);
  const orderId = query.order_id;
  if (!orderId || typeof orderId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter"
    });
  }
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  enforceRateLimit(ipRateLimit, clientIp, 10);
  enforceRateLimit(orderIdRateLimit, orderId, 10);
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error"
    });
  }
  let response;
  try {
    response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }
  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to verify purchase"
    });
  }
  let data;
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
    statusMessage: "Purchase not verified"
  });
});
export {
  verifyOrder_get as default
};
