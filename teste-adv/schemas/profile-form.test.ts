import { describe, it, expect } from 'vitest';
import { updateProfileSchema, updatePasswordSchema } from './profile-form';

describe('profile-form schemas', () => {
  describe('updateProfileSchema', () => {
    it('accepts valid fullName', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'John Doe',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('John Doe');
      }
    });

    it('rejects empty fullName', () => {
      const result = updateProfileSchema.safeParse({
        fullName: '',
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace', () => {
      const result = updateProfileSchema.safeParse({
        fullName: '  Jane Doe  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Jane Doe');
      }
    });
  });

  describe('updatePasswordSchema', () => {
    it('accepts valid password update', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmNewPassword: 'newpass123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects new password shorter than 8 characters', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'short',
        confirmNewPassword: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('rejects mismatched newPassword and confirmNewPassword', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmNewPassword: 'different123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmNewPassword');
      }
    });

    it('rejects empty currentPassword', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: '',
        newPassword: 'newpass123',
        confirmNewPassword: 'newpass123',
      });
      expect(result.success).toBe(false);
    });
  });
});
