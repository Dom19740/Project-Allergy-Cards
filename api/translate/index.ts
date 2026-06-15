/**
 * Vercel Serverless Function
 * POST /api/translate
 * Body: { text: string, targetLanguage: string }
 * GET  /api/translate?languages=1&target=en
 * Requires: process.env.GOOGLE_TRANSLATE_API_KEY
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

const rateLimit = (key: string) => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (bucket.count >= 20) {
    throw new Error("RATE_LIMIT");
  }

  bucket.count += 1;
};

export default async function handler(req: any, res: any) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  let url: URL | null = null;
  try {
    url = new URL(req.url, `http://${req.headers?.host || "localhost"}`);
  } catch {
    // ignore
  }

  const clientKey = req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  try {
    rateLimit(String(clientKey));
  } catch {
    return res.status(429).json({ error: "Too many requests." });
  }

  // Handle GET: list supported languages with English names
  if (req.method === "GET") {
    if (!apiKey) {
      return res.status(500).json({ error: "Translation API key is not configured." });
    }
    const isLanguagesQuery =
      url?.searchParams.get("languages") === "1" || req.query?.languages === "1";
    if (!isLanguagesQuery) {
      return res.status(400).json({ error: "Invalid query. Use ?languages=1&target=en" });
    }
    const target = url?.searchParams.get("target") || req.query?.target || "en";
    try {
      const googleUrl = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}&target=${encodeURIComponent(
        target
      )}`;
      const apiRes = await fetch(googleUrl);
      if (!apiRes.ok) {
        let errorMessage = "Failed to fetch languages.";
        try {
          const errData = await apiRes.json();
          errorMessage = errData?.error?.message || errorMessage;
        } catch {}
        return res.status(apiRes.status).json({ error: errorMessage });
      }
      const data = await apiRes.json();
      const languages = (data?.data?.languages || []).map((l: any) => ({
        code: l?.language,
        name: l?.name,
      }));
      return res.status(200).json({ languages });
    } catch (error) {
      console.error("Languages API error");
      return res.status(500).json({ error: "Internal Server Error" });
    }

  }

  // Only POST translation below
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "Translation API key is not configured." });
  }

  try {
    const { text, targetLanguage } = req.body || {};
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required." });
    }

    const googleApiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const translationData = {
      q: text,
      source: "en",
      target: targetLanguage,
      format: "text",
    };

    const apiRes = await fetch(googleApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(translationData),
    });

    if (!apiRes.ok) {
      let errorMessage = "Failed to translate.";
      try {
        const errorData = await apiRes.json();
        errorMessage = errorData?.error?.message || errorMessage;
      } catch {}
      return res.status(apiRes.status).json({ error: errorMessage });
    }

    const data = await apiRes.json();
    const translatedText = data?.data?.translations?.[0]?.translatedText;

    if (!translatedText) {
      return res.status(500).json({ error: "Could not retrieve translation from Google API." });
    }

    return res.status(200).json({ translatedText });
  } catch (error) {
    if ((error as Error).message === 'RATE_LIMIT') {
      return res.status(429).json({ error: "Too many requests." });
    }
    console.error("Translation API error");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}