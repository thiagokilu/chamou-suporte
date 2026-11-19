import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@email.com');
  await page.getByRole('textbox', { name: /senha/i }).fill('123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.getByRole('button', { name: /novo chamado/i }).first().click();
});

test.describe('modal de novo chamado', () => {
  test('abre o modal', async ({ page }) => {
    await expect(page.getByRole('dialog', { name: /novo chamado/i })).toBeVisible();
  });

  test('mostra erros de validação ao enviar vazio', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: /novo chamado/i });
    await dialog.getByRole('button', { name: /criar|salvar|enviar/i }).click();
    await expect(dialog.getByText(/Informe o/i).first()).toBeVisible();
  });

  test('cria um chamado com sucesso', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: /Novo chamado/i });
    const titulo = `Chamado teste ${Date.now()}`;

    await dialog.getByLabel(/assunto/i).fill(titulo);
    await dialog.getByLabel(/descrição/i).fill('Descrição do chamado de teste');
    await dialog.getByRole('button', { name: /criar|Salvar|enviar/i }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(titulo)).toBeVisible();
  });

  test('fecha o modal ao cancelar', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: /novo chamado/i });
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});