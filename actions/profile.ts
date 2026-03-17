"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/api-routes";
import { serverFetch } from "@/lib/server-fetch";
import { AUTH_COOKIE_NAME } from "@/constants";
import type { UpdatePasswordState, UpdateProfileState } from "@/types";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "@/schemas/profile-form";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    redirect("/auth/login");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function updatePasswordAction(
  _prevState: UpdatePasswordState | undefined,
  formData: FormData
): Promise<UpdatePasswordState> {
  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
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
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        confirmNewPassword: String(formData.get("confirmNewPassword") ?? ""),
      },
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await serverFetch(routes.auth.updatePassword, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Falha ao alterar senha";
      return {
        error: Array.isArray(message) ? message[0] : message,
        values: {
          currentPassword: parsed.data.currentPassword,
          newPassword: "",
          confirmNewPassword: "",
        },
      };
    }

    return {};
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error ? err.message : "Erro inesperado ao alterar senha",
      values: {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: "",
        confirmNewPassword: "",
      },
    };
  }
}

export async function updateProfileAction(
  _prevState: UpdateProfileState | undefined,
  formData: FormData
): Promise<UpdateProfileState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
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
      values: { fullName: String(formData.get("fullName") ?? "") },
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await serverFetch(routes.auth.profile, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fullName: parsed.data.fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Falha ao atualizar perfil";
      return {
        error: Array.isArray(message) ? message[0] : message,
        values: { fullName: parsed.data.fullName },
      };
    }

    return {};
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error
          ? err.message
          : "Erro inesperado ao atualizar perfil",
      values: { fullName: String(formData.get("fullName") ?? "") },
    };
  }
}

export async function deleteAccountAction(): Promise<{ error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await serverFetch(routes.auth.deleteAccount, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Falha ao excluir conta";
      return {
        error: Array.isArray(message) ? message[0] : message,
      };
    }

    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect("/auth/login");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error
          ? err.message
          : "Erro inesperado ao excluir conta",
    };
  }
}
