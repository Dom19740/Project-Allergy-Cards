globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { a as HTTPError, d as defineHandler, i as handleCacheHeaders, j as toResponse, t as toEventHandler, e as defineLazyEventHandler, H as H3Core } from "./_libs/h3.mjs";
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
  "/favicon-16x16.png": {
    "type": "image/png",
    "etag": '"2a7-VFpTkqyXZL6QmWBwZfpxRzglwhg"',
    "mtime": "2025-11-05T18:15:12.201Z",
    "size": 679,
    "path": "../public/favicon-16x16.png"
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
  "/manifest.json": {
    "type": "application/json",
    "etag": '"267-/4y0G69rD4a6GJVADydJIvjfMrI"',
    "mtime": "2026-03-02T15:47:12.803Z",
    "size": 615,
    "path": "../public/manifest.json"
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
  "/site.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"107-vzG6+RvdL83iSkXj8qG+M3M8b2k"',
    "mtime": "2025-11-05T18:15:12.217Z",
    "size": 263,
    "path": "../public/site.webmanifest"
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
  "/allergens/eggs.png": {
    "type": "image/png",
    "etag": '"24a6f-uYHnFpx5qYTAy8SmIthshQEJesg"',
    "mtime": "2025-11-05T15:34:14.432Z",
    "size": 150127,
    "path": "../public/allergens/eggs.png"
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
  "/allergens/lupin.png": {
    "type": "image/png",
    "etag": '"276d0-QVDG45BVzC1D6YPVMI9nDZTicTI"',
    "mtime": "2026-04-17T11:03:04.025Z",
    "size": 161488,
    "path": "../public/allergens/lupin.png"
  },
  "/allergens/milk.png": {
    "type": "image/png",
    "etag": '"16925-AWFDrYWKhh6+E01Bt7nmvmPToO8"',
    "mtime": "2026-07-01T11:15:28.565Z",
    "size": 92453,
    "path": "../public/allergens/milk.png"
  },
  "/allergens/molluscs.png": {
    "type": "image/png",
    "etag": '"285e9-0jUBocYy9E9CHlcx3yxJUKz1NCA"',
    "mtime": "2026-04-17T11:03:04.034Z",
    "size": 165353,
    "path": "../public/allergens/molluscs.png"
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
  "/allergens/peanuts.png": {
    "type": "image/png",
    "etag": '"3c865-0ZGq+oPtNKGJ96sV5vL8ywekez0"',
    "mtime": "2026-04-17T11:04:28.162Z",
    "size": 247909,
    "path": "../public/allergens/peanuts.png"
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
    "etag": '"2ec52-LGGGc0gux4DTs8UUxRkHfBT6yaQ"',
    "mtime": "2026-07-01T06:53:53.252Z",
    "size": 191570,
    "path": "../public/allergens/soy.png"
  },
  "/allergens/sulphites.png": {
    "type": "image/png",
    "etag": '"276b3-CZ0usPdAlRjNvWWvBnbtYNdAPyM"',
    "mtime": "2026-04-17T11:03:04.058Z",
    "size": 161459,
    "path": "../public/allergens/sulphites.png"
  },
  "/allergens/treenuts.png": {
    "type": "image/png",
    "etag": '"1fafc-mrJWX1UXv+eEDPir8lhRp8zGKA0"',
    "mtime": "2026-04-17T11:03:04.066Z",
    "size": 129788,
    "path": "../public/allergens/treenuts.png"
  },
  "/assets/AllergenSelectionPage-VKfV0FdW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"152e-Kc/gu5Dx6WdVWmaoDHSXpXsdR34"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 5422,
    "path": "../public/assets/AllergenSelectionPage-VKfV0FdW.js"
  },
  "/assets/AllergyAlertPage-CKrccLOn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5092-k1EWVpZrIHiWcyyqOL3Vf2OhwuY"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 20626,
    "path": "../public/assets/AllergyAlertPage-CKrccLOn.js"
  },
  "/assets/dialog-HkHsDTRh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7d4-J7LzjIInzbnhisOeqcAl6/b/Wzg"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 2004,
    "path": "../public/assets/dialog-HkHsDTRh.js"
  },
  "/assets/emergencyNumbers-77ht-_Ut.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"41bf-L+6TbfMlVio4N+U45f7CGtUXutw"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 16831,
    "path": "../public/assets/emergencyNumbers-77ht-_Ut.js"
  },
  "/assets/EmergencyPage-BFoREfr3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"21a3-zBajLq5S8hAy4S7KW9CJ/1KPBds"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 8611,
    "path": "../public/assets/EmergencyPage-BFoREfr3.js"
  },
  "/assets/Home-B3HNHr6n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c79-a4o1RfZUcSBzXg43qXK28vlYoA8"',
    "mtime": "2026-07-02T13:34:46.323Z",
    "size": 7289,
    "path": "../public/assets/Home-B3HNHr6n.js"
  },
  "/assets/FixedHeader-CwtvIa-I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"397-lmMmsX8it61UGJDdCZIZu6DWsDc"',
    "mtime": "2026-07-02T13:34:46.339Z",
    "size": 919,
    "path": "../public/assets/FixedHeader-CwtvIa-I.js"
  },
  "/assets/index-B3gPAyG6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ecc-YG9C1TlhW2TawATm0eMBJMNNEkA"',
    "mtime": "2026-07-02T13:34:46.323Z",
    "size": 20172,
    "path": "../public/assets/index-B3gPAyG6.js"
  },
  "/assets/image-libs-CTVJvpcQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"32a9-4ZgO8Q+egGelSiVzcWa1kFaINj4"',
    "mtime": "2026-07-02T13:34:46.323Z",
    "size": 12969,
    "path": "../public/assets/image-libs-CTVJvpcQ.js"
  },
  "/assets/index-Oaq_Zr2z.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"bf59-ydmFQS5uaPRtDhtcvn4DuZNAayc"',
    "mtime": "2026-07-02T13:34:46.315Z",
    "size": 48985,
    "path": "../public/assets/index-Oaq_Zr2z.css"
  },
  "/assets/input-BLzAPvZi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"244-TsoTzYyMc1LC1NreMa5GPbLxYLw"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 580,
    "path": "../public/assets/input-BLzAPvZi.js"
  },
  "/assets/label-DxMFu9It.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16e-6egTElSuEpQuFacFXc52NhHLcQY"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 366,
    "path": "../public/assets/label-DxMFu9It.js"
  },
  "/assets/LanguageSelectionPage-RWv4SLfl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1cb1-Uqc5FmKdCFQjiZPlZRHoF696TV8"',
    "mtime": "2026-07-02T13:34:46.323Z",
    "size": 7345,
    "path": "../public/assets/LanguageSelectionPage-RWv4SLfl.js"
  },
  "/assets/NotFound-DqQmxDIB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"270-VlFVFLqnZTr4MEQTUHME/8HuLik"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 624,
    "path": "../public/assets/NotFound-DqQmxDIB.js"
  },
  "/assets/Onboarding-Z4d3_YJ9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13d9-vXM1XVvXCqSHASfbd6C8odpe3cE"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 5081,
    "path": "../public/assets/Onboarding-Z4d3_YJ9.js"
  },
  "/assets/PageTemplate-DrtheqSL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46e-rulmbXF8gDjZvbLjVqcHuesRPcg"',
    "mtime": "2026-07-02T13:34:46.363Z",
    "size": 1134,
    "path": "../public/assets/PageTemplate-DrtheqSL.js"
  },
  "/assets/PremiumOnboarding-DEZdY2Hq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1cfb-rwCbS5XrRWji8lCTLMYLY53b8/U"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 7419,
    "path": "../public/assets/PremiumOnboarding-DEZdY2Hq.js"
  },
  "/assets/premium-config-BxGL82Av.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1818f-yAJGd6jAJ6oJ3pUFrIgUNJqVIzk"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 98703,
    "path": "../public/assets/premium-config-BxGL82Av.js"
  },
  "/assets/SafetyDisclaimer-CJhA8Uld.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"436-csjszQlyp442OAromrZ/pxck7nk"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 1078,
    "path": "../public/assets/SafetyDisclaimer-CJhA8Uld.js"
  },
  "/assets/SelectAlertPage-BGdT0UAO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1072-a3zNP/VTWujWFL7EK0EWI9zXYfM"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 4210,
    "path": "../public/assets/SelectAlertPage-BGdT0UAO.js"
  },
  "/assets/StepHeader-CyNC5kSW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"339-NTJU7aWmLGMjQpC6EtHOMlPkf8g"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 825,
    "path": "../public/assets/StepHeader-CyNC5kSW.js"
  },
  "/assets/ui-libs-DtMTV0OK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11e08-+i3825Ku3Wwsa3EMnBN/apdS/yw"',
    "mtime": "2026-07-02T13:34:46.322Z",
    "size": 73224,
    "path": "../public/assets/ui-libs-DtMTV0OK.js"
  },
  "/assets/useNetworkStatus-CA3mPnpN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f-ZJQdl4vOOV5LcXhKq69loomdWLg"',
    "mtime": "2026-07-02T13:34:46.324Z",
    "size": 287,
    "path": "../public/assets/useNetworkStatus-CA3mPnpN.js"
  },
  "/assets/vendor-UomSsNGT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79614-RETGboJ7YbvQKUfT8CMrRRPT08M"',
    "mtime": "2026-07-02T13:34:46.323Z",
    "size": 497172,
    "path": "../public/assets/vendor-UomSsNGT.js"
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
  "/images/logo_main.png": {
    "type": "image/png",
    "etag": '"54dba-JBk10Pf9Bsi8eP9giNZHBMQLyvg"',
    "mtime": "2026-05-21T07:55:36.145Z",
    "size": 347578,
    "path": "../public/images/logo_main.png"
  },
  "/images/screenshot_4.png": {
    "type": "image/png",
    "etag": '"1e526-OlzbAgm9LZNrkr5Rceqbl7Fr5CY"',
    "mtime": "2026-05-21T07:55:36.162Z",
    "size": 124198,
    "path": "../public/images/screenshot_4.png"
  },
  "/images/screenshot_1.png": {
    "type": "image/png",
    "etag": '"53747-rxkBn4pELN/GJ4luj0mmc1rH27k"',
    "mtime": "2026-05-21T07:55:36.150Z",
    "size": 341831,
    "path": "../public/images/screenshot_1.png"
  },
  "/images/screenshot_4_alternate.png": {
    "type": "image/png",
    "etag": '"2f9b9-IAkPw7/SIhpjsg/Dwn0U64C/OnM"',
    "mtime": "2026-05-21T07:55:36.167Z",
    "size": 195001,
    "path": "../public/images/screenshot_4_alternate.png"
  },
  "/images/screenshot_5_alternate.png": {
    "type": "image/png",
    "etag": '"28ff1-K95FmEcGOaPJN0nGGRnse5ZxxMI"',
    "mtime": "2026-06-18T06:35:14.142Z",
    "size": 167921,
    "path": "../public/images/screenshot_5_alternate.png"
  },
  "/images/screenshot_5.png": {
    "type": "image/png",
    "etag": '"2a6d5-JgikGyCaaWTrmrZa6gmWwP+JZfQ"',
    "mtime": "2026-06-18T06:34:47.485Z",
    "size": 173781,
    "path": "../public/images/screenshot_5.png"
  },
  "/images/screenshot_6.png": {
    "type": "image/png",
    "etag": '"36374-wIO1M2lvRymQKuHcT5XSUyRMmS0"',
    "mtime": "2026-05-21T07:55:36.180Z",
    "size": 222068,
    "path": "../public/images/screenshot_6.png"
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
const _lazy_d6_OmK = defineLazyEventHandler(() => import("./_routes/api/restore_by_email.mjs"));
const _lazy_3aYzVx = defineLazyEventHandler(() => import("./_routes/api/translate.mjs"));
const _lazy_5QM8KV = defineLazyEventHandler(() => import("./_routes/api/verify_order.mjs"));
const _lazy_VGlaqN = defineLazyEventHandler(() => import("./_chunks/renderer-template.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const $0 = { route: "/api/restore-by-email", method: "post", handler: _lazy_d6_OmK }, $1 = { route: "/api/translate", method: "post", handler: _lazy_3aYzVx }, $2 = { route: "/api/verify-order", method: "get", handler: _lazy_5QM8KV }, $3 = { route: "/**", handler: _lazy_VGlaqN };
  return (m, p) => {
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    if (p === "/api/restore-by-email") {
      if (m === "POST") return { data: $0 };
    } else if (p === "/api/translate") {
      if (m === "POST") return { data: $1 };
    } else if (p === "/api/verify-order") {
      if (m === "GET") return { data: $2 };
    }
    let s = p.split("/");
    s.length;
    return { data: $3, params: { "_": s.slice(1).join("/") } };
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
