import { expect, test } from "playwright/test";
import { t, unescape } from "./i18n";

test.describe("Register form", () => {
  test("shows validation errors when submitting an empty form", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: t.auth.register.submit }).click();

    await expect(page.getByText(t.validation.name.required)).toBeVisible();
    await expect(page.getByText(t.validation.email.required)).toBeVisible();
    await expect(page.getByText(t.validation.password.required)).toBeVisible();
    await expect(page.getByText(t.validation.confirmPassword.required)).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("shows a mismatch error when passwords differ", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder(t.auth.register.namePlaceholder).fill("John Doe");
    await page.getByPlaceholder(unescape(t.auth.register.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').first().fill("Passw0rd1");
    await page.locator('input[type="password"]').nth(1).fill("Passw0rd2");
    await page.getByRole("button", { name: t.auth.register.submit }).click();

    await expect(page.getByText(t.validation.confirmPassword.mismatch)).toBeVisible();
  });

  test("registers successfully and redirects to login", async ({ page }) => {
    await page.route("**/api/v1/users", async (route) => {
      await route.fulfill({
        status: 201,
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

    await page.goto("/register");

    await page.getByPlaceholder(t.auth.register.namePlaceholder).fill("John Doe");
    await page.getByPlaceholder(unescape(t.auth.register.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').first().fill("Passw0rd1");
    await page.locator('input[type="password"]').nth(1).fill("Passw0rd1");
    await page.getByRole("button", { name: t.auth.register.submit }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows a field-level error returned by the server", async ({ page }) => {
    const serverMessage = "This email is already registered";
    await page.route("**/api/v1/users", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          errors: [{ path: "email", msg: { translation: serverMessage } }],
        }),
      });
    });

    await page.goto("/register");

    await page.getByPlaceholder(t.auth.register.namePlaceholder).fill("John Doe");
    await page.getByPlaceholder(unescape(t.auth.register.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').first().fill("Passw0rd1");
    await page.locator('input[type="password"]').nth(1).fill("Passw0rd1");
    await page.getByRole("button", { name: t.auth.register.submit }).click();

    await expect(page.getByText(serverMessage)).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("navigates to login via the footer link", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("link", { name: t.auth.register.loginLink }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
