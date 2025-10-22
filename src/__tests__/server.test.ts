import { describe, it, expect } from 'vitest';
import { createBrowserslistMCPServer } from '../server/index.js';

describe('MCP Server', () => {
  it('should create server instance', () => {
    const server = createBrowserslistMCPServer();
    expect(server).toBeDefined();
  });

  it('should have correct server info', () => {
    const server = createBrowserslistMCPServer();
    // The server should be properly configured
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });
});
