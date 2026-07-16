import { expect, test } from "playwright/test";
import { t } from "./i18n";

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
    await page.route(`**/api/public/stashes/${token}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ subject: "Hello", sendAt: new Date().toISOString() }),
      });
    });
    await page.route(`**/api/public/stashes/${token}/unlock`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid link or key" }),
      });
    });

    await page.goto(`/unlock/${token}`);
    await page.locator('input[type="password"]').fill("wrong-key");
    await page.getByRole("button", { name: t.stash.unlock.submit }).click();

    await expect(page.locator(".submit-error")).toBeVisible();
  });

  test("unlocks and shows the decrypted content for the correct key", async ({ page }) => {
    await page.route(`**/api/public/stashes/${token}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ subject: "Hello", sendAt: new Date().toISOString() }),
      });
    });
    await page.route(`**/api/public/stashes/${token}/unlock`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          subject: "Hello",
          sendAt: new Date().toISOString(),
          body: "the secret message",
        }),
      });
    });

    await page.goto(`/unlock/${token}`);
    await page.locator('input[type="password"]').fill("correct-key");
    await page.getByRole("button", { name: t.stash.unlock.submit }).click();

    await expect(page.getByText("the secret message")).toBeVisible();
  });
});
