import { loginSchema, registerSchema } from '@/schemas/auth-form';
import z from 'zod';

import type {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/enums';

export type { TransactionDirection, TransactionStatus, TransactionType };

// ---- ActionResult (read actions - discriminated union) ----

/** Resultado de action de leitura: sucesso com data OU erro para exibir */
export type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---- Form state types (mutations - useActionState) ----

export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: { email?: string; password?: string };
};

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export type UpdatePasswordState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
  values?: {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
};

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
  values?: { fullName?: string };
};

export type DeleteAccountState = { error?: string };

export type TransferState = {
  error?: string;
  success?: boolean;
  receiverEmail?: string;
  amount?: number;
  fieldErrors?: { receiverEmail?: string[]; amount?: string[] };
};

export type ReverseState = { error?: string; success?: boolean };

export type BuyCreditsState = {
  error?: string;
  success?: boolean;
  fieldErrors?: { packageId?: string[] };
};

// ---- API DTOs (request/response) ----

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

export interface IWallet {
  id: string;
  userId: string;
  balance: number;
}

export interface ICreditPurchase {
  id: string;
  packageId: string;
  credits: number;
  amount?: number;
  createdAt: string;
}

export interface ITransaction {
  id: string;
  type: TransactionType;
  amount: number;
  senderId?: string;
  receiverId?: string;
  status: TransactionStatus;
  createdAt: string;
  direction: TransactionDirection;
  canReverse: boolean;
  counterpartEmail?: string;
}

export interface IUserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface TransactionByPeriodItem {
  date: string;
  recebido: number;
  enviado: number;
}
