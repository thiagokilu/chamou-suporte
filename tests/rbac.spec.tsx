import { test, expect } from '@playwright/test';

test.describe('controle de acesso por papel (RBAC)', () => {
  test('cliente não vê o menu Usuários e é bloqueado ao acessar /usuarios', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('client@email.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('123456');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/client/);
    await expect(page.getByRole('heading', { name: 'Chamados' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Usuários' })).toHaveCount(0);

    await page.goto('/usuarios', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/client/);
  });
});
