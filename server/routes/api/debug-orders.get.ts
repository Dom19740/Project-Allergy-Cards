import { defineHandler } from "nitro";
import { createError, getRequestIP, setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../utils/cors";

// TEMPORARY diagnostic route - lists the last 5 orders (no customer PII) so
// we can confirm the real Lemon Squeezy order `id` (vs the customer-facing
// order_number shown in the dashboard) and check where checkout[custom]
// data actually lands in the API response. Delete this file once done.

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const entry = ipRateLimit.get(clientIp);
  if (!entry || entry.resetAt < now) {
    ipRateLimit.set(clientIp, { count: 1, resetAt: now + 60_000 });
  } else if (entry.count >= 10) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  } else {
    entry.count += 1;
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "Server configuration error" });
  }

  let response: Response;
  try {
    // Orders are already returned newest-first by default; no sort param
    // needed (the API rejects arbitrary sort field names anyway).
    response = await fetch("https://api.lemonsqueezy.com/v1/orders?page%5Bsize%5D=5", {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  const rawBody = await response.text();
  if (!response.ok) {
    return { success: false, _debugUpstreamStatus: response.status, _debugUpstreamBody: rawBody };
  }

  let data: any;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  const orders = (data.data ?? []).map((order: any) => ({
    id: order.id,
    order_number: order.attributes?.order_number ?? null,
    status: order.attributes?.status ?? null,
    total: order.attributes?.total ?? null,
    currency: order.attributes?.currency ?? null,
    created_at: order.attributes?.created_at ?? null,
    customDataGuess: data.meta?.custom_data ?? order.meta?.custom_data ?? order.attributes?.custom_data ?? null,
    attributeKeys: Object.keys(order.attributes ?? {}),
    orderTopLevelKeys: Object.keys(order ?? {}),
  }));

  return { success: true, orders };
});
