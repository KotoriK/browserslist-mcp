# browserslist-mcp

A Model Context Protocol (MCP) server for parsing browserslist queries and providing browserslist documentation.

## Features

- **MCP Protocol Compliance**: Fully compliant with the [MCP specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18)
- **Browserslist Query Parsing**: Execute browserslist queries and get matching browser versions
- **Multiple Deployment Options**:
  - Stdio-based MCP server for integration with MCP clients
  - HTTP-based Koa server for web deployments
  - Compatible with serverless platforms like Cloudflare Workers
- **Comprehensive Documentation**: Built-in resources for learning browserslist query syntax
- **Type Safety**: Complete TypeScript type definitions with Zod schema validation
- **Well-tested**: Comprehensive test suite with Vitest

## Installation

Using pnpm (recommended):

```bash
pnpm install
```

Using npm:

```bash
npm install
```

## Usage

### As MCP Server (Stdio)

The default mode runs as an MCP server using stdio transport:

```bash
pnpm dev
```

Or build and run:

```bash
pnpm build
node dist/index.js
```

### As HTTP Server (Koa)

Run the HTTP server for web-based access:

```bash
pnpm dev:koa
```

The server will start on port 3000 (or the port specified in the `PORT` environment variable).

### As Cloudflare Worker (Serverless)

Deploy to Cloudflare Workers for edge computing:

```bash
# Local development
pnpm worker:dev

# Deploy to production
pnpm worker:deploy
```

See [Cloudflare Workers Guide](./examples/CLOUDFLARE.md) for detailed instructions.

#### HTTP Endpoints

- `GET /health` - Health check endpoint
- `POST /api/query` - Execute browserslist query
  ```json
  {
    "query": "last 2 versions",
    "options": {
      "env": "production"
    }
  }
  ```
- `GET /api/defaults` - Get default browserslist configuration
- `POST /api/coverage` - Get browser coverage statistics
  ```json
  {
    "browsers": ["chrome 90", "firefox 88"]
  }
  ```
- `GET /api/documentation` - Get browserslist query documentation (Markdown)
- `GET /api/examples` - Get browserslist query examples

## MCP Tools

The server provides the following MCP tools:

### `query_browsers`

Execute a browserslist query to get matching browser versions.

**Input:**
```json
{
  "query": "last 2 versions",
  "options": {
    "env": "production",
    "path": "/path/to/project"
  }
}
```

**Output:**
```json
{
  "browsers": ["chrome 120", "chrome 119", "firefox 121", ...],
  "query": "last 2 versions",
  "count": 42
}
```

### `get_defaults`

Get the default browserslist query configuration.

**Output:**
```
Default browserslist query: > 0.5%, last 2 versions, Firefox ESR, not dead
```

### `get_coverage`

Get global usage coverage for a list of browsers.

**Input:**
```json
{
  "browsers": ["chrome 90", "firefox 88", "safari 14"]
}
```

**Output:**
```json
{
  "coverage": 68.5
}
```

## MCP Resources

### `browserslist://documentation`

Comprehensive markdown documentation on browserslist query syntax, including:
- Basic query types (browser versions, names, date ranges)
- Special queries (defaults, dead browsers, etc.)
- Combining queries with boolean operators
- Browser name reference
- Configuration files
- Best practices

### `browserslist://examples`

JSON array of common browserslist query examples with descriptions.

## Development

### Build

```bash
pnpm build
```

### Test

Run tests:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

UI mode:

```bash
pnpm test:ui
```

### Type Check

```bash
pnpm typecheck
```

## Project Structure

```
browserslist-mcp/
├── src/
│   ├── __tests__/          # Test files
│   ├── resources/          # Documentation resources
│   ├── server/             # Server implementations
│   │   ├── index.ts        # MCP server
│   │   ├── koa.ts          # Koa HTTP server
│   │   └── koa-entry.ts    # Koa entry point
│   ├── types/              # Type definitions
│   ├── utils/              # Utility functions
│   └── index.ts            # Main entry point
├── dist/                   # Build output
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Browserslist Query Examples

Here are some common browserslist queries:

- `defaults` - Browserslist default browsers (recommended)
- `last 2 versions` - Last 2 versions of all browsers
- `> 1%` - Browsers with more than 1% global usage
- `not dead` - Exclude browsers without updates for 24 months
- `last 2 versions and not dead` - Combined query
- `Chrome > 90` - Chrome versions newer than 90
- `last 1 year` - Browsers released in the last year
- `> 0.5%, not IE 11` - More than 0.5% usage, excluding IE 11

For more details, use the `browserslist://documentation` resource or visit the [browserslist documentation](https://github.com/browserslist/browserslist).

## Technologies Used

- **TypeScript** - Type-safe code
- **Zod** - Schema validation
- **@modelcontextprotocol/sdk** - MCP protocol implementation
- **browserslist** - Browser query parsing
- **Koa** - HTTP server framework
- **Vitest** - Testing framework
- **pnpm** - Package manager

## Documentation

- **[WORKER.md](./WORKER.md)** - Comprehensive Cloudflare Workers guide
- **[examples/README.md](./examples/README.md)** - MCP client configuration examples
- **[examples/CLOUDFLARE.md](./examples/CLOUDFLARE.md)** - Quick Cloudflare deployment guide

## Examples

The `examples/` directory contains:

- **MCP Client Configuration** - How to configure Claude Desktop and other MCP clients
- **Cloudflare Worker Deployment** - Production-ready serverless deployment guide
- **HTTP API Examples** - Using the Koa HTTP server

## License

ISC

