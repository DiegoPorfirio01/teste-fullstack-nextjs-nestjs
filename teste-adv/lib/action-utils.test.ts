import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toUserFriendlyMessage } from './action-utils';

// rethrowNavigationError calls unstable_rethrow from next/navigation - we don't test it
// as it would require complex Next.js runtime setup

describe('action-utils', () => {
  describe('toUserFriendlyMessage', () => {
    it('returns Error message when err is Error instance', () => {
      expect(
        toUserFriendlyMessage(new Error('Something went wrong'), 'Fallback'),
      ).toBe('Something went wrong');
    });

    it('returns string when err is string', () => {
      expect(toUserFriendlyMessage('Direct error string', 'Fallback')).toBe(
        'Direct error string',
      );
    });

    it('returns fallback when err is Error with empty message', () => {
      expect(toUserFriendlyMessage(new Error(''), 'Fallback')).toBe('Fallback');
    });

    it('returns fallback when err is null', () => {
      expect(toUserFriendlyMessage(null, 'Fallback')).toBe('Fallback');
    });

    it('returns fallback when err is number or other non-string primitive', () => {
      expect(toUserFriendlyMessage(404, 'Fallback')).toBe('Fallback');
      expect(toUserFriendlyMessage(true, 'Fallback')).toBe('Fallback');
    });
  });
});
