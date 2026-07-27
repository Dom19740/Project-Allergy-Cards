import { defineHandler } from "nitro";
import { createError, getRequestHeader, getRequestIP, readBody, setResponseHeader } from "nitro/h3";
import { enforceOrigin } from "../../utils/cors";
import { claimTrackEvent, recordTrackEvent } from "../../utils/affiliate-store";

const REF_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const EVENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_BODY_BYTES = 2048;

// Only combinations our clients actually send - rejecting anything else keeps
// the counters honest (e.g. a stray "purchase"+"web" here must not
// double-count what the Lemon Squeezy webhook already records).
const VALID_COMBOS = new Set(["landing:web", "install:android", "purchase:android"]);

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

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

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  enforceRateLimit(clientIp, 30);

  // Best-effort size guard - content-length is client-supplied, but this
  // payload is a handful of short fields, so anything past a couple KB is
  // clearly not a legitimate request.
  const contentLength = Number(getRequestHeader(event, "content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "Payload Too Large" });
  }

  const body = await readBody(event);
  const { event: eventName, ref, platform, eventId, amount, currency } = body ?? {};

  if (typeof ref !== "string" || !REF_PATTERN.test(ref)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ref" });
  }
  if (typeof eventId !== "string" || !EVENT_ID_PATTERN.test(eventId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid eventId" });
  }
  if (typeof eventName !== "string" || typeof platform !== "string" || !VALID_COMBOS.has(`${eventName}:${platform}`)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid event/platform combination" });
  }
  if (amount !== undefined && (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid amount" });
  }
  if (currency !== undefined && (typeof currency !== "string" || !CURRENCY_PATTERN.test(currency))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid currency" });
  }

  const isNew = await claimTrackEvent(eventId);
  if (!isNew) {
    return { success: true, duplicate: true };
  }

  await recordTrackEvent(ref, eventName as "landing" | "install" | "purchase", amount, currency);

  return { success: true };
});
