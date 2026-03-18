// lib/server-fetch.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/constants';

type FetchOptions = RequestInit & {
  /** Se true, inclui Authorization Bearer na requisição (default: true) */
  withCredentials?: boolean;
  /** Se true, redireciona para /auth/login em 401 (default: true). Use false em login/register para tratar credenciais inválidas. */
  redirectOn401?: boolean;
};

/**
 * Fetch que automaticamente inclui Authorization Bearer para chamadas server-side.
 * Lê o token do cookie de auth (AUTH_COOKIE_NAME) e envia como Bearer.
 * A API NestJS usa Bearer auth, não cookies — não repassamos o header Cookie.
 *
 * Em 401 (Unauthorized), redireciona para /auth/login automaticamente.
 *
 * Use em Server Components e Server Actions. Nunca leia o cookie de auth nem
 * construa o header Authorization manualmente — isso é centralizado aqui.
 */
export async function serverFetch(
  url: string | URL,
  options: FetchOptions = {},
): Promise<Response> {
  const {
    withCredentials = true,
    redirectOn401 = true,
    headers = {},
    ...rest
  } = options;
  const headersInit: HeadersInit = { ...headers };

  if (withCredentials) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      (headersInit as Record<string, string>)['Authorization'] =
        `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers: headersInit,
  });

  if (res.status === 401 && redirectOn401) redirect('/auth/login');
  return res;
}
