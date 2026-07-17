import { createError, getRequestHeader, setResponseHeader } from "nitro/h3";

// The web app and this API are the same deployment, so legitimate traffic
// is same-origin. The native Android app is otherwise backend-call-free
// (see src/lib/translator.ts), with one exception: promo code redemption
// (src/components/PromoCodeDialog.tsx) calls this API from the app's
// WebView, whose origin under Capacitor's default config is always
// https://localhost regardless of which app it is - allowing it doesn't
// grant meaningful extra access since none of these routes are
// cookie/session-authenticated, and they're rate-limited independently.
const ALLOWED_ORIGINS = new Set([
  "https://simpleallergyalert.com",
  "https://app.simpleallergyalert.com",
  "https://localhost",
]);

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
