import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth-form";

describe("auth-form schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "secret123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.password).toBe("secret123");
      }
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "notanemail",
        password: "secret123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "  secret  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe("secret");
      }
    });
  });

  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects name shorter than 2 characters", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched password and confirmPassword", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "different123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
      }
    });
  });
});
