import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";

/**
 * Format an ISO date string the same way `DashboardView`'s `formatDate` helper
 * does, so tests can assert on the exact text rendered for a stash's schedule.
 * @param isoDate ISO 8601 date string.
 * @returns Formatted date string, e.g. "June 15, 2025, 12:00".
 */
function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

/**
 * Log the page into a mocked session and land on the dashboard with a fixed
 * set of stashes served from the mocked `/stashes` endpoint.
 * @param page Playwright page to authenticate.
 * @returns The ISO send date used for the mocked planned stash, so tests can
 * assert on its interpolated, human-readable form.
 */
async function loginWithMockedStashes(page: Page): Promise<{ plannedSendAt: string }> {
  const plannedSendAt = new Date(Date.now() + 86400000).toISOString();
  await page.route("**/api/v1/users/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "fake-access-token" }),
    });
  });
  await page.route("**/api/v1/token/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "fake-access-token" }),
    });
  });
  await page.route("**/api/v1/users/whoami", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        createdOn: new Date().toISOString(),
        modifiedOn: new Date().toISOString(),
      }),
    });
  });
  await page.route("**/api/v1/stashes", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          to: "sent@example.com",
          body: "Sent stash",
          isSent: true,
          sendAt: new Date(Date.now() - 86400000).toISOString(),
          createdOn: new Date().toISOString(),
          modifiedOn: new Date().toISOString(),
        },
        {
          id: 2,
          to: "planned@example.com",
          body: "Planned stash",
          isSent: false,
          sendAt: plannedSendAt,
          createdOn: new Date().toISOString(),
          modifiedOn: new Date().toISOString(),
        },
      ]),
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill("john@example.com");
  await page.locator('input[type="password"]').fill("Passw0rd1");
  await page.getByRole("button", { name: t.auth.login.submit }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  return { plannedSendAt };
}

test.describe("Dashboard", () => {
  test("shows summary counters and the stash list", async ({ page }) => {
    await loginWithMockedStashes(page);

    await expect(page.getByText("sent@example.com")).toBeVisible();
    await expect(page.getByText("planned@example.com")).toBeVisible();
  });

  test("filters the list to planned stashes only", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page.getByRole("button", { name: t.stash.dashboard.filterPlanned, exact: true }).click();

    await expect(page.getByText("planned@example.com")).toBeVisible();
    await expect(page.getByText("sent@example.com")).toHaveCount(0);
  });

  test("navigates to the create stash page", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page.getByRole("button", { name: t.stash.dashboard.newStash }).click();

    await expect(page).toHaveURL(/\/stash\/new$/);
  });

  test("shows the stash list on the home page instead of the landing page", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByText("sent@example.com")).toBeVisible();
    await expect(page.getByText("planned@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: t.common.nav.start })).toHaveCount(0);
  });

  test("asks for confirmation naming the recipient and date before deleting a stash and removes it once confirmed", async ({
    page,
  }) => {
    const { plannedSendAt } = await loginWithMockedStashes(page);
    let deleteRequested = false;
    await page.route("**/api/v1/stashes/2", async (route) => {
      if (route.request().method() === "DELETE") {
        deleteRequested = true;
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        return;
      }
      await route.continue();
    });

    await page
      .locator(".stash-row", { hasText: "planned@example.com" })
      .getByRole("button", { name: t.stash.dashboard.delete })
      .click();

    const expectedDeleteText = t.stash.dashboard.modals.deleteText
      .replace("{recipient}", "planned@example.com")
      .replace("{date}", formatDate(plannedSendAt));
    await expect(page.getByRole("dialog").getByText(expectedDeleteText)).toBeVisible();
    expect(deleteRequested).toBe(false);

    await page
      .getByRole("dialog")
      .getByRole("button", { name: t.stash.dashboard.modals.deleteConfirm, exact: true })
      .click();

    await expect(page.getByText("planned@example.com")).toHaveCount(0);
    expect(deleteRequested).toBe(true);
  });

  test("keeps the stash when the delete confirmation is cancelled", async ({ page }) => {
    const { plannedSendAt } = await loginWithMockedStashes(page);

    await page
      .locator(".stash-row", { hasText: "planned@example.com" })
      .getByRole("button", { name: t.stash.dashboard.delete })
      .click();
    const expectedDeleteText = t.stash.dashboard.modals.deleteText
      .replace("{recipient}", "planned@example.com")
      .replace("{date}", formatDate(plannedSendAt));
    await expect(page.getByRole("dialog").getByText(expectedDeleteText)).toBeVisible();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: t.common.actions.cancel })
      .click();

    await expect(page.getByText(expectedDeleteText)).toHaveCount(0);
    await expect(page.getByText("planned@example.com")).toBeVisible();
  });
});
