import { expect, test } from "@playwright/test";

test("flagship flow validates, creates, polls, and saves a workspace card", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("button", { name: "Validate brief" }).click();
  await expect(page.getByText("Quality score")).toBeVisible();
  await expect(page.getByText("Estimated credits")).toBeVisible();

  await page.getByRole("button", { name: "Submit generation job" }).click();
  await expect(page.getByText("queued")).toBeVisible();
  await expect(page.getByText("running")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("completed").first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("link", { name: "Open saved workspace track" }).click();

  await expect(page.getByRole("heading", { name: "Completed mock tracks" })).toBeVisible();
  await expect(page.getByText("Mock audio card:")).toBeVisible();
});

test("city sidecar maps context into an explainable brief", async ({ page }) => {
  await page.goto("/city-context");
  await expect(page.getByText("Mapped music brief")).toBeVisible();
  await expect(page.getByText("Why this brief?")).toBeVisible();
  await page.getByLabel(/Weather/).selectOption("rain");
  await expect(page.getByText(/rain weather adds/i)).toBeVisible();
});
