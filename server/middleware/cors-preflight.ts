import { defineMiddleware } from "nitro";
import { appendCorsPreflightHeaders, getRequestURL, isPreflightRequest, noContent } from "nitro/h3";

// Every other /api/** route only ever received same-origin requests until
// marketing-site/admin.html and the native app's promo redemption call
// started hitting this API cross-origin. Browsers preflight any
// cross-origin request using a non-"simple" header (X-Admin-Secret) or
// content type (application/json) with an OPTIONS request first - file-based
// routing here has no handler for OPTIONS, so without this, every preflight
// failed and the browser silently blocked the real request from ever being
// sent. Must match the same allow-list as server/utils/cors.ts.
const ALLOWED_ORIGINS = new Set([
  "https://simpleallergyalert.com",
  "https://app.simpleallergyalert.com",
  "https://localhost",
]);

export default defineMiddleware((event) => {
  const { pathname } = getRequestURL(event);
  if (!pathname.startsWith("/api/")) return;
  if (!isPreflightRequest(event)) return;

  appendCorsPreflightHeaders(event, {
    origin: (origin) => ALLOWED_ORIGINS.has(origin),
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Admin-Secret"],
  });

  return noContent(204);
});
