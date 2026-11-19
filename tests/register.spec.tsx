import { test, expect } from '@playwright/test';

test.describe('register', () => {
  test('redireciona para o login enquanto o cadastro não está disponível', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  });

  test('deve permitir entrar diretamente pelo Modo Demo', async ({ page }) => {
    await page.goto('/login');

    // Clica no botão de demo
    await page.getByRole('button', { name: /acessar como administrador \(demo\)/i }).click();

    // Deve cair direto no admin
    await expect(page).toHaveURL(/\/admin/);
  });
});
