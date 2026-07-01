import { defineHandler } from "nitro";
import { createError, getRequestIP, readBody, setResponseHeader } from "nitro/h3";

const buckets = new Map<string, { count: number; resetAt: number }>();

const enforceRateLimit = (key: string) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (bucket.count >= 20) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }

  bucket.count += 1;
};

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  enforceRateLimit(clientIp);

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "Translation API key is not configured." });
  }

  const body = await readBody(event);
  const text = body?.text;
  const targetLanguage = body?.targetLanguage;

  if (!text || typeof text !== "string" || !targetLanguage || typeof targetLanguage !== "string") {
    throw createError({ statusCode: 400, statusMessage: "text and targetLanguage are required." });
  }

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target: targetLanguage, format: "text" }),
  });

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: "Failed to translate." });
  }

  const data = await response.json();
  const translatedText = data?.data?.translations?.[0]?.translatedText;

  if (!translatedText) {
    throw createError({ statusCode: 500, statusMessage: "Could not retrieve translation from Google API." });
  }

  return { translatedText };
});
