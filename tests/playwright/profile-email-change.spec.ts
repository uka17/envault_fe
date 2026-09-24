import { expect, test, type Page } from "playwright/test";
import { t, unescape } from "./i18n";

interface MockUser {
  id: number;
  email: string;
  pendingEmail: string | null;
  name: string;
  emailVerifiedAt: string | null;
  createdOn: string;
  modifiedOn: string;
}

const baseUser: MockUser = {
  id: 1,
  email: "john@example.com",
  pendingEmail: null,
  name: "John Doe",
  emailVerifiedAt: new Date().toISOString(),
  createdOn: new Date().toISOString(),
  modifiedOn: new Date().toISOString(),
};

/**
 * Logs into the app with a mocked backend and lands on the profile page.
 * @param page Playwright page.
 * @param user Initial `whoami` response; mutated in place by later routes.
 * @returns Nothing; navigates the page to /profile.
 */
async function loginToProfile(page: Page, user: MockUser): Promise<void> {
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
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
  });
  await page.route("**/api/v1/users/sessions", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/login");
  await page.getByPlaceholder(unescape(t.auth.login.emailPlaceholder)).fill(user.email);
  await page.locator('input[type="password"]').fill("Passw0rd1");
  await page.getByRole("button", { name: t.auth.login.submit }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/profile$/);
}

test.describe("Profile email change", () => {
  test("requests an email change and shows the pending confirmation hint", async ({ page }) => {
    const user = { ...baseUser };
    await loginToProfile(page, user);

    let requestedEmail: string | undefined;
    await page.route("**/api/v1/users/email-change/request", async (route) => {
      requestedEmail = JSON.parse(route.request().postData() ?? "{}").email;
      user.pendingEmail = requestedEmail ?? null;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
    });

    await page.getByRole("button", { name: t.profile.edit }).nth(1).click();
    await page.locator(".n-modal input").first().fill("new@example.com");
    await page.locator(".n-modal .modal-footer button").last().click();

    expect(requestedEmail).toBe("new@example.com");
    await expect(page.getByText("new@example.com", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: t.profile.account.resendEmailChange })).toBeVisible();
  });

  test("resends the pending confirmation email", async ({ page }) => {
    const user = { ...baseUser, pendingEmail: "new@example.com" };
    await loginToProfile(page, user);

    let resendCalled = false;
    await page.route("**/api/v1/users/email-change/resend", async (route) => {
      resendCalled = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.getByRole("button", { name: t.profile.account.resendEmailChange }).click();

    await expect(page.getByText(t.profile.messages.resendEmailChangeSuccess)).toBeVisible();
    expect(resendCalled).toBe(true);
  });
});

test.describe("Confirm email change page", () => {
  test("confirms the token from the link and prompts to sign in again", async ({ page }) => {
    let confirmedToken: string | undefined;
    await page.route("**/api/v1/users/email-change/confirm", async (route) => {
      confirmedToken = JSON.parse(route.request().postData() ?? "{}").token;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/confirm-email-change?token=abc123def456");

    expect(confirmedToken).toBe("abc123def456");
    await expect(page.getByText(t.auth.confirmEmailChange.successMessage)).toBeVisible();
  });

  test("shows an error for an invalid or expired token", async ({ page }) => {
    const serverMessage = "This confirmation link is invalid or has expired";
    await page.route("**/api/v1/users/email-change/confirm", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ code: "email_change_token_invalid", message: serverMessage }),
      });
    });

    await page.goto("/confirm-email-change?token=badtoken");

    await expect(page.getByText(serverMessage)).toBeVisible();
  });

  test("shows an error when the link has no token", async ({ page }) => {
    await page.goto("/confirm-email-change");

    await expect(page.getByText(t.auth.confirmEmailChange.invalidLink)).toBeVisible();
  });
});
