import { loginSchema, registerSchema } from "@/schemas/auth-form";
import z from "zod";


export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: { email?: string; password?: string };
};

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: { name?: string; email?: string; password?: string; confirmPassword?: string };
};

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;

export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
