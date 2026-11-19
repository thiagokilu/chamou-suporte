import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@email.com');
  await page.getByRole('textbox', { name: /senha/i }).fill('123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe('chat com IA / assistente', () => {
  test('envia uma mensagem e exibe a resposta da IA', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir chat' }).click();

    const dialog = page.getByRole('dialog', { name: 'Chat' });
    await expect(dialog).toBeVisible();

    await dialog.getByPlaceholder(/digite sua mensagem/i).fill('Como redefinir minha senha?');
    await dialog.getByRole('button', { name: /enviar/i }).click();

    await expect(dialog.getByText('Como redefinir minha senha?')).toBeVisible();
    await expect(dialog.getByText('Resposta simulada do chat E2E.')).toBeVisible();
  });
});
