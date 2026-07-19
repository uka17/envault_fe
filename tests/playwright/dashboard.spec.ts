import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";

/**
 * Log the page into a mocked session and land on the dashboard with a fixed
 * set of stashes served from the mocked `/stashes` endpoint.
 * @param page Playwright page to authenticate.
 */
async function loginWithMockedStashes(page: Page) {
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
          subject: "Planned subject",
          body: "Planned stash",
          isSent: false,
          sendAt: new Date(Date.now() + 86400000).toISOString(),
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
}

test.describe("Dashboard", () => {
  test("shows summary counters and the stash list", async ({ page }) => {
    await loginWithMockedStashes(page);

    await expect(page.getByText("sent@example.com")).toBeVisible();
    await expect(page.getByText("planned@example.com")).toBeVisible();
  });

  test("shows the subject when present and omits it when absent", async ({ page }) => {
    await loginWithMockedStashes(page);

    await expect(page.getByText("Planned subject")).toBeVisible();
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

  test("asks for confirmation before deleting a stash and removes it once confirmed", async ({
    page,
  }) => {
    await loginWithMockedStashes(page);
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

    await expect(page.getByText(t.stash.dashboard.modals.deleteText)).toBeVisible();
    expect(deleteRequested).toBe(false);

    await page
      .getByRole("dialog")
      .getByRole("button", { name: t.stash.dashboard.modals.deleteConfirm, exact: true })
      .click();

    await expect(page.getByText("planned@example.com")).toHaveCount(0);
    expect(deleteRequested).toBe(true);
  });

  test("keeps the stash when the delete confirmation is cancelled", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page
      .locator(".stash-row", { hasText: "planned@example.com" })
      .getByRole("button", { name: t.stash.dashboard.delete })
      .click();
    await expect(page.getByText(t.stash.dashboard.modals.deleteText)).toBeVisible();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: t.common.actions.cancel })
      .click();

    await expect(page.getByText(t.stash.dashboard.modals.deleteText)).toHaveCount(0);
    await expect(page.getByText("planned@example.com")).toBeVisible();
  });
});
