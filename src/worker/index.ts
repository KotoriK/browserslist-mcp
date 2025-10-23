/**
 * Cloudflare Worker for browserslist-mcp
 * 
 * Production-ready implementation with proper error handling,
 * CORS support, and comprehensive API endpoints.
 * 
 * Supports both REST API endpoints and MCP protocol via HTTP.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../utils/browserslist.js';
import { BrowserslistQuerySchema } from '../types/index.js';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../resources/documentation.js';

export interface Env {
  // Define environment variables/bindings here
  // Example: API_KEY: string;
}

/**
 * Create and configure the MCP server for browserslist queries
 */
function createMCPServer(): McpServer {
  const server = new McpServer({
    name: 'browserslist-mcp',
    version: '1.0.0',
  });

  /**
   * Register query_browsers tool
   */
  server.registerTool(
    'query_browsers',
    {
      title: 'Query Browsers',
      description: 
        'Execute a browserslist query to get matching browser versions. ' +
        'Accepts standard browserslist query syntax like "last 2 versions", "> 1%", "Chrome > 90", etc.',
      inputSchema: {
        query: z.string().describe('Browserslist query string (e.g., "last 2 versions", "> 1%", "chrome > 90")'),
        options: z.object({
          env: z.string().optional().describe('Environment configuration (e.g., "production", "development")'),
          path: z.string().optional().describe('Path to the directory containing browserslist config'),
        }).optional(),
      },
      outputSchema: {
        browsers: z.array(z.string()),
        query: z.string(),
        count: z.number(),
      },
    },
    async ({ query, options }) => {
      try {
        const result = executeBrowserslistQuery({ query, options });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Register get_defaults tool
   */
  server.registerTool(
    'get_defaults',
    {
      title: 'Get Defaults',
      description: 'Get the default browserslist query configuration',
      inputSchema: {},
      outputSchema: {
        defaults: z.string(),
      },
    },
    async () => {
      try {
        const defaults = getBrowserslistDefaults();
        return {
          content: [
            {
              type: 'text',
              text: `Default browserslist query: ${defaults}`,
            },
          ],
          structuredContent: { defaults },
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Register get_coverage tool
   */
  server.registerTool(
    'get_coverage',
    {
      title: 'Get Coverage',
      description: 'Get global usage coverage for a list of browsers',
      inputSchema: {
        browsers: z.array(z.string()).describe('Array of browser versions (e.g., ["chrome 90", "firefox 88"])'),
      },
      outputSchema: {
        coverage: z.number(),
      },
    },
    async ({ browsers }) => {
      try {
        const coverage = getBrowserslistCoverage(browsers);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(coverage, null, 2),
            },
          ],
          structuredContent: coverage,
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Register browserslist documentation resource
   */
  server.registerResource(
    'documentation',
    'browserslist://documentation',
    {
      title: 'Browserslist Query Documentation',
      description: 'Comprehensive guide on how to write browserslist queries',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: BROWSERSLIST_DOCUMENTATION,
        },
      ],
    })
  );

  /**
   * Register browserslist examples resource
   */
  server.registerResource(
    'examples',
    'browserslist://examples',
    {
      title: 'Browserslist Query Examples',
      description: 'Common browserslist query examples with descriptions',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(BROWSERSLIST_EXAMPLES, null, 2),
        },
      ],
    })
  );

  return server;
}

/**
 * Shared MCP server for reuse across requests
 */
const mcpServer = createMCPServer();

/**
 * Convert Cloudflare Worker Request to a Node.js-like IncomingMessage
 */
class WorkerIncomingMessage {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  
  constructor(request: Request) {
    this.method = request.method;
    this.url = request.url;
    this.headers = {};
    request.headers.forEach((value, key) => {
      this.headers[key.toLowerCase()] = value;
    });
  }
}

/**
 * Convert Node.js-like ServerResponse to Cloudflare Worker Response
 */
class WorkerServerResponse {
  statusCode: number = 200;
  private _headers: Record<string, string> = {};
  private _chunks: Uint8Array[] = [];
  private _responsePromise: Promise<Response>;
  private _responseResolve!: (response: Response) => void;
  private _headersSent: boolean = false;
  private _eventListeners: Record<string, Array<(...args: any[]) => void>> = {};
  
  constructor() {
    this._responsePromise = new Promise((resolve) => {
      this._responseResolve = resolve;
    });
  }
  
  setHeader(name: string, value: string | number): void {
    this._headers[name.toLowerCase()] = String(value);
  }
  
  writeHead(statusCode: number, headers?: Record<string, string | number>): this {
    this.statusCode = statusCode;
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        this.setHeader(key, value);
      }
    }
    this._headersSent = true;
    return this;
  }
  
  flushHeaders(): void {
    this._headersSent = true;
  }
  
  write(chunk: string | Uint8Array): boolean {
    if (typeof chunk === 'string') {
      this._chunks.push(new TextEncoder().encode(chunk));
    } else {
      this._chunks.push(chunk);
    }
    return true;
  }
  
  end(chunk?: string | Uint8Array): void {
    if (chunk) {
      this.write(chunk);
    }
    
    // Concatenate all chunks
    const totalLength = this._chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of this._chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    
    const response = new Response(body, {
      status: this.statusCode,
      headers: this._headers,
    });
    
    this._responseResolve(response);
  }
  
  on(event: string, listener: (...args: any[]) => void): this {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(listener);
    return this;
  }
  
  emit(event: string, ...args: any[]): boolean {
    const listeners = this._eventListeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(...args));
      return true;
    }
    return false;
  }
  
  getResponse(): Promise<Response> {
    return this._responsePromise;
  }
}

/**
 * Handle MCP protocol requests using StreamableHTTPServerTransport
 */
async function handleMCPRequest(request: Request): Promise<Response> {
  try {
    const method = request.method;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Accept, Mcp-Protocol-Version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Create a new stateless transport for each request
    // In stateless mode, each request is independent and doesn't require session management
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
      enableJsonResponse: true, // Return JSON instead of SSE for simplicity
    });
    
    // Connect the transport to the server
    await mcpServer.connect(transport);
    
    // Parse request body if it's a POST request
    let parsedBody: unknown = undefined;
    if (method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        parsedBody = await request.json();
      }
    }
    
    // Create Node.js-like request and response objects
    const req = new WorkerIncomingMessage(request) as any;
    const res = new WorkerServerResponse() as any;
    
    // Handle the request using the StreamableHTTPServerTransport
    await transport.handleRequest(req, res, parsedBody);
    
    // Get the response
    const response = await res.getResponse();
    
    // Add CORS headers to the response
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('MCP request error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * CORS headers for all responses
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
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
      'GET|POST|DELETE /mcp': 'MCP protocol endpoint (Model Context Protocol)',
      'POST /api/query': 'Execute browserslist query (REST API)',
      'GET /api/defaults': 'Get default browserslist configuration (REST API)',
      'POST /api/coverage': 'Calculate browser coverage (REST API)',
      'GET /api/documentation': 'Get browserslist query documentation (REST API)',
      'GET /api/examples': 'Get query examples (REST API)',
    },
    documentation: 'https://github.com/browserslist/browserslist',
    mcp: 'https://modelcontextprotocol.io',
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

  // Handle MCP protocol endpoint
  if (pathname === '/mcp') {
    return handleMCPRequest(request);
  }

  // Route handling for REST API
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
      // Handle the request
      return await handleRequest(request);
    } catch (error) {
      console.error('Worker error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return errorResponse(message, 500);
    }
  },
};
