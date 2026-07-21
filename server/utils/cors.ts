import { createError, getRequestHeader, setResponseHeader } from "nitro/h3";

// The web app and this API are the same deployment, so legitimate traffic
// is same-origin. The native Android app is otherwise backend-call-free
// (see src/lib/translator.ts), with one exception: promo code redemption
// (src/components/PromoCodeDialog.tsx) calls this API from the app's
// WebView, whose origin under Capacitor's default config is always
// https://localhost regardless of which app it is - allowing it doesn't
// grant meaningful extra access since none of these routes are
// cookie/session-authenticated, and they're rate-limited independently.
const STATIC_ALLOWED_ORIGINS = [
  "https://simpleallergyalert.com",
  "https://app.simpleallergyalert.com",
  "https://localhost",
];

// Preview deployment origins aren't knowable ahead of time - Vercel exposes
// the current deployment's own host at runtime via VERCEL_URL (this exact
// deployment) and VERCEL_BRANCH_URL (the stable per-branch preview alias),
// so trust those too instead of hardcoding every preview URL that'll ever
// exist. Both are plain hostnames with no protocol.
const dynamicAllowedOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter((host): host is string => !!host)
  .map((host) => `https://${host}`);

const ALLOWED_ORIGINS = new Set([...STATIC_ALLOWED_ORIGINS, ...dynamicAllowedOrigins]);

// Same-origin navigations and non-browser clients (curl, health checks)
// often don't send an Origin header at all, so absence is allowed through.
// Only a present-but-disallowed Origin is rejected - that's the case that
// otherwise lets any other website's page trigger these calls.
export const enforceOrigin = (event: any) => {
  const origin = getRequestHeader(event, "origin");
  if (!origin) return;

  if (!ALLOWED_ORIGINS.has(origin)) {
    throw createError({ statusCode: 403, statusMessage: "Origin not allowed" });
  }

  setResponseHeader(event, "Access-Control-Allow-Origin", origin);
  setResponseHeader(event, "Vary", "Origin");
};
