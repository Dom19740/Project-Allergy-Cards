import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  // @ts-ignore
  bundler: "rollup",
  routeRules: {
    "/api/**": { cache: false }
  },
  prerender: {
    routes: ["/"] // This forces Nitro to generate .output/public/index.html
  }
});