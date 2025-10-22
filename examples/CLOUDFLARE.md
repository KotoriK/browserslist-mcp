# Cloudflare Worker Deployment

This example shows how to deploy the browserslist-mcp service as a Cloudflare Worker.

## Prerequisites

1. A Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler login`

## Setup

1. Create a new directory for your worker:

```bash
mkdir browserslist-worker
cd browserslist-worker
```

2. Initialize a new Cloudflare Worker project:

```bash
npm init -y
npm install browserslist zod
```

3. Copy the `cloudflare-worker.ts` file from this examples directory to your worker project as `src/index.ts`.

4. Create a `wrangler.toml` configuration file:

```toml
name = "browserslist-mcp"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[env.production]
name = "browserslist-mcp-production"
```

5. Add build scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

## Build and Deploy

1. Test locally:

```bash
npm run dev
```

This will start a local development server, typically at `http://localhost:8787`.

2. Deploy to Cloudflare:

```bash
npm run deploy
```

Your worker will be deployed to `https://browserslist-mcp.<your-subdomain>.workers.dev`.

## API Endpoints

Once deployed, your worker will expose the following endpoints:

- `GET /health` - Health check
- `POST /api/query` - Execute browserslist query
- `GET /api/defaults` - Get default configuration
- `POST /api/coverage` - Calculate browser coverage
- `GET /api/documentation` - Get query documentation
- `GET /api/examples` - Get query examples

## Example Usage

```bash
# Query browsers
curl -X POST https://browserslist-mcp.<your-subdomain>.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "last 2 versions"}'

# Get defaults
curl https://browserslist-mcp.<your-subdomain>.workers.dev/api/defaults

# Get coverage
curl -X POST https://browserslist-mcp.<your-subdomain>.workers.dev/api/coverage \
  -H "Content-Type: application/json" \
  -d '{"browsers": ["chrome 90", "firefox 88"]}'
```

## Notes

- Cloudflare Workers have size limits. Make sure your bundled worker doesn't exceed 1MB.
- The worker uses ESBuild for bundling by default through Wrangler.
- You may need to adjust the imports in `cloudflare-worker.ts` to work with your build setup.

## Alternative: Copy Source Files

Instead of using the example worker file, you can also:

1. Copy the entire `src/utils`, `src/types`, and `src/resources` directories to your worker project
2. Create a new entry point that handles HTTP requests similar to the Koa server
3. This gives you more control over the bundling and dependencies

## Limitations

- The MCP protocol over stdio is not supported in Cloudflare Workers (HTTP only)
- Browserslist configuration files cannot be read from the filesystem in Workers
- Custom usage statistics are not available in the serverless environment
