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
