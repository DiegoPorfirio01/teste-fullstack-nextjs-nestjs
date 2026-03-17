import z from "zod";

export const loginSchema = z.object({
    email: z.email("E-mail inválido").trim(),
    password: z.string().min(1, "Senha é obrigatória").trim(),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").trim(),
    email: z.email("E-mail inválido").trim(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").trim(),
    confirmPassword: z.string().min(1, "Confirme sua senha").trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});