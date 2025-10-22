import { describe, it, expect } from 'vitest';
import { executeBrowserslistQuery, getBrowserslistDefaults, getBrowserslistCoverage } from '../utils/browserslist.js';

describe('Browserslist Utilities', () => {
  describe('executeBrowserslistQuery', () => {
    it('should execute a simple query', () => {
      const result = executeBrowserslistQuery({
        query: 'last 1 version',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
      expect(result.query).toBe('last 1 version');
      expect(result.count).toBe(result.browsers.length);
    });

    it('should execute query with percentage', () => {
      const result = executeBrowserslistQuery({
        query: '> 1%',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
    });

    it('should execute query with browser name', () => {
      const result = executeBrowserslistQuery({
        query: 'Chrome > 90',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
      // All results should be Chrome
      expect(result.browsers.every(b => b.toLowerCase().startsWith('chrome'))).toBe(true);
    });

    it('should execute defaults query', () => {
      const result = executeBrowserslistQuery({
        query: 'defaults',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid query', () => {
      expect(() => {
        executeBrowserslistQuery({
          query: 'invalid query syntax that does not exist',
        });
      }).toThrow();
    });

    it('should handle combined queries', () => {
      const result = executeBrowserslistQuery({
        query: 'last 2 versions, > 1%',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
    });

    it('should handle NOT queries', () => {
      const result = executeBrowserslistQuery({
        query: 'last 2 versions and not dead',
      });

      expect(result).toBeDefined();
      expect(result.browsers).toBeInstanceOf(Array);
      expect(result.browsers.length).toBeGreaterThan(0);
    });
  });

  describe('getBrowserslistDefaults', () => {
    it('should return default browsers as string', () => {
      const defaults = getBrowserslistDefaults();

      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('string');
      expect(defaults.length).toBeGreaterThan(0);
    });
  });

  describe('getBrowserslistCoverage', () => {
    it('should calculate coverage for browsers', () => {
      const browsers = ['chrome 90', 'firefox 88', 'safari 14'];
      const coverage = getBrowserslistCoverage(browsers);

      expect(coverage).toBeDefined();
      expect(coverage.coverage).toBeDefined();
      expect(typeof coverage.coverage).toBe('number');
      expect(coverage.coverage).toBeGreaterThan(0);
      expect(coverage.coverage).toBeLessThanOrEqual(100);
    });

    it('should handle empty browser list', () => {
      const browsers: string[] = [];
      const coverage = getBrowserslistCoverage(browsers);

      expect(coverage).toBeDefined();
      expect(coverage.coverage).toBe(0);
    });
  });
});
