import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  routeRules: {
    "/api/**": { cache: false }
  },
  prerender: {
    routes: ["/"] // This forces Nitro to generate .output/public/index.html
  }
});