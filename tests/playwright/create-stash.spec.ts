import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";
import { decryptStashBody } from "../../src/utils/stashCrypto";

/**
 * Log the page into a mocked session and land on the create-stash page.
 * @param page Playwright page to authenticate.
 */
async function loginAndOpenCreateStash(page: Page) {
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

  await page.goto("/login");
  await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill("john@example.com");
  await page.locator('input[type="password"]').fill("Passw0rd1");
  await page.getByRole("button", { name: t.auth.login.submit }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/stash/new");
}

/** Opens the send-date picker, picks a day next month, and confirms. */
async function pickFutureSendDate(page: Page) {
  await page.getByPlaceholder(unescape(t.stash.create.sendAtPlaceholder)).click();
  await page.locator(".n-date-panel-month__next").click();
  await page
    .locator(".n-date-panel-dates .n-date-panel-date:not(.n-date-panel-date--excluded):not(.n-date-panel-date--disabled)")
    .first()
    .click();
  await page.getByRole("button", { name: "Confirm" }).click();
}

test.describe("Create stash", () => {
  test("encrypts the message client-side and shows the key to save after creation", async ({ page }) => {
    await loginAndOpenCreateStash(page);

    let capturedBody: string | undefined;
    await page.route("**/api/v1/stashes", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const payload = route.request().postDataJSON();
      capturedBody = payload.body;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          to: payload.to,
          body: payload.body,
          isSent: false,
          sendAt: payload.sendAt,
          createdOn: new Date().toISOString(),
          modifiedOn: new Date().toISOString(),
        }),
      });
    });

    await page.getByPlaceholder(unescape(t.stash.create.recipientPlaceholder)).fill("recipient@example.com");
    await page.getByPlaceholder(unescape(t.stash.create.messagePlaceholder)).fill("the secret message");
    await page.getByRole("button", { name: t.stash.create.keyGenerate }).click();
    await pickFutureSendDate(page);

    const keyValue = await page.getByPlaceholder(unescape(t.stash.create.keyPlaceholder)).inputValue();
    expect(keyValue.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: t.stash.create.submit }).click();

    await expect(page.getByText(t.stash.create.savedTitle)).toBeVisible();
    await expect(page.locator("input[readonly]")).toHaveValue(keyValue);

    expect(capturedBody).toBeDefined();
    expect(capturedBody).not.toBe("the secret message");
    const decrypted = await decryptStashBody(capturedBody!, keyValue);
    expect(decrypted).toBe("the secret message");

    await page.getByRole("button", { name: t.stash.create.savedContinue }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("does not submit when the key is shorter than the minimum length", async ({ page }) => {
    await loginAndOpenCreateStash(page);

    let submitted = false;
    await page.route("**/api/v1/stashes", async (route) => {
      if (route.request().method() === "POST") {
        submitted = true;
      }
      await route.continue();
    });

    await page.getByPlaceholder(unescape(t.stash.create.recipientPlaceholder)).fill("recipient@example.com");
    await page.getByPlaceholder(unescape(t.stash.create.messagePlaceholder)).fill("the secret message");
    await page.getByPlaceholder(unescape(t.stash.create.keyPlaceholder)).fill("short");
    await pickFutureSendDate(page);

    await page.getByRole("button", { name: t.stash.create.submit }).click();

    expect(submitted).toBe(false);
  });
});
