import { f as getRequestHeader, c as createError, s as setResponseHeader } from "../_libs/h3.mjs";
const ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "https://simpleallergyalert.com",
  "https://app.simpleallergyalert.com"
]);
const enforceOrigin = (event) => {
  const origin = getRequestHeader(event, "origin");
  if (!origin) return;
  if (!ALLOWED_ORIGINS.has(origin)) {
    throw createError({ statusCode: 403, statusMessage: "Origin not allowed" });
  }
  setResponseHeader(event, "Access-Control-Allow-Origin", origin);
  setResponseHeader(event, "Vary", "Origin");
};
export {
  enforceOrigin as e
};
