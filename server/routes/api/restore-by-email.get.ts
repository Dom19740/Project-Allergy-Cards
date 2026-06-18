import { defineHandler } from "nitro";
import { createError, getQuery, setResponseHeader } from "nitro/h3";

const restoreRateLimit = new Map<string, { count: number; resetAt: number }>();

const enforceRateLimit = (key: string) => {
  const now = Date.now();
  const entry = restoreRateLimit.get(key);
  if (!entry || entry.resetAt < now) {
    restoreRateLimit.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (entry.count >= 10) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }

  entry.count += 1;
};

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const query = getQuery(event);
  const restoreToken = query.restore_token;

  if (!restoreToken || typeof restoreToken !== "string") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  enforceRateLimit(restoreToken);

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  const response = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[custom_fields][restore_token]=${encodeURIComponent(restoreToken)}`, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to verify purchase",
    });
  }

  const data = await response.json();
  const orders = data.data || [];
  const matchingOrder = orders.find((order: any) => order.attributes?.status === "paid");

  if (matchingOrder) {
    return { success: true };
  }

  throw createError({
    statusCode: 403,
    statusMessage: "Purchase not verified",
  });
});