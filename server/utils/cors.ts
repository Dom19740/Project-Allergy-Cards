import { createError, getRequestHeader, setResponseHeader } from "nitro/h3";

// The web app and this API are the same deployment, so legitimate traffic
// is same-origin; the native app has no backend calls at all (see
// src/lib/translator.ts). Nothing else should be allowed to call these
// rate-limited, paid/third-party-backed routes from a browser.
const ALLOWED_ORIGINS = new Set([
  "https://simpleallergyalert.com",
  "https://app.simpleallergyalert.com",
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
