import { expect, test } from "playwright/test";

test.describe("Home navigation", () => {
  test("opens home and shows auth buttons", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Начать" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  });

  test("opens register form from 'Начать'", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Начать" }).first().click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Создание аккаунта" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Создать аккаунт" })).toBeVisible();
  });

  test("opens login form from 'Войти'", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Войти" }).first().click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Вход в аккаунт" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  });
});
