import { describe, it, expect, beforeAll } from 'vitest';

// Mock the Cloudflare Worker environment
describe('Cloudflare Worker', () => {
  let workerModule: any;

  beforeAll(async () => {
    // Dynamically import the worker module
    workerModule = await import('../worker/index.js');
  });

  it('should export a default object with fetch method', () => {
    expect(workerModule.default).toBeDefined();
    expect(typeof workerModule.default.fetch).toBe('function');
  });

  it('should handle root endpoint', async () => {
    const request = new Request('http://localhost/');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.name).toBe('browserslist-mcp');
    expect(data.endpoints).toBeDefined();
  });

  it('should handle health endpoint', async () => {
    const request = new Request('http://localhost/health');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('browserslist-mcp');
  });

  it('should handle query endpoint', async () => {
    const request = new Request('http://localhost/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'last 1 version' })
    });
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.browsers).toBeInstanceOf(Array);
    expect(data.query).toBe('last 1 version');
    expect(data.count).toBeGreaterThan(0);
  });

  it('should handle defaults endpoint', async () => {
    const request = new Request('http://localhost/api/defaults');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.defaults).toBeDefined();
    expect(typeof data.defaults).toBe('string');
  });

  it('should handle coverage endpoint', async () => {
    const request = new Request('http://localhost/api/coverage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ browsers: ['chrome 90', 'firefox 88'] })
    });
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.coverage).toBeDefined();
    expect(typeof data.coverage).toBe('number');
  });

  it('should handle documentation endpoint', async () => {
    const request = new Request('http://localhost/api/documentation');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    
    const text = await response.text();
    expect(text).toContain('Browserslist');
  });

  it('should handle examples endpoint', async () => {
    const request = new Request('http://localhost/api/examples');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should handle OPTIONS request (CORS preflight)', async () => {
    const request = new Request('http://localhost/api/query', {
      method: 'OPTIONS'
    });
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should return 404 for unknown endpoint', async () => {
    const request = new Request('http://localhost/unknown');
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toContain('not found');
  });

  it('should handle invalid query gracefully', async () => {
    const request = new Request('http://localhost/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'invalid query syntax 123456' })
    });
    const env = {};
    const ctx = {} as any;

    const response = await workerModule.default.fetch(request, env, ctx);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});
