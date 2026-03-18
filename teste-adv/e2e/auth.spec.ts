import { test, expect } from '@playwright/test';

/**
 * Testes e2e de autenticação (login/registro) e redirecionamentos.
 * Estes testes NÃO usam storageState - rodam com contexto anônimo.
 */
test.describe('Auth', () => {
  test.describe('redirecionamentos sem token', () => {
    test('raiz / redireciona para /auth/login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('/dashboard redireciona para /auth/login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('/transactions redireciona para /auth/login', async ({ page }) => {
      await page.goto('/transactions');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('/billing redireciona para /auth/login', async ({ page }) => {
      await page.goto('/billing');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('/perfil redireciona para /auth/login', async ({ page }) => {
      await page.goto('/perfil');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('página de login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('exibe formulário de login', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /bem-vindo de volta/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/e-mail/i)).toBeVisible();
      await expect(page.getByLabel('Senha')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
      await expect(
        page.getByRole('link', { name: /cadastre-se/i }),
      ).toBeVisible();
    });

    test('login com credenciais inválidas mantém na página de login', async ({
      page,
    }) => {
      await page.getByLabel(/e-mail/i).fill('invalido@example.com');
      await page.getByLabel('Senha').fill('senhaerrada');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Aguarda resposta da API — deve permanecer em login (sem redirecionar para dashboard)
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });

    test('login com credenciais válidas redireciona para dashboard', async ({
      page,
    }) => {
      await page.getByLabel(/e-mail/i).fill('admin@example.com');
      await page.getByLabel('Senha').fill('password123');
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(
        page.getByRole('link', { name: 'Painel' }).first(),
      ).toBeVisible();
    });
  });

  test.describe('página de registro', () => {
    test('exibe formulário de cadastro', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(
        page.getByRole('heading', { name: 'Crie sua conta' }),
      ).toBeVisible();
      await expect(page.getByLabel(/nome/i)).toBeVisible();
      await expect(page.getByLabel(/e-mail/i)).toBeVisible();
      await expect(
        page.getByRole('link', { name: /entrar|já tem conta/i }),
      ).toBeVisible();
    });

    test('/auth/signup redireciona para /auth/register', async ({ page }) => {
      await page.goto('/auth/signup');
      await expect(page).toHaveURL(/\/auth\/register/);
    });
  });
});
