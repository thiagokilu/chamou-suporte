import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("test@email.com");
  await page.getByRole("textbox", { name: /senha/i }).fill("123456");
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe("gestão de usuários (admin)", () => {
  test("edita o papel de um usuário de USER para AGENT", async ({ page }) => {
    await page.goto("/usuarios");
    await expect(
      page.getByRole("heading", { name: "Gerenciamento de usuários" }),
    ).toBeVisible();

    const row = page.getByRole("row", { name: /Usuario Comum/ });
    await expect(row.getByText("user@email.com")).toBeVisible();

    await row.getByRole("button", { name: /editar/i }).click();

    const dialog = page.getByRole("dialog", { name: /editar usuário/i });
    await dialog.locator("#edit-user-role").selectOption("AGENT");
    await dialog.getByRole("button", { name: /salvar alterações/i }).click();

    await expect(dialog).toBeHidden();
    await expect(row.getByText("Agente", { exact: true })).toBeVisible();
  });
});
