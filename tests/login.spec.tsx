import { test, expect } from "@playwright/test";

test.describe("login", () => {
  test("login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("test@email.com");
    await page.getByRole("textbox", { name: /senha/i }).fill("123456");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/(admin|client|agent)/);
  });
});
