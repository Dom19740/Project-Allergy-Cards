import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  ssr: false,
  routeRules: {
    "/api/**": { cache: false }
  }
});