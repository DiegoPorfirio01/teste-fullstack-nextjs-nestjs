import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from './api-error';

describe('getApiErrorMessage', () => {
  it('returns message from object with message property', () => {
    const data = { message: 'Custom error message' };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('Custom error message');
  });

  it('returns first element when message is array', () => {
    const data = { message: ['First error', 'Second error'] };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('First error');
  });

  it('returns error property when message is missing', () => {
    const data = { error: 'Bad Request' };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('Bad Request');
  });

  it('returns fallback when data is null', () => {
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when data is undefined', () => {
    expect(getApiErrorMessage(undefined, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when data is not an object', () => {
    expect(getApiErrorMessage('string', 'Fallback')).toBe('Fallback');
    expect(getApiErrorMessage(123, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when message array is empty', () => {
    const data = { message: [] };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when message and error are missing', () => {
    const data = { statusCode: 500 };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('Fallback');
  });

  it('prioritizes message over error', () => {
    const data = { message: 'Specific', error: 'Generic' };
    expect(getApiErrorMessage(data, 'Fallback')).toBe('Specific');
  });
});
