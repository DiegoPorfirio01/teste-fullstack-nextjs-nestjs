import { test, expect } from '@playwright/test';

/**
 * Testes e2e do dashboard (rotas protegidas).
 * Usam storageState do auth.setup - usuário já autenticado.
 */
test.describe('Dashboard', () => {
  test('exibe sidebar com navegação', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('link', { name: /painel/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /transações/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /comprar crédito/i }).first(),
    ).toBeVisible();
  });

  test('navegação para Transações', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /transações/i }).click();

    await expect(page).toHaveURL(/\/transactions/);
  });

  test('navegação para Comprar Crédito', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /comprar crédito/i }).click();

    await expect(page).toHaveURL(/\/billing/);
  });

  test('página de transações carrega', async ({ page }) => {
    await page.goto('/transactions');

    await expect(page).toHaveURL(/\/transactions/);
    await expect(
      page.getByRole('heading', { name: /transações/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('página de perfil carrega', async ({ page }) => {
    await page.goto('/perfil');

    await expect(page).toHaveURL(/\/perfil/);
  });

  test('usuário autenticado em /auth/login é redirecionado para dashboard', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
