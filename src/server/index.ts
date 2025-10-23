import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../utils/browserslist.js';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../resources/documentation.js';

/**
 * Create and configure the MCP server for browserslist queries
 */
export function createBrowserslistMCPServer() {
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
 * Start the MCP server with stdio transport
 */
export async function startServer() {
  const server = createBrowserslistMCPServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  console.error('Browserslist MCP server started');
}
