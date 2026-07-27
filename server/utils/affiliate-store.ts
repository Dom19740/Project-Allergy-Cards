import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

// Same lazy-singleton pattern as promo-store.ts, and the same Upstash
// instance/env vars - no new infra needed for this ledger.
const getRedis = (): Redis => {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("Redis is not configured (UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN missing)");
    }
    redis = new Redis({ url, token });
  }
  return redis;
};

export type AffiliateOrderStatus = "paid" | "refunded";

export interface AffiliateOrder {
  orderId: string;
  ref: string;
  total: number | null;
  currency: string | null;
  status: AffiliateOrderStatus;
  createdAt: number;
}

const orderKey = (orderId: string) => `ls_order:${orderId}`;
const refIndexKey = (ref: string) => `affiliate_orders:${ref}`;
const ALL_REFS_KEY = "affiliate_refs";
const counterKey = (ref: string) => `affiliate_counters:${ref}`;
const trackEventDedupKey = (eventId: string) => `track_event:${eventId}`;
const TRACK_EVENT_DEDUP_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const REVENUE_FIELD_PREFIX = "play_purchase_revenue_";
const revenueField = (currency: string) => `${REVENUE_FIELD_PREFIX}${currency}`;

// Atomic claim-once via SET NX EX - avoids the read-then-write race a plain
// GET+SET dedup check would have under concurrent/retried requests.
export const claimTrackEvent = async (eventId: string): Promise<boolean> => {
  const result = await getRedis().set(trackEventDedupKey(eventId), 1, {
    nx: true,
    ex: TRACK_EVENT_DEDUP_TTL_SECONDS,
  });
  return result === "OK";
};

export type TrackEventName = "landing" | "install" | "purchase";

// One Redis hash per ref, fields incremented via HINCRBY (which
// auto-initializes missing fields to 0). Reuses ALL_REFS_KEY so a ref that
// only ever opens/installs - never purchases via Lemon Squeezy - still shows
// up in getAffiliateSummary()'s ref enumeration, with correctly-zeroed
// purchase fields.
//
// Revenue is kept in per-currency fields (play_purchase_revenue_<CCY>), not
// summed into one total - Play purchases can be in any of the buyer's local
// currencies, and summing e.g. USD cents + EUR cents would be silently wrong.
// A currency-less amount buckets under "UNKNOWN" rather than guessing USD.
export const recordTrackEvent = async (
  ref: string,
  eventName: TrackEventName,
  amount?: number,
  currency?: string
): Promise<void> => {
  const redis = getRedis();
  const key = counterKey(ref);
  const ops: Promise<unknown>[] = [redis.sadd(ALL_REFS_KEY, ref)];

  if (eventName === "landing") {
    ops.push(redis.hincrby(key, "web_opens", 1));
  } else if (eventName === "install") {
    ops.push(redis.hincrby(key, "play_installs", 1));
  } else if (eventName === "purchase") {
    ops.push(redis.hincrby(key, "play_purchase_count", 1));
    if (amount) {
      const bucket = currency && CURRENCY_PATTERN.test(currency) ? currency : "UNKNOWN";
      // Cents, matching the Lemon Squeezy ledger's unit (see recordOrder).
      ops.push(redis.hincrby(key, revenueField(bucket), Math.round(amount * 100)));
    }
  }

  await Promise.all(ops);
};

export interface AffiliateEventCounters {
  webOpens: number;
  playInstalls: number;
  playPurchaseCount: number;
  playPurchaseRevenueByCurrency: Record<string, number>; // currency -> cents
}

export const getEventCountersByRef = async (): Promise<Record<string, AffiliateEventCounters>> => {
  const refs = await getRedis().smembers(ALL_REFS_KEY);
  const entries = await Promise.all(
    refs.map(async (ref): Promise<[string, AffiliateEventCounters]> => {
      const hash = await getRedis().hgetall<Record<string, string>>(counterKey(ref));
      const playPurchaseRevenueByCurrency: Record<string, number> = {};
      for (const [field, value] of Object.entries(hash ?? {})) {
        if (field.startsWith(REVENUE_FIELD_PREFIX)) {
          playPurchaseRevenueByCurrency[field.slice(REVENUE_FIELD_PREFIX.length)] = Number(value);
        }
      }
      return [
        ref,
        {
          webOpens: Number(hash?.web_opens ?? 0),
          playInstalls: Number(hash?.play_installs ?? 0),
          playPurchaseCount: Number(hash?.play_purchase_count ?? 0),
          playPurchaseRevenueByCurrency,
        },
      ];
    })
  );
  return Object.fromEntries(entries);
};

// Upserts by orderId so a Lemon Squeezy webhook retry never double-counts a
// sale - a second delivery for the same order just overwrites the record.
export const recordOrder = async (order: AffiliateOrder): Promise<void> => {
  await getRedis().set(orderKey(order.orderId), order);
  await getRedis().zadd(refIndexKey(order.ref), { score: order.createdAt, member: order.orderId });
  await getRedis().sadd(ALL_REFS_KEY, order.ref);
};

// Refunds update the existing record's status in place rather than deleting
// it, so a clawback stays visible in the ledger instead of just vanishing.
export const updateOrderStatus = async (orderId: string, status: AffiliateOrderStatus): Promise<void> => {
  const existing = await getRedis().get<AffiliateOrder>(orderKey(orderId));
  if (!existing) return;
  await getRedis().set(orderKey(orderId), { ...existing, status });
};

export const getOrdersForRef = async (ref: string): Promise<AffiliateOrder[]> => {
  const orderIds = await getRedis().zrange<string[]>(refIndexKey(ref), 0, -1);
  if (orderIds.length === 0) return [];
  const orders = await Promise.all(orderIds.map((id) => getRedis().get<AffiliateOrder>(orderKey(id))));
  return orders.filter((order): order is AffiliateOrder => order !== null);
};

export interface AffiliateRefSummary {
  ref: string;
  currency: string | null;
  paidCount: number;
  paidTotal: number;
  refundedCount: number;
  refundedTotal: number;
  // What's actually owed: paid minus refunded, in the same currency-cents unit.
  netTotal: number;
}

export const getAffiliateSummary = async (): Promise<AffiliateRefSummary[]> => {
  const refs = (await getRedis().smembers(ALL_REFS_KEY)).sort();
  const summaries = await Promise.all(
    refs.map(async (ref): Promise<AffiliateRefSummary> => {
      const orders = await getOrdersForRef(ref);
      const paid = orders.filter((order) => order.status === "paid");
      const refunded = orders.filter((order) => order.status === "refunded");
      const paidTotal = paid.reduce((sum, order) => sum + (order.total ?? 0), 0);
      const refundedTotal = refunded.reduce((sum, order) => sum + (order.total ?? 0), 0);
      return {
        ref,
        currency: orders[0]?.currency ?? null,
        paidCount: paid.length,
        paidTotal,
        refundedCount: refunded.length,
        refundedTotal,
        netTotal: paidTotal - refundedTotal,
      };
    })
  );
  return summaries;
};
