# Análise: Server Actions, Server Components e Boas Práticas

Análise do código `teste-adv` contra as skills next-best-practices, next-cache-components e shadcn.

---

## ✅ Pontos Positivos

### Server Components & Data Patterns

1. **Páginas assíncronas (RSC)** — `transacoes/page.tsx`, `dashboard/page.tsx`, `billing/page.tsx` buscam dados diretamente com `Promise.all`:

   ```tsx
   const [credits, transactions] = await Promise.all([
     getWalletCredits(),
     getTransactions(),
   ]);
   ```

2. **Server Actions para mutações** — `transferAction`, `reverseAction`, `buyCreditsAction` usam `'use server'` corretamente.

3. **useActionState para formulários** — Formulários usam `useActionState` com `formAction`, alinhado às recomendações do React 19.

4. **Progressive enhancement** — Formulários usam `<form action={formAction}>`, funcionam sem JS.

5. **Props serializáveis** — Transações, datas (ISO string) e demais props passadas a Client Components são serializáveis.

### RSC Boundaries

- Nenhum Client Component é `async`; a busca de dados fica em Server Components.
- Server Actions são passadas corretamente para Client Components.

---

## ⚠️ Melhorias Identificadas

### 1. `useEffect` para toast em sucesso

**Status:** Padrão correto.

`useEffect` para exibir toast quando `state?.success` vira `true` é a abordagem recomendada. React/Next.js não oferecem callback `onSuccess` em `useActionState`, então esse efeito colateral é apropriado.

```tsx
useEffect(() => {
  if (state?.success) toast.success('Transferência realizada com sucesso!');
}, [state?.success]);
```

### 2. Componentes com `"use client"` desnecessário

Componentes que não usam hooks, event handlers ou APIs do navegador podem ser Server Components.

| Componente       | Hooks usados | `"use client"` necessário? |
| ---------------- | ------------ | -------------------------- |
| `SectionCards`   | Nenhum       | Não — pode ser Server      |
| `DashboardCards` | Nenhum       | Não — pode ser Server      |

### 3. Dependência `onSuccess` em `useEffect` (FormBilling)

Em `form-billing.tsx`:

```tsx
useEffect(() => {
  if (state?.success) {
    toast.success('Créditos comprados com sucesso!');
    onSuccess?.();
  }
}, [state?.success, onSuccess]); // onSuccess muda a cada render do pai
```

`onSuccess` é criado inline em `BuyCreditsSheet` (`() => setOpen(false)`), então muda a cada render e pode reexecutar o efeito desnecessariamente. O ideal é usar um ref para o callback e depender apenas de `state?.success`:

```tsx
const onSuccessRef = useRef(onSuccess);
onSuccessRef.current = onSuccess;
useEffect(() => {
  if (state?.success) {
    toast.success('Créditos comprados com sucesso!');
    onSuccessRef.current?.();
  }
}, [state?.success]);
```

### 4. Diretiva e cache

- `refresh()` em Server Actions está correta conforme uso definido.
- Documentação sugere `revalidatePath` para invalidação por rota; `refresh()` é válida para invalidar todo o cache do router.

### 5. Uso de `"use client"` onde é necessário

Componentes que usam:

- `useState` / `useMemo` (ex.: busca, tabs)
- `usePathname` / `useLinkStatus` (ex.: navegação)
- `useActionState` (ex.: formulários)
- `onClick` / `onChange` (ex.: inputs)
- APIs do browser (ex.: tema, Sentry)

estão corretamente marcados com `"use client"`.

---

## Checklist de Boas Práticas

| Item                                       | Status                 |
| ------------------------------------------ | ---------------------- |
| Server Components para fetches             | OK                     |
| Server Actions para mutações               | OK                     |
| `Promise.all` para fetches paralelos       | OK                     |
| `useActionState` em formulários            | OK                     |
| Sem async Client Components                | OK                     |
| Props serializáveis para Client            | OK                     |
| `useEffect` para toast em success          | OK                     |
| Evitar `"use client"` quando desnecessário | Ajustar                |
| Callbacks em `useEffect` via ref           | Ajustar em FormBilling |

---

## Referências

- [Data Patterns](.agents/skills/next-best-practices/data-patterns.md)
- [RSC Boundaries](.agents/skills/next-best-practices/rsc-boundaries.md)
- [Directives](.agents/skills/next-best-practices/directives.md)
