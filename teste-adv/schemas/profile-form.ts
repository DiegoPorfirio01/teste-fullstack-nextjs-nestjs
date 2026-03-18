import z from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Nome é obrigatório').trim(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória').trim(),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .trim(),
    confirmNewPassword: z.string().min(1, 'Confirme a nova senha').trim(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });
