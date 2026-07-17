import { createError, getRequestHeader, getRequestIP } from "nitro/h3";

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

// Shared across all admin routes (list/add/remove all call this) so
// secret-guessing is throttled regardless of which endpoint is hit.
const enforceRateLimit = (key: string, limit: number) => {
  const now = Date.now();
  const entry = ipRateLimit.get(key);
  if (!entry || entry.resetAt < now) {
    ipRateLimit.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (entry.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }

  entry.count += 1;
};

// Single shared secret is proportionate here: one admin (the app owner)
// managing a handful of promo codes, not a multi-user system worth a real
// login flow. Compared via a constant-time-ish check isn't critical since
// this isn't a session token, but rejecting on any mismatch is enough.
export const enforceAdminAuth = (event: any) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  enforceRateLimit(clientIp, 20);

  const expected = process.env.ADMIN_PANEL_SECRET;
  if (!expected) {
    throw createError({ statusCode: 500, statusMessage: "Server configuration error" });
  }

  const provided = getRequestHeader(event, "x-admin-secret");
  if (provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
};
