/**
 * Cloudflare Worker for browserslist-mcp
 * 
 * This is a serverless function that runs on Cloudflare Workers.
 * It provides HTTP endpoints for browserslist queries.
 */

import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../src/utils/browserslist';
import { BrowserslistQuerySchema } from '../src/types';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../src/resources/documentation';

export interface Env {
  // Define environment variables here if needed
}

/**
 * Handle incoming requests
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({ status: 'ok', service: 'browserslist-mcp' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Query browsers
      if (url.pathname === '/api/query' && request.method === 'POST') {
        const body = await request.json();
        const input = BrowserslistQuerySchema.parse(body);
        const result = executeBrowserslistQuery(input);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get defaults
      if (url.pathname === '/api/defaults') {
        const defaults = getBrowserslistDefaults();
        return new Response(JSON.stringify({ defaults }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get coverage
      if (url.pathname === '/api/coverage' && request.method === 'POST') {
        const body = await request.json() as { browsers: string[] };
        if (!Array.isArray(body.browsers)) {
          throw new Error('browsers must be an array');
        }
        const coverage = getBrowserslistCoverage(body.browsers);
        
        return new Response(JSON.stringify(coverage), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get documentation
      if (url.pathname === '/api/documentation') {
        return new Response(BROWSERSLIST_DOCUMENTATION, {
          headers: { ...corsHeaders, 'Content-Type': 'text/markdown' },
        });
      }

      // Get examples
      if (url.pathname === '/api/examples') {
        return new Response(JSON.stringify(BROWSERSLIST_EXAMPLES), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Not found
      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
