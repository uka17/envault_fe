import { expect, test } from "playwright/test";
import { t } from "./i18n";

test.describe("Home navigation", () => {
  test("opens home and shows auth buttons", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: t.common.nav.start })).toBeVisible();
    await expect(page.getByRole("button", { name: t.common.nav.login })).toBeVisible();
  });

  test(`opens register form from '${t.common.nav.start}'`, async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: t.common.nav.start }).first().click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: t.auth.register.title })).toBeVisible();
    await expect(page.getByRole("button", { name: t.auth.register.submit })).toBeVisible();
  });

  test(`opens login form from '${t.common.nav.login}'`, async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: t.common.nav.login }).first().click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: t.auth.login.title })).toBeVisible();
    await expect(page.getByRole("button", { name: t.auth.login.submit })).toBeVisible();
  });
});
