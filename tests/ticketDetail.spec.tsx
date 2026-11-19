import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("test@email.com");
  await page.getByRole("textbox", { name: /senha/i }).fill("123456");
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe("detalhes e atualização do chamado", () => {
  test("abre o detalhe, edita o status para Resolvido e salva", async ({
    page,
  }) => {
    await page.getByText("Chamado dedicado ao teste de edição").click();
    await expect(page).toHaveURL(/\/chamado\/e2e-detail/);
    await expect(
      page.getByRole("heading", {
        name: "Chamado dedicado ao teste de edição",
      }),
    ).toBeVisible();

    const statusSelect = page.locator("aside select").first();
    await statusSelect.selectOption({ label: "Resolvido" });
    await expect(page.getByText("Resolvido").first()).toBeVisible();
  });
});
