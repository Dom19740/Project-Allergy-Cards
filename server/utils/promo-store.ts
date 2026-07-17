import { Redis } from "@upstash/redis";

const PROMO_CODES_KEY = "promo_codes";

let redis: Redis | null = null;

// Names match Upstash's own dashboard exactly (this project was created
// directly at upstash.com, not through Vercel's marketplace integration,
// which would have used KV_REST_API_URL/KV_REST_API_TOKEN instead). Lazily
// constructed so a missing config surfaces as a clear runtime error at call
// time rather than at module load (which could otherwise crash unrelated
// routes on cold start).
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

const normalize = (code: string): string => code.trim().toUpperCase();

export const listPromoCodes = async (): Promise<string[]> => {
  const codes = await getRedis().smembers(PROMO_CODES_KEY);
  return codes.sort();
};

export const isValidPromoCode = async (code: string): Promise<boolean> => {
  return (await getRedis().sismember(PROMO_CODES_KEY, normalize(code))) === 1;
};

export const addPromoCode = async (code: string): Promise<void> => {
  await getRedis().sadd(PROMO_CODES_KEY, normalize(code));
};

export const removePromoCode = async (code: string): Promise<void> => {
  await getRedis().srem(PROMO_CODES_KEY, normalize(code));
};
