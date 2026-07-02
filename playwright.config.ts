import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command: "sh -c 'DB=file:$(pwd)/prisma/e2e.db; rm -f prisma/e2e.db; DATABASE_URL=$DB npx prisma db push && DATABASE_URL=$DB npm run dev -- --hostname 127.0.0.1 --port 3100'",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
