# Cloudflare Worker Deployment

This guide shows how to deploy the browserslist-mcp service as a production-ready Cloudflare Worker using Wrangler.

## Quick Start

The project includes a production-ready Cloudflare Worker implementation. No additional setup is needed!

### Local Development

```bash
# Install dependencies (if not already done)
pnpm install

# Start local development server
pnpm worker:dev
```

This will start a local development server at `http://localhost:8787`.

### Deploy to Cloudflare

1. **Authenticate with Cloudflare:**

```bash
npx wrangler login
```

2. **Deploy to production:**

```bash
pnpm worker:deploy
```

Your worker will be deployed to `https://browserslist-mcp.<your-subdomain>.workers.dev`.

3. **View logs (optional):**

```bash
pnpm worker:tail
```

## Configuration

The worker is configured via `wrangler.toml` in the project root:

```toml
name = "browserslist-mcp"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "browserslist-mcp-production"
```

### Customization

You can customize the worker by editing `wrangler.toml`:

- **name**: Change the worker name
- **compatibility_date**: Update for newer Cloudflare features
- **vars**: Add environment variables
- **routes**: Configure custom domains

Example with custom domain:

```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## API Endpoints

The worker exposes the following endpoints:

### Root
- **GET /** - API information and available endpoints

### Health Check
- **GET /health** - Service health status
  ```json
  {
    "status": "ok",
    "service": "browserslist-mcp",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

### Browserslist Queries
- **POST /api/query** - Execute browserslist query
  
  Request:
  ```json
  {
    "query": "last 2 versions",
    "options": {
      "env": "production"
    }
  }
  ```
  
  Response:
  ```json
  {
    "browsers": ["chrome 120", "chrome 119", ...],
    "query": "last 2 versions",
    "count": 30
  }
  ```

### Configuration
- **GET /api/defaults** - Get default browserslist configuration
  
  Response:
  ```json
  {
    "defaults": "> 0.5%, last 2 versions, Firefox ESR, not dead",
    "description": "Default browserslist configuration"
  }
  ```

### Coverage Statistics
- **POST /api/coverage** - Calculate browser coverage
  
  Request:
  ```json
  {
    "browsers": ["chrome 90", "firefox 88", "safari 14"]
  }
  ```
  
  Response:
  ```json
  {
    "coverage": 68.5
  }
  ```

### Documentation
- **GET /api/documentation** - Get browserslist query documentation (Markdown)
- **GET /api/examples** - Get query examples (JSON)

## Example Usage

### Using cURL

```bash
# Get API information
curl https://browserslist-mcp.your-subdomain.workers.dev/

# Health check
curl https://browserslist-mcp.your-subdomain.workers.dev/health

# Query browsers
curl -X POST https://browserslist-mcp.your-subdomain.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "last 2 versions and not dead"}'

# Get defaults
curl https://browserslist-mcp.your-subdomain.workers.dev/api/defaults

# Calculate coverage
curl -X POST https://browserslist-mcp.your-subdomain.workers.dev/api/coverage \
  -H "Content-Type: application/json" \
  -d '{"browsers": ["chrome 90", "firefox 88"]}'

# Get documentation
curl https://browserslist-mcp.your-subdomain.workers.dev/api/documentation

# Get examples
curl https://browserslist-mcp.your-subdomain.workers.dev/api/examples
```

### Using JavaScript/TypeScript

```typescript
const API_URL = 'https://browserslist-mcp.your-subdomain.workers.dev';

// Query browsers
const response = await fetch(`${API_URL}/api/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'last 2 versions' })
});

const result = await response.json();
console.log(result.browsers);
```

## Features

### Production-Ready
- ✅ Comprehensive error handling
- ✅ CORS support for all endpoints
- ✅ Proper HTTP status codes
- ✅ Request validation with Zod schemas
- ✅ Structured JSON responses
- ✅ Health check endpoint

### Performance
- ⚡ Edge deployment (served from 300+ locations)
- ⚡ Low latency (< 50ms in most regions)
- ⚡ Auto-scaling
- ⚡ No cold starts

### Security
- 🔒 Input validation
- 🔒 Error message sanitization
- 🔒 CORS configuration
- 🔒 No filesystem access (secure by design)

## Development

### Testing Locally

```bash
# Start local dev server
pnpm worker:dev

# In another terminal, test the endpoints
curl http://localhost:8787/health
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "defaults"}'
```

### Debugging

View real-time logs from your deployed worker:

```bash
pnpm worker:tail
```

Or use the Cloudflare dashboard for advanced debugging and analytics.

## Monitoring

### Cloudflare Dashboard

Access detailed analytics in the Cloudflare dashboard:
- Request volume
- Error rates
- Response times
- Geographic distribution

### Custom Monitoring

Add observability to `wrangler.toml`:

```toml
[observability]
enabled = true
```

## Limitations

- **Bundle size**: Workers have a 1MB size limit (compressed). The current implementation is well under this limit.
- **Execution time**: Maximum 50ms CPU time on free plan, unlimited on paid plans.
- **File system**: No file system access - browserslist config files must be provided via API.
- **Node.js modules**: Limited Node.js compatibility - uses `nodejs_compat` flag for core modules.

## Cost

Cloudflare Workers pricing (as of 2024):

- **Free tier**: 100,000 requests/day
- **Paid plan**: $5/month for 10M requests + $0.50 per additional million

For most use cases, the free tier is sufficient.

## Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   npx wrangler login
   ```

2. **Bundle Size Too Large**
   - Check imported dependencies
   - Use tree-shaking
   - Consider using external storage for large data

3. **Module Resolution Issues**
   - Ensure `compatibility_flags = ["nodejs_compat"]` is set in `wrangler.toml`
   - Check that imports use `.js` extensions

## Advanced Configuration

### Custom Domains

```toml
routes = [
  { pattern = "browserslist.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Environment Variables

```toml
[vars]
API_KEY = "your-secret-key"

[env.production.vars]
API_KEY = "production-secret-key"
```

Access in worker:
```typescript
export default {
  async fetch(request: Request, env: Env) {
    console.log(env.API_KEY);
  }
}
```

### Multiple Environments

```toml
[env.staging]
name = "browserslist-mcp-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
name = "browserslist-mcp-production"
vars = { ENVIRONMENT = "production" }
```

Deploy to specific environment:
```bash
npx wrangler deploy --env production
```

## Further Reading

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Browserslist Documentation](https://github.com/browserslist/browserslist)
