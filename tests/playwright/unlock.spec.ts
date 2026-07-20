import { expect, test } from "playwright/test";
import { t } from "./i18n";
import { encryptStashBody } from "../../src/utils/stashCrypto";

const token = "abcdefgh23456789jkmn";

test.describe("Unlock stash", () => {
  test("shows an invalid link message for an unknown token", async ({ page }) => {
    await page.route(`**/api/public/stashes/${token}`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid link or key" }),
      });
    });

    await page.goto(`/unlock/${token}`);

    await expect(page.getByText(t.stash.unlock.invalidTitle)).toBeVisible();
  });

  test("shows a neutral error when the key is wrong", async ({ page }) => {
    const ciphertext = await encryptStashBody("the secret message", "correct-key");
    await page.route(`**/api/public/stashes/${token}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sendAt: new Date().toISOString(), body: ciphertext }),
      });
    });

    await page.goto(`/unlock/${token}`);
    await page.getByPlaceholder(t.stash.unlock.keyPlaceholder).fill("wrong-key");
    await page.getByRole("button", { name: t.stash.unlock.submit }).click();

    await expect(page.locator(".submit-error")).toBeVisible();
  });

  test("decrypts and shows the content locally for the correct key, with a single network call", async ({ page }) => {
    const ciphertext = await encryptStashBody("the secret message", "correct-key");
    let requestCount = 0;
    await page.route(`**/api/public/stashes/${token}`, async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sendAt: new Date().toISOString(), body: ciphertext }),
      });
    });

    await page.goto(`/unlock/${token}`);
    await page.getByPlaceholder(t.stash.unlock.keyPlaceholder).fill("correct-key");
    await page.getByRole("button", { name: t.stash.unlock.submit }).click();

    await expect(page.getByText("the secret message")).toBeVisible();
    expect(requestCount).toBe(1);
  });
});
