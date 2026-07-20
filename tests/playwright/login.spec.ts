import { expect, test } from "playwright/test";
import { t, unescape } from "./i18n";

test.describe("Login form", () => {
  test("shows an error message on invalid credentials", async ({ page }) => {
    const serverMessage = "Invalid email or password";
    await page.route("**/api/v1/users/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          message: serverMessage,
        }),
      });
    });

    await page.goto("/login");

    await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').fill("WrongPass1");
    await page.getByRole("button", { name: t.auth.login.submit }).click();

    await expect(page.getByText(serverMessage)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs in successfully and redirects to the dashboard", async ({ page }) => {
    await page.route("**/api/v1/users/login", async (route) => {
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
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.goto("/login");

    await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill("john@example.com");
    await page.locator('input[type="password"]').fill("Passw0rd1");
    await page.getByRole("button", { name: t.auth.login.submit }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("navigates to register via the footer link", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: t.auth.login.createLink }).click();

    await expect(page).toHaveURL(/\/register$/);
  });
});
