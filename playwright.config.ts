import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { actionTimeout: 10000, navigationTimeout: 20000, baseURL: "http://127.0.0.1:3100", browserName: "chromium", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 } } },
  ],
  webServer: { command: "node e2e/serve.mjs", url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 240000, stdout: "pipe", stderr: "pipe" },
});
