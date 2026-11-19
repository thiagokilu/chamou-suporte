import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@email.com');
  await page.getByRole('textbox', { name: /senha/i }).fill('123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByText('Chamado de teste E2E')).toBeVisible();
});

test.describe('filtros e busca na tabela de tickets', () => {
  test('filtra por texto, por status e limpa os filtros', async ({ page }) => {
    const search = page.getByPlaceholder(/buscar por id, assunto ou solicitante/i);

    await search.fill('financeiro');
    await expect(page.getByText('Solicitação do departamento financeiro')).toBeVisible();
    await expect(page.getByText('Chamado de teste E2E')).toBeHidden();
    await expect(page.getByText('Problema na impressora do setor')).toBeHidden();

    await search.fill('');
    await page.getByLabel(/filtrar por status/i).selectOption('Aberto');
    await expect(page.getByText('Chamado de teste E2E')).toBeVisible();
    await expect(page.getByText('Solicitação do departamento financeiro')).toBeHidden();
    await expect(page.getByText('Problema na impressora do setor')).toBeHidden();

    await page.getByRole('button', { name: /^limpar$/i }).click();
    await expect(page.getByText('Chamado de teste E2E')).toBeVisible();
    await expect(page.getByText('Solicitação do departamento financeiro')).toBeVisible();
    await expect(page.getByText('Problema na impressora do setor')).toBeVisible();
  });
});
