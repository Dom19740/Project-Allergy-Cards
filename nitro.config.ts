import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  ssr: false,
  publicDir: "dist",
  routeRules: {
    "/api/**": { cache: false }
  }
});