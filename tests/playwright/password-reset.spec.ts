import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";

const TOKEN = "a".repeat(64);

/**
 * Fill both new password fields on the reset page.
 * @param page Playwright page.
 * @param password New password.
 * @param confirm Confirmation value.
 * @returns Resolves once both fields are filled.
 */
async function fillPasswords(page: Page, password: string, confirm = password): Promise<void> {
  const inputs = page.locator('input[type="password"]');
  await inputs.nth(0).fill(password);
  await inputs.nth(1).fill(confirm);
}

test.describe("Forgot password form", () => {
  test("is reachable from the login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: t.auth.login.forgotPassword }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole("heading", { name: t.auth.forgotPassword.title })).toBeVisible();
  });

  test("shows the same neutral confirmation for any address", async ({ page }) => {
    const requested: string[] = [];
    await page.route("**/api/v1/users/password-reset/request", async (route) => {
      requested.push(route.request().postDataJSON().email);
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    for (const email of ["known@example.com", "unknown@example.com"]) {
      await page.goto("/forgot-password");
      await page.getByPlaceholder(unescape(t.auth.forgotPassword.emailPlaceholder)).fill(email);
      await page.getByRole("button", { name: t.auth.forgotPassword.submit }).click();

      await expect(page.getByText(t.auth.forgotPassword.sentMessage)).toBeVisible();
      await expect(page.getByText(email)).toHaveCount(0);
    }
    expect(requested).toEqual(["known@example.com", "unknown@example.com"]);
  });

  test("shows when to retry after a rate limit", async ({ page }) => {
    await page.route("**/api/v1/users/password-reset/request", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "900" },
        body: JSON.stringify({ code: "password_reset_rate_limited", message: "Too many requests" }),
      });
    });

    await page.goto("/forgot-password");
    await page
      .getByPlaceholder(unescape(t.auth.forgotPassword.emailPlaceholder))
      .fill("john@example.com");
    await page.getByRole("button", { name: t.auth.forgotPassword.submit }).click();

    await expect(page.getByText("Too many requests. Try again in 15 minutes.")).toBeVisible();
    await expect(page.getByText(t.auth.forgotPassword.sentMessage)).toHaveCount(0);
  });

  test("shows a connection error when the request never reaches the server", async ({ page }) => {
    await page.route("**/api/v1/users/password-reset/request", (route) =>
      route.abort("internetdisconnected"),
    );

    await page.goto("/forgot-password");
    await page
      .getByPlaceholder(unescape(t.auth.forgotPassword.emailPlaceholder))
      .fill("john@example.com");
    await page.getByRole("button", { name: t.auth.forgotPassword.submit }).click();

    await expect(page.getByText(t.auth.forgotPassword.error)).toBeVisible();
  });
});

test.describe("Reset password form", () => {
  test("opens from the email link without a session, changes the password and goes to login", async ({
    page,
  }) => {
    let body: unknown;
    await page.route("**/api/v1/users/password-reset/confirm", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto(`/reset-password?token=${TOKEN}`);
    await expect(page.getByText(t.auth.resetPassword.keysNotice)).toBeVisible();
    await fillPasswords(page, "NewPassw0rd");
    await page.getByRole("button", { name: t.auth.resetPassword.submit }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(t.auth.resetPassword.successMessage)).toBeVisible();
    expect(body).toEqual({ token: TOKEN, newPassword: "NewPassw0rd" });
    expect(await page.evaluate(() => localStorage.getItem("hasSession"))).toBeNull();
  });

  test("does not submit when the passwords do not match", async ({ page }) => {
    let called = false;
    await page.route("**/api/v1/users/password-reset/confirm", async (route) => {
      called = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto(`/reset-password?token=${TOKEN}`);
    await fillPasswords(page, "NewPassw0rd", "OtherPassw0rd");
    await page.getByRole("button", { name: t.auth.resetPassword.submit }).click();

    await expect(page.getByText(t.validation.confirmPassword.mismatch)).toBeVisible();
    expect(called).toBe(false);
  });

  test("treats an expired or reused link as invalid instead of a success", async ({ page }) => {
    await page.route("**/api/v1/users/password-reset/confirm", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ code: "password_reset_invalid", message: "Invalid token" }),
      });
    });

    await page.goto(`/reset-password?token=${TOKEN}`);
    await fillPasswords(page, "NewPassw0rd");
    await page.getByRole("button", { name: t.auth.resetPassword.submit }).click();

    await expect(page.getByText(t.auth.resetPassword.invalidLink)).toBeVisible();
    await expect(page).toHaveURL(/\/reset-password/);
    await page.getByRole("link", { name: t.auth.resetPassword.requestNewLink }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("shows the invalid link state when the token is missing", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByText(t.auth.resetPassword.invalidLink)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });
});
