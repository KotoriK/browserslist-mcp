import { describe, it, expect } from 'vitest';
import { BrowserslistQuerySchema } from '../types/index.js';

describe('Type Validation', () => {
  describe('BrowserslistQuerySchema', () => {
    it('should validate valid query input', () => {
      const validInput = {
        query: 'last 2 versions',
      };

      const result = BrowserslistQuerySchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should validate query with options', () => {
      const validInput = {
        query: 'last 2 versions',
        options: {
          env: 'production',
          path: '/some/path',
        },
      };

      const result = BrowserslistQuerySchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should validate query with partial options', () => {
      const validInput = {
        query: 'last 2 versions',
        options: {
          env: 'development',
        },
      };

      const result = BrowserslistQuerySchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should reject input without query', () => {
      const invalidInput = {
        options: {
          env: 'production',
        },
      };

      expect(() => {
        BrowserslistQuerySchema.parse(invalidInput);
      }).toThrow();
    });

    it('should reject non-string query', () => {
      const invalidInput = {
        query: 123,
      };

      expect(() => {
        BrowserslistQuerySchema.parse(invalidInput);
      }).toThrow();
    });
  });
});
