import { d as defineHandler, s as setResponseHeader, g as getQuery, c as createError } from "../../_libs/h3.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const verifyRateLimit = /* @__PURE__ */ new Map();
const enforceRateLimit = (key) => {
  const now = Date.now();
  const entry = verifyRateLimit.get(key);
  if (!entry || entry.resetAt < now) {
    verifyRateLimit.set(key, { count: 1, resetAt: now + 6e4 });
    return;
  }
  if (entry.count >= 10) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }
  entry.count += 1;
};
const verifyOrder_get = defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const query = getQuery(event);
  const orderId = query.order_id;
  const sessionToken = query.session_token;
  if (!orderId || typeof orderId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter"
    });
  }
  if (!sessionToken || typeof sessionToken !== "string") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  enforceRateLimit(`${orderId}:${sessionToken}`);
  const apiKey = process.env.NITRO_LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error"
    });
  }
  const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to verify purchase"
    });
  }
  const data = await response.json();
  const status = data.data?.attributes?.status;
  const orderSessionToken = data.data?.attributes?.custom_data?.session_token;
  if (status === "paid" && orderSessionToken === sessionToken) {
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
