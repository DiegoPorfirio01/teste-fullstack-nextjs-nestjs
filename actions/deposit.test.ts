import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "http://localhost:3001" },
}));

const mockServerFetch = vi.fn();

vi.mock("@/lib/server-fetch", () => ({
  serverFetch: (...args: unknown[]) => mockServerFetch(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    const err = new Error("NEXT_REDIRECT");
    (err as any).NEXT_REDIRECT = true;
    throw err;
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/action-utils", () => ({
  rethrowNavigationError: (err: unknown) => {
    if (err && typeof err === "object" && (err as any).NEXT_REDIRECT) throw err;
    throw err;
  },
  toUserFriendlyMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback,
}));

const { depositAction } = await import("./transactions");

describe("depositAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fieldErrors when amount is missing or invalid", async () => {
    const formData = new FormData();
    formData.set("amount", "");
    const result = await depositAction(undefined, formData);
    expect(result).toEqual({
      fieldErrors: { amount: ["Informe um valor válido"] },
    });
    expect(mockServerFetch).not.toHaveBeenCalled();
  });

  it("returns fieldErrors when amount is zero", async () => {
    const formData = new FormData();
    formData.set("amount", "0");
    const result = await depositAction(undefined, formData);
    expect(result).toEqual({
      fieldErrors: { amount: ["Informe um valor válido"] },
    });
    expect(mockServerFetch).not.toHaveBeenCalled();
  });

  it("returns success when API returns ok", async () => {
    mockServerFetch.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    const formData = new FormData();
    formData.set("amount", "100.50");
    const result = await depositAction(undefined, formData);
    expect(result).toEqual({ success: true });
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining("/transactions/deposit"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ amount: 100.5 }),
      })
    );
  });

  it("returns error when API returns not ok", async () => {
    mockServerFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Saldo insuficiente" }),
        { status: 400 }
      )
    );
    const formData = new FormData();
    formData.set("amount", "100");
    const result = await depositAction(undefined, formData);
    expect(result.error).toBe("Saldo insuficiente");
    expect(mockServerFetch).toHaveBeenCalled();
  });

  it("returns fallback error when API returns without message", async () => {
    mockServerFetch.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 })
    );
    const formData = new FormData();
    formData.set("amount", "50");
    const result = await depositAction(undefined, formData);
    expect(result.error).toBe("Falha ao depositar");
  });
});
