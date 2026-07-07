import { defineConfig, devices } from "@playwright/test";

// Real-endpoint tests (tagged @real-endpoint) hit the actual Google Translate
// free endpoint and/or our own /api/translate proxy instead of mocks - opt in
// with `pnpm test:e2e:real`, since they need real network access and (for
// the proxy) a configured GOOGLE_TRANSLATE_API_KEY, and are inherently
// flakier/slower than the mocked default suite.
const runningRealEndpointTests = !!process.env.RUN_REAL_ENDPOINT_TESTS;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  grepInvert: runningRealEndpointTests ? undefined : /@real-endpoint/,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
