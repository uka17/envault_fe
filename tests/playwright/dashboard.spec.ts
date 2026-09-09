import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

async function loginWithMockedStashes(page: Page): Promise<{ plannedScheduledAt: string }> {
  const plannedScheduledAt = new Date(Date.now() + 86400000).toISOString();
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
          scheduledAt: new Date(Date.now() - 86400000).toISOString(),
          createdOn: new Date().toISOString(),
          modifiedOn: new Date().toISOString(),
        },
        {
          id: 2,
          to: "planned@example.com",
          body: "Planned stash",
          isSent: false,
          scheduledAt: plannedScheduledAt,
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

  return { plannedScheduledAt };
}

test.describe("Dashboard", () => {
  test("shows summary counters and defaults to the planned stash list", async ({ page }) => {
    await loginWithMockedStashes(page);

    await expect(page.getByText("planned@example.com")).toBeVisible();
    await expect(page.getByText("sent@example.com")).toHaveCount(0);
  });

  test("filters the list to sent stashes only", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page.getByRole("button", { name: t.stash.dashboard.filterSent, exact: true }).click();

    await expect(page.getByText("sent@example.com")).toBeVisible();
    await expect(page.getByText("planned@example.com")).toHaveCount(0);
  });

  test("filters the list to show all stashes", async ({ page }) => {
    await loginWithMockedStashes(page);

    await page.getByRole("button", { name: t.stash.dashboard.filterAll, exact: true }).click();

    await expect(page.getByText("planned@example.com")).toBeVisible();
    await expect(page.getByText("sent@example.com")).toBeVisible();
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
    await expect(page.getByText("planned@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: t.common.nav.start })).toHaveCount(0);
  });

  test("asks for confirmation naming the recipient and date before deleting a stash and removes it once confirmed", async ({
    page,
  }) => {
    const { plannedScheduledAt } = await loginWithMockedStashes(page);
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
      .replace("{date}", formatDate(plannedScheduledAt));
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
    const { plannedScheduledAt } = await loginWithMockedStashes(page);

    await page
      .locator(".stash-row", { hasText: "planned@example.com" })
      .getByRole("button", { name: t.stash.dashboard.delete })
      .click();
    const expectedDeleteText = t.stash.dashboard.modals.deleteText
      .replace("{recipient}", "planned@example.com")
      .replace("{date}", formatDate(plannedScheduledAt));
    await expect(page.getByRole("dialog").getByText(expectedDeleteText)).toBeVisible();

    await page.getByRole("dialog").getByRole("button", { name: t.common.actions.cancel }).click();

    await expect(page.getByText(expectedDeleteText)).toHaveCount(0);
    await expect(page.getByText("planned@example.com")).toBeVisible();
  });
});

test("redirects an expired session on startup to login", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("hasSession", "1"));
  await page.route("**/api/v1/token/refresh", (route) =>
    route.fulfill({ status: 401, body: "{}" }),
  );
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("hasSession"))).toBeNull();
});

test("redirects to login when stashes and refresh return 401", async ({ page }) => {
  await loginWithMockedStashes(page);
  await expect(page.getByText("planned@example.com")).toBeVisible();
  await page.route("**/api/v1/stashes", (route) => route.fulfill({ status: 401, body: "{}" }));
  await page.route("**/api/v1/token/refresh", (route) =>
    route.fulfill({ status: 401, body: "{}" }),
  );
  await page.getByRole("button", { name: t.stash.dashboard.newStash }).click();
  await expect(page).toHaveURL(/\/stash\/new$/);
  await page.locator('a[href="/dashboard"]').first().click();
  await expect(page).toHaveURL(/\/login$/);
});

test("keeps the dashboard after successfully refreshing an expired access token", async ({
  page,
}) => {
  await loginWithMockedStashes(page);
  await expect(page.getByText("planned@example.com")).toBeVisible();
  let requests = 0;
  await page.route("**/api/v1/stashes", async (route) => {
    requests += 1;
    await route.fulfill({
      status: requests === 1 ? 401 : 200,
      body: requests === 1 ? "{}" : "[]",
      contentType: "application/json",
    });
  });
  await page.getByRole("button", { name: t.stash.dashboard.newStash }).click();
  await expect(page).toHaveURL(/\/stash\/new$/);
  await page.locator('a[href="/dashboard"]').first().click();
  await expect(page.getByText(t.stash.dashboard.emptyTitle)).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(requests).toBe(2);
});
