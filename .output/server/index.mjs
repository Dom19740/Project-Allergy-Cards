globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { a as HTTPError, d as defineHandler, h as handleCacheHeaders, f as toResponse, t as toEventHandler, e as defineLazyEventHandler, H as H3Core } from "./_libs/h3.mjs";
import { d as defineCachedHandler$1, s as setStorage } from "./_libs/ocache.mjs";
import { c as createStorage, p as prefixStorage } from "./_libs/unstorage.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
import "./_libs/ohash.mjs";
import "node:crypto";
const services = {};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const _assets = {
  ["server:icon-background.png"]: {
    import: () => import("./_virtual/icon-background.mjs").then((r) => r.default || r),
    meta: { "type": "image/png", "etag": '"1f62-gee665XNpvzHaBp+Il60qiw3yaw"', "mtime": "2026-03-04T08:58:31.902Z" }
  },
  ["server:icon-foreground.png"]: {
    import: () => import("./_virtual/icon-foreground.mjs").then((r) => r.default || r),
    meta: { "type": "image/png", "etag": '"e275-0E1/+zhUzeU7S46msiKCHLkB6Jc"', "mtime": "2026-03-04T08:53:59.663Z" }
  }
};
const normalizeKey = function normalizeKey2(key2) {
  if (!key2) return "";
  return key2.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};
const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets));
  },
  hasItem(id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets);
  },
  getItem(id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null);
  },
  getMeta(id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {});
  }
};
function initStorage() {
  const storage = createStorage({});
  storage.mount("/assets", assets$1);
  return storage;
}
function useStorage(base = "") {
  const storage = useStorage._storage ??= initStorage();
  return base ? prefixStorage(storage, base) : storage;
}
let _storageReady = false;
function ensureStorage() {
  if (_storageReady) {
    return;
  }
  _storageReady = true;
  const storage = useStorage();
  setStorage({
    get: (key2) => storage.getItem(key2),
    set: (key2, value, opts) => storage.setItem(key2, value, opts?.ttl ? { ttl: opts.ttl } : void 0)
  });
}
function defaultOnError(error) {
  console.error("[cache]", error);
  useNitroApp().captureError?.(error, { tags: ["cache"] });
}
function defineCachedHandler(handler, opts = {}) {
  ensureStorage();
  const ocacheHandler = defineCachedHandler$1(handler, {
    group: "nitro/handlers",
    onError: defaultOnError,
    toResponse: (value, event) => toResponse(value, event),
    createResponse: (body, init) => new NodeResponse(body, init),
    handleCacheHeaders: (event, conditions) => handleCacheHeaders(event, conditions),
    ...opts
  });
  return defineHandler((event) => ocacheHandler(event));
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const cache = ((m) => function cacheRouteRule(event, next) {
  if (!event.context.matchedRoute) {
    return next();
  }
  const cachedHandlers = globalThis.__nitroCachedHandlers ??= /* @__PURE__ */ new Map();
  const { handler, route } = event.context.matchedRoute;
  const key2 = `${m.route}:${route}`;
  let cachedHandler = cachedHandlers.get(key2);
  if (!cachedHandler) {
    cachedHandler = defineCachedHandler(handler, {
      group: "nitro/route-rules",
      name: key2,
      ...m.options
    });
    cachedHandlers.set(key2, cachedHandler);
  }
  return cachedHandler(event);
});
const assets = {
  "/android-chrome-192x192.png": {
    "type": "image/png",
    "etag": '"347e-5PfXwYrmUvS92a4KZimv1JAiWUc"',
    "mtime": "2025-11-05T18:15:12.166Z",
    "size": 13438,
    "path": "../public/android-chrome-192x192.png"
  },
  "/android-chrome-512x512.png": {
    "type": "image/png",
    "etag": '"8ada-QRxEReU9SvQuxmPDvngmJd7RrYc"',
    "mtime": "2025-11-05T18:15:12.176Z",
    "size": 35546,
    "path": "../public/android-chrome-512x512.png"
  },
  "/apple-touch-icon.png": {
    "type": "image/png",
    "etag": '"3322-8MbDjdqGrgnrDzkfiFHRVETIgFY"',
    "mtime": "2025-11-05T18:15:12.184Z",
    "size": 13090,
    "path": "../public/apple-touch-icon.png"
  },
  "/favicon-32x32.png": {
    "type": "image/png",
    "etag": '"641-fuQbTjTrNRELLMzNtN8VONuYh1U"',
    "mtime": "2025-11-05T18:15:12.209Z",
    "size": 1601,
    "path": "../public/favicon-32x32.png"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"3c2e-mN01PVJgUvuoBqiV7T6LT6e1bJQ"',
    "mtime": "2025-11-05T18:15:12.192Z",
    "size": 15406,
    "path": "../public/favicon.ico"
  },
  "/favicon-16x16.png": {
    "type": "image/png",
    "etag": '"2a7-VFpTkqyXZL6QmWBwZfpxRzglwhg"',
    "mtime": "2025-11-05T18:15:12.201Z",
    "size": 679,
    "path": "../public/favicon-16x16.png"
  },
  "/noentry.png": {
    "type": "image/png",
    "etag": '"4c73-uBWBRpiQgki7Az6KY7y96S7gf04"',
    "mtime": "2025-11-05T11:20:13.978Z",
    "size": 19571,
    "path": "../public/noentry.png"
  },
  "/placeholder.svg": {
    "type": "image/svg+xml",
    "etag": '"4535-v2Wf/usV1uC7EQ8b1qvgPCfbP7c"',
    "mtime": "2025-11-05T18:15:58.246Z",
    "size": 17717,
    "path": "../public/placeholder.svg"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ"',
    "mtime": "2025-10-13T12:10:14.012Z",
    "size": 174,
    "path": "../public/robots.txt"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": '"267-/4y0G69rD4a6GJVADydJIvjfMrI"',
    "mtime": "2026-03-02T15:47:12.803Z",
    "size": 615,
    "path": "../public/manifest.json"
  },
  "/site.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"107-vzG6+RvdL83iSkXj8qG+M3M8b2k"',
    "mtime": "2025-11-05T18:15:12.217Z",
    "size": 263,
    "path": "../public/site.webmanifest"
  },
  "/allergens/eggs.png": {
    "type": "image/png",
    "etag": '"24a6f-uYHnFpx5qYTAy8SmIthshQEJesg"',
    "mtime": "2025-11-05T15:34:14.432Z",
    "size": 150127,
    "path": "../public/allergens/eggs.png"
  },
  "/allergens/celery.png": {
    "type": "image/png",
    "etag": '"19a9e-RqJHNwYr3pm0RGeM0uufeEN9Mwo"',
    "mtime": "2026-04-17T11:04:28.158Z",
    "size": 105118,
    "path": "../public/allergens/celery.png"
  },
  "/allergens/crustaceans.png": {
    "type": "image/png",
    "etag": '"265f2-Y968ZZpuv7hmFCkddPMfPEY6sUc"',
    "mtime": "2026-04-17T11:03:04.010Z",
    "size": 157170,
    "path": "../public/allergens/crustaceans.png"
  },
  "/allergens/milk.png": {
    "type": "image/png",
    "etag": '"f929-yV7cr5y9zGUByYbLsnUJmNat/Xk"',
    "mtime": "2025-10-29T13:35:47.290Z",
    "size": 63785,
    "path": "../public/allergens/milk.png"
  },
  "/allergens/gluten.png": {
    "type": "image/png",
    "etag": '"18223-rKMJMpLi6/yoYh+X3TgZeTJOQfo"',
    "mtime": "2026-04-17T11:03:04.018Z",
    "size": 98851,
    "path": "../public/allergens/gluten.png"
  },
  "/allergens/fish.png": {
    "type": "image/png",
    "etag": '"2693f-eE/4QnEybN/Z2gn7Tl1Wmz3Xgus"',
    "mtime": "2025-11-05T15:32:50.566Z",
    "size": 158015,
    "path": "../public/allergens/fish.png"
  },
  "/allergens/molluscs.png": {
    "type": "image/png",
    "etag": '"285e9-0jUBocYy9E9CHlcx3yxJUKz1NCA"',
    "mtime": "2026-04-17T11:03:04.034Z",
    "size": 165353,
    "path": "../public/allergens/molluscs.png"
  },
  "/allergens/lupin.png": {
    "type": "image/png",
    "etag": '"276d0-QVDG45BVzC1D6YPVMI9nDZTicTI"',
    "mtime": "2026-04-17T11:03:04.025Z",
    "size": 161488,
    "path": "../public/allergens/lupin.png"
  },
  "/allergens/peanuts.png": {
    "type": "image/png",
    "etag": '"3c865-0ZGq+oPtNKGJ96sV5vL8ywekez0"',
    "mtime": "2026-04-17T11:04:28.162Z",
    "size": 247909,
    "path": "../public/allergens/peanuts.png"
  },
  "/allergens/mustard.png": {
    "type": "image/png",
    "etag": '"26e6b-uaNodqkDMvc+xbafuxHhfR/dOgo"',
    "mtime": "2026-04-17T11:03:04.042Z",
    "size": 159339,
    "path": "../public/allergens/mustard.png"
  },
  "/allergens/sesame.png": {
    "type": "image/png",
    "etag": '"2e21a-brsREG/oNNpwjMRBXpkIynx56Xo"',
    "mtime": "2026-04-17T11:03:04.049Z",
    "size": 188954,
    "path": "../public/allergens/sesame.png"
  },
  "/allergens/shellfish.png": {
    "type": "image/png",
    "etag": '"2b492-+Mb61vRQqQ2U+5Sdt2gdlV8yVYc"',
    "mtime": "2026-04-17T11:04:28.166Z",
    "size": 177298,
    "path": "../public/allergens/shellfish.png"
  },
  "/allergens/soy.png": {
    "type": "image/png",
    "etag": '"2f46d-j0rV0PhbPh4HW6Ww/oGjDNJ976s"',
    "mtime": "2026-04-17T11:04:28.170Z",
    "size": 193645,
    "path": "../public/allergens/soy.png"
  },
  "/allergens/sulphites.png": {
    "type": "image/png",
    "etag": '"276b3-CZ0usPdAlRjNvWWvBnbtYNdAPyM"',
    "mtime": "2026-04-17T11:03:04.058Z",
    "size": 161459,
    "path": "../public/allergens/sulphites.png"
  },
  "/assets/AllergenSelectionPage-DO2YWYQj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1523-XdSP2klYc5tOkQjecMj0sdXLIsI"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 5411,
    "path": "../public/assets/AllergenSelectionPage-DO2YWYQj.js"
  },
  "/assets/button-DjxgI9rD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4cc-FnQx+pzJgkgXEkVgmO9/XiMWn88"',
    "mtime": "2026-06-02T08:25:29.166Z",
    "size": 1228,
    "path": "../public/assets/button-DjxgI9rD.js"
  },
  "/assets/AllergyAlertPage-MSRmCNjQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3f4e-D4FfYZV/g5gv1VmsmGlvFqVG6Mc"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 16206,
    "path": "../public/assets/AllergyAlertPage-MSRmCNjQ.js"
  },
  "/assets/FixedHeader-CL1lvIVZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"274-zBPk2nHyG6OzmFCD6IIiyIRSVuw"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 628,
    "path": "../public/assets/FixedHeader-CL1lvIVZ.js"
  },
  "/assets/EmergencyPage-BCiHheqw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b3c-LtJBtxFNC2oyxk0bbBwJBXGlBdI"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 6972,
    "path": "../public/assets/EmergencyPage-BCiHheqw.js"
  },
  "/assets/emergencyNumbers-CRutGEgY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"350a-GpgymqCkT7oNi6Z5iKMQeC6+55A"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 13578,
    "path": "../public/assets/emergencyNumbers-CRutGEgY.js"
  },
  "/allergens/treenuts.png": {
    "type": "image/png",
    "etag": '"1fafc-mrJWX1UXv+eEDPir8lhRp8zGKA0"',
    "mtime": "2026-04-17T11:03:04.066Z",
    "size": 129788,
    "path": "../public/allergens/treenuts.png"
  },
  "/assets/dialog-DMxNiPb6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7c9-mOg6BhGYiuZvc7SAMHdgiQeYazs"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 1993,
    "path": "../public/assets/dialog-DMxNiPb6.js"
  },
  "/assets/image-libs-CTVJvpcQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"32a9-4ZgO8Q+egGelSiVzcWa1kFaINj4"',
    "mtime": "2026-06-02T08:25:29.128Z",
    "size": 12969,
    "path": "../public/assets/image-libs-CTVJvpcQ.js"
  },
  "/assets/Home-Cz-pcsnH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2453-htDufepTIZw5JzF4st8Ln6hriPI"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 9299,
    "path": "../public/assets/Home-Cz-pcsnH.js"
  },
  "/assets/input-DCZK7Zc3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"244-/5THTA8edvpQMO7bz6d/APfIlgg"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 580,
    "path": "../public/assets/input-DCZK7Zc3.js"
  },
  "/assets/label-n8cshMfd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16e-e1bsj89KwO3HDa+aPWXVfDXM4z8"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 366,
    "path": "../public/assets/label-n8cshMfd.js"
  },
  "/assets/index-DsaJK5rQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"c166-VmMISLARWFOU+gFTxwfB4y/C/WM"',
    "mtime": "2026-06-02T08:25:29.128Z",
    "size": 49510,
    "path": "../public/assets/index-DsaJK5rQ.css"
  },
  "/assets/NotFound-brN1dccg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"270-WWoCMlYES+TU+CoW7nX0tqy8R+Q"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 624,
    "path": "../public/assets/NotFound-brN1dccg.js"
  },
  "/assets/Onboarding-CGdmXPE6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"109a-Ri6wryYAP5go4oNEXeiyALTWk9g"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 4250,
    "path": "../public/assets/Onboarding-CGdmXPE6.js"
  },
  "/assets/LanguageSelectionPage-D9-emg51.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c18-j1bX6L+VXcU/f1dWx7XHd3HiZc0"',
    "mtime": "2026-06-02T08:25:29.128Z",
    "size": 7192,
    "path": "../public/assets/LanguageSelectionPage-D9-emg51.js"
  },
  "/assets/index-Byb7yCxY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c66-VEVjsLoRWpA2x0BgESkr5qzwzwk"',
    "mtime": "2026-06-02T08:25:29.128Z",
    "size": 15462,
    "path": "../public/assets/index-Byb7yCxY.js"
  },
  "/assets/PageTemplate-y2TPZ7fx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a0-V3tT2MXk0QnRriG8UY8YC8qkv0E"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 1184,
    "path": "../public/assets/PageTemplate-y2TPZ7fx.js"
  },
  "/assets/PremiumSuccess-9bKRYVbK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"902-ACqsikUNu2B/AGhSniv9FV0oclw"',
    "mtime": "2026-06-02T08:25:29.155Z",
    "size": 2306,
    "path": "../public/assets/PremiumSuccess-9bKRYVbK.js"
  },
  "/assets/PremiumOnboarding-DxyG654H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ece-ASClbu74C5we+teVbWvkc/Vg3vU"',
    "mtime": "2026-06-02T08:25:29.130Z",
    "size": 7886,
    "path": "../public/assets/PremiumOnboarding-DxyG654H.js"
  },
  "/assets/SelectAlertPage-BNS8OmD2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e0c-riTXgJ+W4SIL7bICYDxmActSztU"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 3596,
    "path": "../public/assets/SelectAlertPage-BNS8OmD2.js"
  },
  "/assets/premium-config-DFtRWcjt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1416-ZimU8u1Hj2cGums5Qo/7mFUWeIw"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 5142,
    "path": "../public/assets/premium-config-DFtRWcjt.js"
  },
  "/assets/StepHeader-DeUhHzVY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"393-mHTZ4Wp61sMwSznr8NO2D6oeXUw"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 915,
    "path": "../public/assets/StepHeader-DeUhHzVY.js"
  },
  "/assets/ui-libs-ic80srmf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1202d-72KZ5J14ED50GxXzsItPREtsu3E"',
    "mtime": "2026-06-02T08:25:29.128Z",
    "size": 73773,
    "path": "../public/assets/ui-libs-ic80srmf.js"
  },
  "/assets/useNetworkStatus-BBJk2u2N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f-5oiSf+U+8lXeRTb2NpdHn5/AMfg"',
    "mtime": "2026-06-02T08:25:29.129Z",
    "size": 287,
    "path": "../public/assets/useNetworkStatus-BBJk2u2N.js"
  },
  "/images/logo_main.png": {
    "type": "image/png",
    "etag": '"54dba-JBk10Pf9Bsi8eP9giNZHBMQLyvg"',
    "mtime": "2026-05-21T07:55:36.145Z",
    "size": 347578,
    "path": "../public/images/logo_main.png"
  },
  "/assets/vendor-CL70PqqP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"78059-nOc7m6ZPAYjkPl7wM0npk4JlKCs"',
    "mtime": "2026-06-02T08:25:29.119Z",
    "size": 491609,
    "path": "../public/assets/vendor-CL70PqqP.js"
  },
  "/images/screenshot_1.png": {
    "type": "image/png",
    "etag": '"53747-rxkBn4pELN/GJ4luj0mmc1rH27k"',
    "mtime": "2026-05-21T07:55:36.150Z",
    "size": 341831,
    "path": "../public/images/screenshot_1.png"
  },
  "/images/screenshot_4.png": {
    "type": "image/png",
    "etag": '"1e526-OlzbAgm9LZNrkr5Rceqbl7Fr5CY"',
    "mtime": "2026-05-21T07:55:36.162Z",
    "size": 124198,
    "path": "../public/images/screenshot_4.png"
  },
  "/images/screenshot_3.png": {
    "type": "image/png",
    "etag": '"2762b-L0vNf1NAIkkqKKz923iapM812kE"',
    "mtime": "2026-05-21T07:55:36.158Z",
    "size": 161323,
    "path": "../public/images/screenshot_3.png"
  },
  "/images/screenshot_2.png": {
    "type": "image/png",
    "etag": '"320fc-NYMYzm1IAEpyuEdSjIi4evLOrFo"',
    "mtime": "2026-05-21T07:55:36.154Z",
    "size": 205052,
    "path": "../public/images/screenshot_2.png"
  },
  "/images/screenshot_5.png": {
    "type": "image/png",
    "etag": '"28866-wz6OGmTHHrkjPgR/BkZ7cVofLQk"',
    "mtime": "2026-05-21T07:55:36.170Z",
    "size": 165990,
    "path": "../public/images/screenshot_5.png"
  },
  "/images/screenshot_4_alternate.png": {
    "type": "image/png",
    "etag": '"2f9b9-IAkPw7/SIhpjsg/Dwn0U64C/OnM"',
    "mtime": "2026-05-21T07:55:36.167Z",
    "size": 195001,
    "path": "../public/images/screenshot_4_alternate.png"
  },
  "/images/screenshot_6.png": {
    "type": "image/png",
    "etag": '"36374-wIO1M2lvRymQKuHcT5XSUyRMmS0"',
    "mtime": "2026-05-21T07:55:36.180Z",
    "size": 222068,
    "path": "../public/images/screenshot_6.png"
  },
  "/images/screenshot_5_alternate.png": {
    "type": "image/png",
    "etag": '"272d9-9+K+mkK+8p8spGDXoIsb9EFFilk"',
    "mtime": "2026-05-21T07:55:36.175Z",
    "size": 160473,
    "path": "../public/images/screenshot_5_alternate.png"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _0neXwe = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "cache", route: "/api/**", handler: cache, options: false }], $1 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "api") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      } else if (s[1] === "assets") {
        r.unshift({ data: $1, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_eokNte = defineLazyEventHandler(() => import("./_routes/api/restore_by_email.mjs"));
const _lazy_5QM8KV = defineLazyEventHandler(() => import("./_routes/api/verify_order.mjs"));
const _lazy_VGlaqN = defineLazyEventHandler(() => import("./_chunks/renderer-template.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const $0 = { route: "/api/restore-by-email", method: "get", handler: _lazy_eokNte }, $1 = { route: "/api/verify-order", method: "get", handler: _lazy_5QM8KV }, $2 = { route: "/**", handler: _lazy_VGlaqN };
  return (m, p) => {
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    if (p === "/api/restore-by-email") {
      if (m === "GET") return { data: $0 };
    } else if (p === "/api/verify-order") {
      if (m === "GET") return { data: $1 };
    }
    let s = p.split("/");
    s.length;
    return { data: $2, params: { "_": s.slice(1).join("/") } };
  };
})();
const globalMiddleware = [
  toEventHandler(_0neXwe)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
