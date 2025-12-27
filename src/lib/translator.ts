/**
 * Client-side translation helper.
 * Strategy:
 * 1) Try serverless proxy /api/translate (production, avoids CORS, uses API key)
 * 2) Fallback to public Google Translate endpoint (dev/demo), no custom headers
 *
 * NOTE: We do NOT change any translation callers; this is a drop-in improvement.
 */

const normalizeLanguageCode = (code: string): string => {
  if (!code) return "en";
  // Map to Google-compatible codes where necessary
  switch (code) {
    case "zh-Hans":
      return "zh-CN";
    case "zh-Hant":
      return "zh-TW";
    default:
      return code;
  }
};

const parseGoogleResponse = (data: any): string | null => {
  // Expected shape: data[0][0][0] = translated text
  try {
    const result = data?.[0]?.[0]?.[0];
    return typeof result === "string" ? result : null;
  } catch {
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !targetLanguage || targetLanguage === "en") {
    return text; // No-op
  }

  const tl = normalizeLanguageCode(targetLanguage);

  // First: try our serverless proxy (works on Vercel, avoids CORS, requires API key)
  try {
    console.info("[Translate] Trying serverless proxy /api/translate ...");
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage: tl }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.translatedText) {
        console.info("[Translate] Serverless translation succeeded.");
        return json.translatedText as string;
      } else {
        console.warn("[Translate] Serverless response missing translatedText.");
      }
    } else {
      console.warn("[Translate] Serverless endpoint returned non-OK:", res.status);
    }
  } catch (e) {
    console.warn("[Translate] Serverless proxy failed, falling back to public endpoint:", e);
  }

  // Fallback: public Google endpoint (works in many dev contexts)
  try {
    console.info("[Translate] Using public translate endpoint (gtx) ...");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      tl
    )}&dt=t&q=${encodeURIComponent(text)}`;

    // Do NOT set forbidden headers like 'User-Agent'
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Public translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    const translated = parseGoogleResponse(data);
    if (translated) {
      console.info("[Translate] Public endpoint translation succeeded.");
      return translated;
    }
    throw new Error("Public translation: invalid response shape");
  } catch (error) {
    console.error("[Translate] All methods failed; returning original text. Error:", error);
    return text; // Graceful fallback to original
  }
};

// Get supported languages with English names via serverless, with caching and fallback
export type SupportedLanguage = { code: string; name: string };

let cachedLanguages: SupportedLanguage[] | null = null;
const LS_KEY = "supported_languages_en";
const LS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const getSupportedLanguages = async (): Promise<SupportedLanguage[]> => {
  // Memory cache first
  if (cachedLanguages?.length) return cachedLanguages;

  // LocalStorage cache
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.expires && parsed?.data && Date.now() < parsed.expires) {
        cachedLanguages = parsed.data as SupportedLanguage[];
        if (cachedLanguages?.length) return cachedLanguages;
      }
    }
  } catch {
    // ignore cache errors
  }

  // Serverless fetch
  try {
    const res = await fetch(`/api/translate?languages=1&target=en`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const langs = (json?.languages || []) as SupportedLanguage[];
      // Sort alphabetically by English name
      langs.sort((a, b) => a.name.localeCompare(b.name));
      cachedLanguages = langs;

      // Store in localStorage
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ data: langs, expires: Date.now() + LS_TTL_MS })
        );
      } catch {}
      return langs;
    }
  } catch (e) {
    console.warn("[Languages] Serverless fetch failed:", e);
  }

  // Fallback to a built-in static list in English (avoid importing removed module)
  const FALLBACK: SupportedLanguage[] = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "hi", name: "Hindi" },
    { code: "vi", name: "Vietnamese" },
    { code: "tr", name: "Turkish" },
    { code: "th", name: "Thai" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "sv", name: "Swedish" },
    { code: "uk", name: "Ukrainian" },
    { code: "ms", name: "Malay" },
    { code: "id", name: "Indonesian" },
    { code: "af", name: "Afrikaans" },
    { code: "am", name: "Amharic" },
    { code: "bn", name: "Bengali" },
    { code: "ca", name: "Catalan" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "et", name: "Estonian" },
    { code: "fa", name: "Persian" },
    { code: "fi", name: "Finnish" },
    { code: "hi", name: "Hindi" },
    { code: "gu", name: "Gujarati" },
    { code: "he", name: "Hebrew" },
    { code: "hr", name: "Croatian" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "kn", name: "Kannada" },
    { code: "lt", name: "Lithuanian" },
    { code: "lv", name: "Latvian" },
    { code: "ml", name: "Malayalam" },
    { code: "mr", name: "Marathi" },
    { code: "mt", name: "Maltese" },
    { code: "no", name: "Norwegian" },
    { code: "pa", name: "Punjabi" },
    { code: "ro", name: "Romanian" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "sq", name: "Albanian" },
    { code: "sr", name: "Serbian" },
    { code: "sw", name: "Swahili" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
  ];

  FALLBACK.sort((a, b) => a.name.localeCompare(b.name));
  cachedLanguages = FALLBACK;
  return FALLBACK;
};

// Get all languages directly from Google API for most up-to-date list.
// This is now the main source of truth for language selection.
export const getAllGoogleLanguages = async (): Promise<SupportedLanguage[]> => {
  try {
    console.info("[Languages] Fetching complete list from Google API...");
    const response = await fetch("https://translation.googleapis.com/language/translate/v2/languages?key=AIzaSyD5V4UvTzK7z2nBHlJ6mK8wKJnSQzY&target=en");
    if (!response.ok) {
      throw new Error(`Google languages API failed with status: ${response.status}`);
    }
    const data = await response.json();
    const languages = (data?.data?.languages || []).map((l: any) => ({
      code: l.language,
      name: l.name,
    }));
    // Sort alphabetically by English name for better UX
    languages.sort((a, b) => a.name.localeCompare(b.name));
    console.info("[Languages] Fetched complete list from Google API:", languages.length, "languages");
    return languages as SupportedLanguage[];
  } catch (error) {
    console.error("[Languages] Failed to fetch from Google API:", error);
    // Return a fallback list with common languages
    return [
      { code: "af", name: "Afrikaans" },
      { code: "am", name: "Amharic" },
      { code: "ar", name: "Arabic" },
      { code: "bn", name: "Bengali" },
      { code: "ca", name: "Catalan" },
      { code: "cs", name: "Czech" },
      { code: "da", name: "Danish" },
      { code: "de", name: "German" },
      { code: "el", name: "Greek" },
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "et", name: "Estonian" },
      { code: "fa", name: "Persian" },
      { code: "fi", name: "Finnish" },
      { code: "fr", name: "French" },
      { code: "gu", name: "Gujarati" },
      { code: "he", name: "Hebrew" },
      { code: "hi", name: "Hindi" },
      { code: "hr", name: "Croatian" },
      { code: "hu", name: "Hungarian" },
      { code: "id", name: "Indonesian" },
      { code: "is", name: "Icelandic" },
      { code: "it", name: "Italian" },
      { code: "ja", name: "Japanese" },
      { code: "kn", name: "Kannada" },
      { code: "ko", name: "Korean" },
      { code: "lt", name: "Lithuanian" },
      { code: "lv", name: "Latvian" },
      { code: "ml", name: "Malayalam" },
      { code: "mr", name: "Marathi" },
      { code: "ms", name: "Malay" },
      { code: "mt", name: "Maltese" },
      { code: "nl", name: "Dutch" },
      { code: "no", name: "Norwegian" },
      { code: "pa", name: "Punjabi" },
      { code: "pl", name: "Polish" },
      { code: "pt", name: "Portuguese" },
      { code: "ro", name: "Romanian" },
      { code: "ru", name: "Russian" },
      { code: "sk", name: "Slovak" },
      { code: "sl", name: "Slovenian" },
      { code: "sq", name: "Albanian" },
      { code: "sr", name: "Serbian" },
      { code: "sv", name: "Swedish" },
      { code: "sw", name: "Swahili" },
      { code: "ta", name: "Tamil" },
      { code: "te", name: "Telugu" },
      { code: "th", name: "Thai" },
      { code: "tr", name: "Turkish" },
      { code: "uk", name: "Ukrainian" },
      { code: "ur", name: "Urdu" },
      { code: "vi", name: "Vietnamese" },
      { code: "zh-CN", name: "Chinese (Simplified)" },
      { code: "zh-TW", name: "Chinese (Traditional)" },
    ] as SupportedLanguage[];
  }
};

/**
 * NOTE: This function now uses a placeholder key for direct API access in development.
 * In production, replace the key with your actual Google Translate API key
 * via Vercel Environment Variable: GOOGLE_TRANSLATE_API_KEY
 */