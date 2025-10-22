/**
 * Cloudflare Worker for browserslist-mcp
 * 
 * Production-ready implementation with proper error handling,
 * CORS support, and comprehensive API endpoints.
 */

import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../utils/browserslist.js';
import { BrowserslistQuerySchema } from '../types/index.js';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../resources/documentation.js';

export interface Env {
  // Define environment variables/bindings here
  // Example: API_KEY: string;
}

/**
 * CORS headers for all responses
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Create a JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response
 */
function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Handle health check endpoint
 */
function handleHealth(): Response {
  return jsonResponse({
    status: 'ok',
    service: 'browserslist-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle query browsers endpoint
 */
async function handleQueryBrowsers(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const input = BrowserslistQuerySchema.parse(body);
    const result = executeBrowserslistQuery(input);
    return jsonResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse request';
    return errorResponse(message);
  }
}

/**
 * Handle get defaults endpoint
 */
function handleGetDefaults(): Response {
  try {
    const defaults = getBrowserslistDefaults();
    return jsonResponse({ 
      defaults,
      description: 'Default browserslist configuration'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get defaults';
    return errorResponse(message, 500);
  }
}

/**
 * Handle get coverage endpoint
 */
async function handleGetCoverage(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { browsers?: unknown };
    
    if (!body.browsers || !Array.isArray(body.browsers)) {
      return errorResponse('browsers must be an array of browser strings');
    }

    const coverage = getBrowserslistCoverage(body.browsers as string[]);
    return jsonResponse(coverage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate coverage';
    return errorResponse(message);
  }
}

/**
 * Handle documentation endpoint
 */
function handleDocumentation(): Response {
  return new Response(BROWSERSLIST_DOCUMENTATION, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

/**
 * Handle examples endpoint
 */
function handleExamples(): Response {
  return jsonResponse(BROWSERSLIST_EXAMPLES);
}

/**
 * Handle root endpoint - API information
 */
function handleRoot(): Response {
  return jsonResponse({
    name: 'browserslist-mcp',
    version: '1.0.0',
    description: 'Browserslist query API for Cloudflare Workers',
    endpoints: {
      'GET /': 'API information',
      'GET /health': 'Health check',
      'POST /api/query': 'Execute browserslist query',
      'GET /api/defaults': 'Get default browserslist configuration',
      'POST /api/coverage': 'Calculate browser coverage',
      'GET /api/documentation': 'Get browserslist query documentation',
      'GET /api/examples': 'Get query examples',
    },
    documentation: 'https://github.com/browserslist/browserslist',
  });
}

/**
 * Router for handling different endpoints
 */
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  // Route handling
  if (pathname === '/' || pathname === '') {
    return handleRoot();
  }

  if (pathname === '/health') {
    return handleHealth();
  }

  if (pathname === '/api/query' && method === 'POST') {
    return handleQueryBrowsers(request);
  }

  if (pathname === '/api/defaults' && method === 'GET') {
    return handleGetDefaults();
  }

  if (pathname === '/api/coverage' && method === 'POST') {
    return handleGetCoverage(request);
  }

  if (pathname === '/api/documentation' && method === 'GET') {
    return handleDocumentation();
  }

  if (pathname === '/api/examples' && method === 'GET') {
    return handleExamples();
  }

  // 404 Not Found
  return errorResponse(`Endpoint not found: ${method} ${pathname}`, 404);
}

/**
 * Main worker export
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleRequest(request);
    } catch (error) {
      console.error('Worker error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return errorResponse(message, 500);
    }
  },
};
