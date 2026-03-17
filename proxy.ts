import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/constants";

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/signup"];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return !!token;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = hasValidToken(request);

  // User has token but is on auth page -> redirect to dashboard
  if (hasToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // User has token on home -> redirect to dashboard
  if (hasToken && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasToken && pathname === "/") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // User has no token and is trying to access protected routes -> redirect to login
  const protectedPaths = ["/dashboard", "/perfil", "/billing"];
  if (
    !hasToken &&
    protectedPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    )
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/perfil",
    "/perfil/:path*",
    "/billing",
    "/billing/:path*",
    "/auth/login",
    "/auth/register",
    "/auth/signup",
  ],
};
