// lib/server-fetch.ts
import { cookies } from "next/headers";
type FetchOptions = RequestInit & {
  /** Se true, inclui cookies na requisição (default: true) */
  withCredentials?: boolean;
};
/**
 * Fetch que automaticamente repassa os cookies do request para chamadas server-side.
 * Use em Server Components e Server Actions para requisições autenticadas.
 */
export async function serverFetch(
  url: string | URL,
  options: FetchOptions = {}
): Promise<Response> {
  const { withCredentials = true, headers = {}, ...rest } = options;
  const headersInit: HeadersInit = { ...headers };
  if (withCredentials) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) {
      (headersInit as Record<string, string>)["Cookie"] = cookieHeader;
    }
  }
  return fetch(url, {
    ...rest,
    headers: headersInit,
  });
}