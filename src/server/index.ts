import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BrowserslistQuerySchema } from '../types/index.js';
import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../utils/browserslist.js';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../resources/documentation.js';

/**
 * Create and configure the MCP server for browserslist queries
 */
export function createBrowserslistMCPServer() {
  const server = new Server(
    {
      name: 'browserslist-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  /**
   * List available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'query_browsers',
          description: 
            'Execute a browserslist query to get matching browser versions. ' +
            'Accepts standard browserslist query syntax like "last 2 versions", "> 1%", "Chrome > 90", etc.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Browserslist query string (e.g., "last 2 versions", "> 1%", "chrome > 90")',
              },
              options: {
                type: 'object',
                properties: {
                  env: {
                    type: 'string',
                    description: 'Environment configuration (e.g., "production", "development")',
                  },
                  path: {
                    type: 'string',
                    description: 'Path to the directory containing browserslist config',
                  },
                },
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_defaults',
          description: 'Get the default browserslist query configuration',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_coverage',
          description: 'Get global usage coverage for a list of browsers',
          inputSchema: {
            type: 'object',
            properties: {
              browsers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of browser versions (e.g., ["chrome 90", "firefox 88"])',
              },
            },
            required: ['browsers'],
          },
        },
      ],
    };
  });

  /**
   * Handle tool calls
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'query_browsers': {
          const input = BrowserslistQuerySchema.parse(args);
          const result = executeBrowserslistQuery(input);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_defaults': {
          const defaults = getBrowserslistDefaults();
          
          return {
            content: [
              {
                type: 'text',
                text: `Default browserslist query: ${defaults}`,
              },
            ],
          };
        }

        case 'get_coverage': {
          if (!args || typeof args !== 'object' || !('browsers' in args)) {
            throw new Error('browsers parameter is required');
          }
          const browsers = args.browsers as string[];
          if (!Array.isArray(browsers)) {
            throw new Error('browsers must be an array');
          }
          
          const coverage = getBrowserslistCoverage(browsers);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(coverage, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
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
  });

  /**
   * List available resources
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'browserslist://documentation',
          name: 'Browserslist Query Documentation',
          description: 'Comprehensive guide on how to write browserslist queries',
          mimeType: 'text/markdown',
        },
        {
          uri: 'browserslist://examples',
          name: 'Browserslist Query Examples',
          description: 'Common browserslist query examples with descriptions',
          mimeType: 'application/json',
        },
      ],
    };
  });

  /**
   * Handle resource reads
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case 'browserslist://documentation':
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: BROWSERSLIST_DOCUMENTATION,
            },
          ],
        };

      case 'browserslist://examples':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(BROWSERSLIST_EXAMPLES, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

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
