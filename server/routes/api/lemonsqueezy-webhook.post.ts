import { defineHandler } from "nitro";
import { createError, getRequestHeader, readRawBody, setResponseHeader } from "nitro/h3";
import { createHmac, timingSafeEqual } from "node:crypto";
import { recordOrder, updateOrderStatus } from "../../utils/affiliate-store";

const REF_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// Lemon Squeezy signs the raw request body with HMAC-SHA256 using the
// webhook secret configured in their dashboard, sent as a hex digest in the
// X-Signature header. timingSafeEqual requires equal-length buffers, so the
// length is checked first rather than letting it throw.
const isValidSignature = (rawBody: string, signature: string, secret: string): boolean => {
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
};

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "Server configuration error" });
  }

  const signature = getRequestHeader(event, "x-signature");
  if (!signature) {
    throw createError({ statusCode: 401, statusMessage: "Missing signature" });
  }

  // Must verify against the exact bytes Lemon Squeezy signed - re-serializing
  // parsed JSON can change whitespace/key order and break the comparison.
  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: "Empty body" });
  }

  if (!isValidSignature(rawBody, signature, secret)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid JSON" });
  }

  const orderId = payload?.data?.id;
  if (typeof orderId !== "string") {
    // Not an order-shaped payload - nothing for this ledger to record.
    return { success: true };
  }

  const eventName = payload?.meta?.event_name;

  if (eventName === "order_created") {
    // custom_data lives under meta, not data.attributes, for webhook
    // deliveries (confirmed against Lemon Squeezy's docs).
    const ref = payload?.meta?.custom_data?.ref;
    if (typeof ref !== "string" || !REF_PATTERN.test(ref)) {
      // Organic purchase with no affiliate ref attached - nothing to attribute.
      return { success: true };
    }

    const attributes = payload?.data?.attributes;
    await recordOrder({
      orderId,
      ref,
      total: typeof attributes?.total === "number" ? attributes.total : null,
      currency: typeof attributes?.currency === "string" ? attributes.currency : null,
      status: "paid",
      createdAt: Date.now(),
    });
  } else if (eventName === "order_refunded") {
    await updateOrderStatus(orderId, "refunded");
  }

  return { success: true };
});
