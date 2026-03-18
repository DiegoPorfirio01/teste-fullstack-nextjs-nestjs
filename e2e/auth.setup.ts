import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth", "user.json");

/**
 * Setup: faz login e persiste o estado de autenticação para os demais testes.
 * Usuário do seed: admin@example.com / password123
 */
setup("authenticate", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel(/e-mail/i).fill("admin@example.com");
  await page.getByLabel("Senha").fill("password123");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await page.context().storageState({ path: authFile });
});
