import { expect, test } from "playwright/test";
import { t, unescape } from "./i18n";

test.describe("Verify email form", () => {
  test("verifies the code and redirects to login", async ({ page }) => {
    await page.route("**/api/v1/users/verify-email", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.goto("/verify-email?email=john%40example.com");

    await page.getByPlaceholder(t.auth.verifyEmail.codePlaceholder).fill("abc12345");
    await page.getByRole("button", { name: t.auth.verifyEmail.submit }).click();

    await expect(page).toHaveURL(/\/login\?email=john@example\.com$/);
  });

  test("shows an error message for an invalid code", async ({ page }) => {
    const serverMessage = "This verification code is invalid or has expired";
    await page.route("**/api/v1/users/verify-email", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ code: "verification_code_invalid", message: serverMessage }),
      });
    });

    await page.goto("/verify-email?email=john%40example.com");

    await page.getByPlaceholder(t.auth.verifyEmail.codePlaceholder).fill("wrongcode");
    await page.getByRole("button", { name: t.auth.verifyEmail.submit }).click();

    await expect(page.getByText(serverMessage)).toBeVisible();
    await expect(page).toHaveURL(/\/verify-email/);
  });

  test("auto-submits the code from the email link", async ({ page }) => {
    await page.route("**/api/v1/users/verify-email", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.goto("/verify-email?email=john%40example.com&code=fromlink123");

    await expect(page).toHaveURL(/\/login\?email=john@example\.com$/);
  });

  test("resends the verification code", async ({ page }) => {
    let resendCalled = false;
    await page.route("**/api/v1/users/verify-email/resend", async (route) => {
      resendCalled = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.goto("/verify-email?email=john%40example.com");
    await page.getByRole("button", { name: t.auth.verifyEmail.resendButton }).click();

    await expect(page.getByText(t.auth.verifyEmail.resendSuccess)).toBeVisible();
    expect(resendCalled).toBe(true);
  });

  test("redirects here from login when the account is not verified", async ({ page }) => {
    await page.route("**/api/v1/users/login", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ code: "email_not_verified", message: "Please verify your email" }),
      });
    });

    await page.goto("/login");
    await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').fill("Passw0rd1");
    await page.getByRole("button", { name: t.auth.login.submit }).click();

    await expect(page).toHaveURL(/\/verify-email\?email=john@example\.com$/);
  });
});
