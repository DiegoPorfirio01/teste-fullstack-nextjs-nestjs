"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/api-routes";
import { AUTH_COOKIE_NAME } from "@/constants";
import type { IAuthResponse, LoginState, RegisterState } from "@/lib/types";
import { loginSchema } from "@/schemas/auth-form";
import { registerSchema } from "@/schemas/auth-form";

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]?.toString() ?? "unknown";
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      fieldErrors,
      values: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
    };
  }

  try {
    const res = await fetch(routes.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Invalid email or password";
      return {
        error: Array.isArray(message) ? message[0] : message,
        values: {
          email: parsed.data.email,
          password: String(formData.get("password") ?? ""),
        },
      };
    }

    const auth = data as IAuthResponse;
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    redirect("/dashboard");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
      values: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
    };
  }
}

export async function registerAction(
  _prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]?.toString() ?? "unknown";
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      fieldErrors,
      values: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      },
    };
  }

  try {
    const res = await fetch(routes.auth.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Registration failed";
      return {
        error: Array.isArray(message) ? message[0] : message,
        values: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: String(formData.get("password") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
        },
      };
    }

    const auth = data as IAuthResponse;
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    redirect("/dashboard");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
      values: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      },
    };
  }
}
