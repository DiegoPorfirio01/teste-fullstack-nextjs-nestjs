import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCookiesGet = vi.fn().mockReturnValue({ value: "mock-token-123" });
const mockRedirect = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockCookiesGet,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error("REDIRECT");
  },
}));

const { serverFetch } = await import("./server-fetch");

const mockFetch = vi.fn();

describe("serverFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesGet.mockReturnValue({ value: "mock-token-123" });
    vi.stubGlobal("fetch", mockFetch);
  });

  it("includes Authorization Bearer header when withCredentials is true (default)", async () => {
    mockFetch.mockResolvedValue(new Response("ok", { status: 200 }));
    await serverFetch("https://api.test/v1/endpoint");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test/v1/endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token-123",
        }),
      })
    );
  });

  it("forwards custom headers", async () => {
    mockFetch.mockResolvedValue(new Response("ok", { status: 200 }));
    await serverFetch("https://api.test/v1/endpoint", {
      headers: { "Content-Type": "application/json" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test/v1/endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token-123",
        }),
      })
    );
  });

  it("does not include Authorization when withCredentials is false", async () => {
    mockFetch.mockResolvedValue(new Response("ok", { status: 200 }));
    await serverFetch("https://api.test/v1/endpoint", { withCredentials: false });

    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("passes through method and body", async () => {
    mockFetch.mockResolvedValue(new Response("ok", { status: 200 }));
    await serverFetch("https://api.test/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "x" }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test/v1/login",
      expect.objectContaining({
        method: "POST",
        body: '{"email":"a@b.com","password":"x"}',
      })
    );
  });

  it("redirects to /auth/login on 401", async () => {
    mockRedirect.mockClear();
    mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    await expect(serverFetch("https://api.test/v1/me")).rejects.toThrow(
      "REDIRECT"
    );
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });
});
