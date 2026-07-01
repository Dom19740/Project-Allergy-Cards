import { defineHandler } from "nitro";
import { createError, getRequestIP, readBody, setResponseHeader } from "nitro/h3";
import { SUPPORTED_LANGUAGE_CODES } from "../../../src/lib/supportedLanguages";
import { enforceOrigin } from "../../utils/cors";

// Generous ceiling for any phrase this app actually sends (fixed UI text,
// allergen names, custom alert messages) - not a UX limit, just a cap on
// how much a single request can cost against the paid, per-character-billed
// Google Cloud Translation API.
const MAX_TEXT_LENGTH = 500;

const buckets = new Map<string, { count: number; resetAt: number }>();

const enforceRateLimit = (key: string) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (bucket.count >= 40) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }

  bucket.count += 1;
};

export default defineHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  enforceOrigin(event);

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

  if (text.length > MAX_TEXT_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: "text is too long." });
  }

  if (!SUPPORTED_LANGUAGE_CODES.has(targetLanguage)) {
    throw createError({ statusCode: 400, statusMessage: "Unsupported targetLanguage." });
  }

  // The outbound fetch/parse is wrapped so a raw network error (whose
  // message can include this request's URL - and therefore the API key)
  // never propagates as an unhandled exception that might get logged
  // verbatim by the hosting platform.
  let response: Response;
  try {
    response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: targetLanguage, format: "text" }),
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: "Failed to translate." });
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }

  const translatedText = data?.data?.translations?.[0]?.translatedText;

  if (!translatedText) {
    throw createError({ statusCode: 500, statusMessage: "Could not retrieve translation from Google API." });
  }

  return { translatedText };
});
