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

// Upserts by orderId so a Lemon Squeezy webhook retry never double-counts a
// sale - a second delivery for the same order just overwrites the record.
export const recordOrder = async (order: AffiliateOrder): Promise<void> => {
  await getRedis().set(orderKey(order.orderId), order);
  await getRedis().zadd(refIndexKey(order.ref), { score: order.createdAt, member: order.orderId });
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
