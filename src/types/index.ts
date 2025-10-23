import { z } from 'zod';

/**
 * Schema for browserslist query tool input
 */
export const BrowserslistQuerySchema = z.object({
  query: z.string().describe('Browserslist query string (e.g., "last 2 versions", "> 1%", "chrome > 90")'),
  options: z.object({
    env: z.string().optional().describe('Environment configuration (e.g., "production", "development")'),
    path: z.string().optional().describe('Path to the directory containing browserslist config')
  }).optional()
});

export type BrowserslistQueryInput = z.infer<typeof BrowserslistQuerySchema>;

/**
 * Schema for browserslist query result
 */
export interface BrowserslistResult {
  browsers: string[];
  query: string;
  count: number;
  [key: string]: unknown;
}
