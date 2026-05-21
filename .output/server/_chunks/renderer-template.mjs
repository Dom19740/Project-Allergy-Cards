import { b as HTTPResponse } from "../_libs/h3.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const rendererTemplate = () => new HTTPResponse('<!doctype html>\r\n<html lang="en">\r\n  <head>\r\n    <meta charset="UTF-8" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\r\n    <meta name="description" content="Create and share personalized allergy alert cards in multiple languages. Quick, easy and travel-friendly." />\r\n    <meta name="theme-color" content="#dc2626" />\r\n    <meta name="msapplication-TileColor" content="#ffffff" />\r\n    <meta name="color-scheme" content="light dark" />\r\n    <title>Simple Allergy Alert</title>\r\n\r\n    <!-- PWA Manifest -->\r\n    <link rel="manifest" href="/manifest.json" />\r\n\r\n    <!-- Favicons / App icons (served from public/) -->\r\n    <link rel="icon" href="/favicon.ico" />\r\n    <!-- SVG icon for modern browsers -->\r\n    <link rel="icon" type="image/svg+xml" href="/placeholder.svg" />\r\n    <!-- Apple touch icon (used when adding to home screen on iOS) -->\r\n    <link rel="apple-touch-icon" sizes="180x180" href="/logo_main.png" />\r\n    <!-- Fallback PNG icon (some platforms expect PNG) -->\r\n    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />\r\n    <!-- Optional mask icon for Safari pinned tabs (uses placeholder.svg) -->\r\n    <link rel="mask-icon" href="/placeholder.svg" color="#5bbad5" />\r\n    <script type="module" crossorigin src="/assets/index-6nofNFoY.js"><\/script>\n    <link rel="modulepreload" crossorigin href="/assets/vendor-CL70PqqP.js">\n    <link rel="modulepreload" crossorigin href="/assets/ui-libs-ic80srmf.js">\n    <link rel="stylesheet" crossorigin href="/assets/index-ChzK6hsn.css">\n  </head>\r\n\r\n  <body>\r\n    <div id="root"></div>\r\r\n  </body>\r\n</html>', { headers: { "content-type": "text/html; charset=utf-8" } });
function renderIndexHTML(event) {
  return rendererTemplate(event.req);
}
export {
  renderIndexHTML as default
};
