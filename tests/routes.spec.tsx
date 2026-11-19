import { test, expect } from '@playwright/test';

test.describe('proteção de rotas e logout', () => {
  test('redireciona para /login ao acessar /admin sem autenticação', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/login/);
  });

  test('faz logout pela sidebar e volta para /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@email.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('123456');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.getByRole('button', { name: 'Sair', exact: true }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  });
});
