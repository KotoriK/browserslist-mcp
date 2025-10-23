import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * Tests for MCP protocol compatibility in Cloudflare Worker
 * 
 * These tests use the official MCP Client SDK to ensure that our
 * Cloudflare Worker implementation is fully compatible with the
 * Model Context Protocol specification.
 */
describe('Cloudflare Worker MCP Protocol Compatibility', () => {
  let workerModule: any;
  let client: Client;
  let transport: StreamableHTTPClientTransport;
  let mockFetch: any;

  beforeAll(async () => {
    // Import the worker module
    workerModule = await import('../worker/index.js');
    
    // Create a mock fetch function that calls our worker
    mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
      const request = new Request(url, init);
      const env = {};
      const ctx = {} as any;
      return await workerModule.default.fetch(request, env, ctx);
    };
  });

  afterAll(async () => {
    if (transport) {
      await transport.close();
    }
    if (client) {
      await client.close();
    }
  });

  it('should initialize MCP connection via HTTP', async () => {
    // Create transport with our mock fetch
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    // Create MCP client
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    // Connect to the server
    await client.connect(transport);
    
    // Client should be connected
    expect(client).toBeDefined();
  });

  it('should list available tools via MCP protocol', async () => {
    // Create transport and client
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // List tools
    const tools = await client.listTools();
    
    expect(tools.tools).toBeDefined();
    expect(Array.isArray(tools.tools)).toBe(true);
    expect(tools.tools.length).toBeGreaterThan(0);
    
    // Check for expected tools
    const toolNames = tools.tools.map(t => t.name);
    expect(toolNames).toContain('query_browsers');
    expect(toolNames).toContain('get_defaults');
    expect(toolNames).toContain('get_coverage');
  });

  it('should call query_browsers tool via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Call the query_browsers tool
    const result = await client.callTool('query_browsers', {
      query: 'last 1 version',
    });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    
    // Parse the result
    const textContent = result.content.find(c => c.type === 'text');
    expect(textContent).toBeDefined();
    
    if (textContent && 'text' in textContent) {
      const data = JSON.parse(textContent.text);
      expect(data.browsers).toBeInstanceOf(Array);
      expect(data.query).toBe('last 1 version');
      expect(data.count).toBeGreaterThan(0);
    }
  });

  it('should call get_defaults tool via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Call the get_defaults tool
    const result = await client.callTool('get_defaults', {});
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    
    // Parse the result
    const textContent = result.content.find(c => c.type === 'text');
    expect(textContent).toBeDefined();
    
    if (textContent && 'text' in textContent) {
      expect(textContent.text).toContain('Default browserslist query:');
    }
  });

  it('should call get_coverage tool via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Call the get_coverage tool
    const result = await client.callTool('get_coverage', {
      browsers: ['chrome 90', 'firefox 88'],
    });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    
    // Parse the result
    const textContent = result.content.find(c => c.type === 'text');
    expect(textContent).toBeDefined();
    
    if (textContent && 'text' in textContent) {
      const data = JSON.parse(textContent.text);
      expect(data.coverage).toBeDefined();
      expect(typeof data.coverage).toBe('number');
    }
  });

  it('should list resources via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // List resources
    const resources = await client.listResources();
    
    expect(resources.resources).toBeDefined();
    expect(Array.isArray(resources.resources)).toBe(true);
    expect(resources.resources.length).toBeGreaterThan(0);
    
    // Check for expected resources
    const resourceUris = resources.resources.map(r => r.uri);
    expect(resourceUris).toContain('browserslist://documentation');
    expect(resourceUris).toContain('browserslist://examples');
  });

  it('should read documentation resource via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Read the documentation resource
    const result = await client.readResource('browserslist://documentation');
    
    expect(result).toBeDefined();
    expect(result.contents).toBeDefined();
    expect(Array.isArray(result.contents)).toBe(true);
    expect(result.contents.length).toBeGreaterThan(0);
    
    const docContent = result.contents[0];
    expect(docContent.uri).toBe('browserslist://documentation');
    expect(docContent.mimeType).toBe('text/markdown');
    if ('text' in docContent) {
      expect(docContent.text).toContain('Browserslist');
    }
  });

  it('should read examples resource via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Read the examples resource
    const result = await client.readResource('browserslist://examples');
    
    expect(result).toBeDefined();
    expect(result.contents).toBeDefined();
    expect(Array.isArray(result.contents)).toBe(true);
    expect(result.contents.length).toBeGreaterThan(0);
    
    const examplesContent = result.contents[0];
    expect(examplesContent.uri).toBe('browserslist://examples');
    expect(examplesContent.mimeType).toBe('application/json');
    if ('text' in examplesContent) {
      const examples = JSON.parse(examplesContent.text);
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
    }
  });

  it('should handle errors gracefully via MCP protocol', async () => {
    transport = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await client.connect(transport);
    
    // Try to call a tool with invalid parameters
    const result = await client.callTool('query_browsers', {
      query: 'invalid query syntax 12345',
    });
    
    expect(result).toBeDefined();
    expect(result.isError).toBe(true);
    expect(result.content).toBeDefined();
    
    const errorContent = result.content.find(c => c.type === 'text');
    expect(errorContent).toBeDefined();
    if (errorContent && 'text' in errorContent) {
      expect(errorContent.text).toContain('Error');
    }
  });

  it('should support multiple concurrent connections', async () => {
    // Create two separate clients
    const transport1 = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    const client1 = new Client({
      name: 'test-client-1',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    const transport2 = new StreamableHTTPClientTransport(
      new URL('http://localhost/mcp'),
      { fetch: mockFetch }
    );
    
    const client2 = new Client({
      name: 'test-client-2',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    // Connect both clients
    await Promise.all([
      client1.connect(transport1),
      client2.connect(transport2),
    ]);
    
    // Both clients should be able to call tools concurrently
    const [result1, result2] = await Promise.all([
      client1.callTool('query_browsers', { query: 'last 1 version' }),
      client2.callTool('get_defaults', {}),
    ]);
    
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    
    // Clean up
    await transport1.close();
    await client1.close();
    await transport2.close();
    await client2.close();
  });
});
