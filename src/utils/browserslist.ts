import browserslist from 'browserslist';
import { BrowserslistResult, BrowserslistQueryInput } from '../types/index.js';

/**
 * Execute browserslist query and return formatted results
 */
export function executeBrowserslistQuery(input: BrowserslistQueryInput): BrowserslistResult {
  try {
    const browsers = browserslist(input.query, {
      env: input.options?.env,
      path: input.options?.path
    });

    return {
      browsers,
      query: input.query,
      count: browsers.length
    };
  } catch (error) {
    throw new Error(`Failed to execute browserslist query: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get browserslist configuration defaults
 */
export function getBrowserslistDefaults(): string {
  return browserslist.defaults.join(', ');
}

/**
 * Get browserslist coverage statistics
 */
export function getBrowserslistCoverage(browsers: string[]): { coverage: number; countryCode?: string } {
  try {
    const coverage = browserslist.coverage(browsers);
    return { coverage };
  } catch (error) {
    throw new Error(`Failed to get coverage: ${error instanceof Error ? error.message : String(error)}`);
  }
}
