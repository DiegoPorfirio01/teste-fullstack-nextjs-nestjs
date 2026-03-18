import { test, expect } from '@playwright/test';

/**
 * Testes e2e dos fluxos de créditos: comprar, transferir e reverter.
 * Usam storageState do auth.setup (admin@example.com).
 * Dependem de user2@example.com no seed (destinatário da transferência).
 *
 * test.describe.serial garante ordem: comprar → transferir → reverter.
 */
test.describe.serial('Fluxos de créditos', () => {
  test('comprar créditos adiciona saldo na carteira', async ({ page }) => {
    await page.goto('/billing');

    await expect(
      page.getByRole('heading', { name: /comprar crédito/i }),
    ).toBeVisible();

    // Contagem de linhas na tabela de compras (header + dados). Se vazio, não há tabela.
    const tabelaCompras = page.getByRole('table');
    const temTabela = await tabelaCompras.isVisible();
    const linhasAntes = temTabela
      ? await tabelaCompras.getByRole('row').count()
      : 0;
    const linhasEsperadas = temTabela ? linhasAntes + 1 : 2; // vazio → 1 header + 1 dado

    await page
      .getByRole('button', { name: /comprar/i })
      .first()
      .click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible({ timeout: 5000 });
    await expect(sheet.getByText(/comprar créditos/i)).toBeVisible();

    await sheet.getByRole('button', { name: /confirmar compra/i }).click();

    // Aguarda o sheet fechar
    await expect(sheet).not.toBeVisible({ timeout: 5_000 });

    // Valida sucesso: nova compra deve aparecer no histórico (+1 linha)
    await expect(tabelaCompras.getByRole('row')).toHaveCount(linhasEsperadas, {
      timeout: 10_000,
    });
  });

  test('transferir créditos para outro usuário', async ({ page }) => {
    await page.goto('/transactions');

    await expect(
      page.getByRole('heading', { name: /transações/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Contagem antes: a nova transferência entrará em Enviadas
    const tabEnviadas = page.getByRole('tab', { name: /enviadas/i });
    const countAntes = await tabEnviadas.textContent().then((t) => {
      const match = t?.match(/\((\d+)\)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const emailInput = page.getByRole('textbox', {
      name: 'E-mail',
      exact: true,
    });
    await expect(emailInput).toBeVisible();

    await emailInput.fill('user2@example.com');
    await page.getByLabel('Valor em reais').fill('5,00');
    await page.getByRole('button', { name: /transferir/i }).click();

    // Valida sucesso: a transferência deve aparecer na aba Enviadas (contagem +1)
    await expect(tabEnviadas).toHaveText(
      new RegExp(`Enviadas \\(${countAntes + 1}\\)`),
      {
        timeout: 10_000,
      },
    );
  });

  test('reverter transferência recente', async ({ page }) => {
    await page.goto('/transactions');

    await expect(
      page.getByRole('heading', { name: /transações/i }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('tab', { name: /enviadas/i }).click();

    // Captura contagem antes: a transação revertida sairá de Enviadas e entrará em Revertidas
    const tabRevertidas = page.getByRole('tab', { name: /revertidas/i });
    const countAntes = await tabRevertidas.textContent().then((t) => {
      const match = t?.match(/\((\d+)\)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const botaoReverter = page
      .getByRole('button', { name: /reverter/i })
      .first();
    await expect(botaoReverter).toBeVisible({ timeout: 5000 });
    await botaoReverter.click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText(/reverter transferência/i)).toBeVisible({
      timeout: 3000,
    });
    await expect(dialog.getByText(/valor para sua carteira/i)).toBeVisible();

    await dialog.getByRole('button', { name: /^confirmar$/i }).click();

    // Aguarda o diálogo fechar
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Valida sucesso: a transação deve ter migrado para a aba Revertidas (contagem +1)
    await expect(tabRevertidas).toHaveText(
      new RegExp(`Revertidas \\(${countAntes + 1}\\)`),
      {
        timeout: 10_000,
      },
    );
  });
});
