import { d as defineHandler, s as setResponseHeader, h as getRequestIP, c as createError, r as readBody } from "../../_libs/h3.mjs";
import { e as enforceOrigin } from "../../_chunks/cors.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const SUPPORTED_LANGUAGES = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "ny", name: "Chichewa" },
  { code: "zh-CN", name: "Chinese" },
  { code: "yue", name: "Cantonese" },
  { code: "co", name: "Corsican" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "es-ES", name: "Spanish (European)" },
  { code: "es-419", name: "Spanish (Latin)" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "fy", name: "Frisian" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "iw", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jw", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer (Cambodian)" },
  { code: "ko", name: "Korean" },
  { code: "ku", name: "Kurdish (Kurmanji)" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "my", name: "Myanmar (Burmese)" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt-BR", name: "Portuguese (Brazilian)" },
  { code: "pt-PT", name: "Portuguese (European)" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sm", name: "Samoan" },
  { code: "sr", name: "Serbian" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "yi", name: "Yiddish" }
];
const SUPPORTED_LANGUAGE_CODES = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
const MAX_TEXT_LENGTH = 500;
const buckets = /* @__PURE__ */ new Map();
const enforceRateLimit = (key) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + 6e4 });
    return;
  }
  if (bucket.count >= 40) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }
  bucket.count += 1;
};
const translate_post = defineHandler(async (event) => {
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
  let response;
  try {
    response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: targetLanguage, format: "text" })
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Upstream request failed" });
  }
  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: "Failed to translate." });
  }
  let data;
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
export {
  translate_post as default
};
