import { test, expect } from "@playwright/test";

/**
 * Testes e2e dos fluxos de créditos: comprar, transferir e reverter.
 * Usam storageState do auth.setup (admin@example.com).
 * Dependem de user2@example.com no seed (destinatário da transferência).
 *
 * test.describe.serial garante ordem: comprar → transferir → reverter.
 */
test.describe.serial("Fluxos de créditos", () => {
  test("comprar créditos adiciona saldo na carteira", async ({ page }) => {
    await page.goto("/billing");

    await expect(page.getByRole("heading", { name: /comprar crédito/i })).toBeVisible();

    await page.getByRole("button", { name: /comprar/i }).first().click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible({ timeout: 5000 });
    await expect(sheet.getByText(/comprar créditos/i)).toBeVisible();

    await sheet.getByRole("button", { name: /confirmar compra/i }).click();

    await expect(page.getByText(/créditos comprados com sucesso/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("transferir créditos para outro usuário", async ({ page }) => {
    await page.goto("/transactions");

    await expect(page.getByRole("heading", { name: /transações/i })).toBeVisible({ timeout: 10_000 });
    const emailInput = page.getByRole("textbox", { name: "E-mail", exact: true });
    await expect(emailInput).toBeVisible();

    await emailInput.fill("user2@example.com");
    await page.getByLabel("Valor em reais").fill("5,00");
    await page.getByRole("button", { name: /transferir/i }).click();

    await expect(page.getByText(/transferência realizada com sucesso/i)).toBeVisible({ timeout: 10_000 });
  });

  test("reverter transferência recente", async ({ page }) => {
    await page.goto("/transactions");

    await expect(page.getByRole("heading", { name: /transações/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole("tab", { name: /enviadas/i }).click();

    const botaoReverter = page.getByRole("button", { name: /reverter/i }).first();
    await expect(botaoReverter).toBeVisible({ timeout: 5000 });
    await botaoReverter.click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByText(/reverter transferência/i)).toBeVisible({ timeout: 3000 });
    await expect(dialog.getByText(/valor para sua carteira/i)).toBeVisible();

    await dialog.getByRole("button", { name: /^confirmar$/i }).click();

    // Aguarda o diálogo fechar e o toast de sucesso
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/transferência revertida com sucesso/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
