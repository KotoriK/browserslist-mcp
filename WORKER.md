# Cloudflare Workers Integration

This document provides a comprehensive guide for the production-ready Cloudflare Workers implementation included in this project.

## Overview

The browserslist-mcp worker is a serverless API deployed to Cloudflare's global edge network, providing:

- ⚡ **Ultra-low latency** - Served from 300+ locations worldwide
- 🔒 **Production-ready** - Complete error handling, validation, and security
- 📊 **Observable** - Built-in monitoring and logging
- 💰 **Cost-effective** - Free tier includes 100,000 requests/day
- 🌍 **Global** - Automatic geo-distribution

## Quick Start

### 1. Local Development

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm worker:dev
```

The worker will be available at `http://localhost:8787`.

### 2. Deploy to Production

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Deploy to Cloudflare Workers
pnpm worker:deploy
```

Your worker will be deployed to `https://browserslist-mcp.<your-subdomain>.workers.dev`.

### 3. Monitor Logs

```bash
# Stream live logs from production
pnpm worker:tail
```

## Architecture

### File Structure

```
src/worker/
└── index.ts         # Main worker entry point

wrangler.toml        # Worker configuration
```

### Dependencies

The worker imports from the main project:
- `src/utils/browserslist.ts` - Core browserslist functions
- `src/types/index.ts` - Type definitions and schemas
- `src/resources/documentation.ts` - Documentation content

This ensures code reuse and consistency across all deployment options.

## API Reference

### Base Response Format

All JSON responses follow this structure:

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

### Endpoints

#### `GET /`
**Description:** API information and available endpoints

**Response:**
```json
{
  "name": "browserslist-mcp",
  "version": "1.0.0",
  "description": "Browserslist query API for Cloudflare Workers",
  "endpoints": {
    "GET /": "API information",
    "GET /health": "Health check",
    "POST /api/query": "Execute browserslist query",
    ...
  }
}
```

#### `GET /health`
**Description:** Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "browserslist-mcp",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/query`
**Description:** Execute a browserslist query

**Request Body:**
```json
{
  "query": "last 2 versions",
  "options": {
    "env": "production"
  }
}
```

**Response:**
```json
{
  "browsers": ["chrome 120", "chrome 119", ...],
  "query": "last 2 versions",
  "count": 30
}
```

#### `GET /api/defaults`
**Description:** Get default browserslist configuration

**Response:**
```json
{
  "defaults": "> 0.5%, last 2 versions, Firefox ESR, not dead",
  "description": "Default browserslist configuration"
}
```

#### `POST /api/coverage`
**Description:** Calculate global usage coverage

**Request Body:**
```json
{
  "browsers": ["chrome 90", "firefox 88", "safari 14"]
}
```

**Response:**
```json
{
  "coverage": 68.5
}
```

#### `GET /api/documentation`
**Description:** Get browserslist query syntax documentation

**Response:** Markdown content

**Content-Type:** `text/markdown; charset=utf-8`

#### `GET /api/examples`
**Description:** Get common query examples

**Response:**
```json
[
  {
    "query": "defaults",
    "description": "Browserslist default browsers (recommended starting point)"
  },
  ...
]
```

## Configuration

### wrangler.toml

The worker is configured via `wrangler.toml`:

```toml
name = "browserslist-mcp"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

workers_dev = true

[env.production]
name = "browserslist-mcp-production"
```

### Environment Variables

Add environment variables to `wrangler.toml`:

```toml
[vars]
API_KEY = "development-key"

[env.production.vars]
API_KEY = "production-key"
```

Access in worker code:

```typescript
export interface Env {
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env) {
    console.log(env.API_KEY);
  }
}
```

### Custom Domains

Configure custom domains in `wrangler.toml`:

```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## Development

### Testing Locally

The worker includes comprehensive tests:

```bash
# Run all tests (includes worker tests)
pnpm test

# Run only worker tests
pnpm test worker
```

**Test Coverage:**
- ✅ Route handling
- ✅ Request validation
- ✅ Error handling
- ✅ CORS support
- ✅ Response formatting

### Manual Testing

```bash
# Start local dev server
pnpm worker:dev

# In another terminal
curl http://localhost:8787/health

curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "last 2 versions"}'
```

### Hot Reload

Wrangler automatically reloads on file changes. Just save your files and test again.

## Deployment

### Environments

Deploy to different environments:

```bash
# Deploy to default (development)
pnpm worker:deploy

# Deploy to production
npx wrangler deploy --env production

# Deploy to staging
npx wrangler deploy --env staging
```

### Deployment Checklist

- [ ] Run tests: `pnpm test`
- [ ] Build TypeScript: `pnpm build`
- [ ] Test locally: `pnpm worker:dev`
- [ ] Review changes: `git diff`
- [ ] Deploy: `pnpm worker:deploy`
- [ ] Verify deployment
- [ ] Check logs: `pnpm worker:tail`

## Monitoring

### Real-time Logs

```bash
# Stream logs from production
pnpm worker:tail

# Filter logs
npx wrangler tail --format pretty
```

### Cloudflare Dashboard

Access detailed analytics:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Navigate to Workers & Pages
4. Select `browserslist-mcp`

**Available Metrics:**
- Request volume
- Error rates
- Response times
- CPU usage
- Geographic distribution
- Status code distribution

### Custom Logging

Add logging in your worker:

```typescript
console.log('Request received:', request.url);
console.error('Error occurred:', error);
```

View logs with `pnpm worker:tail`.

## Performance

### Benchmarks

Typical performance metrics:
- **Cold start:** < 10ms
- **Warm request:** < 5ms
- **P50 latency:** < 20ms
- **P99 latency:** < 50ms

### Optimization Tips

1. **Minimize bundle size**
   - Use tree-shaking
   - Avoid large dependencies
   - Check bundle size: `npx wrangler deploy --dry-run`

2. **Cache responses**
   - Use Cloudflare Cache API
   - Set appropriate Cache-Control headers

3. **Optimize queries**
   - Cache common queries
   - Limit response size

## Security

### Built-in Security

- ✅ **Input validation** - Zod schema validation
- ✅ **Error handling** - No stack traces exposed
- ✅ **CORS** - Configurable cross-origin policies
- ✅ **Rate limiting** - Via Cloudflare (configurable)

### Best Practices

1. **Use environment variables for secrets**
   ```toml
   [env.production.vars]
   API_KEY = "your-secret-key"
   ```

2. **Implement authentication**
   ```typescript
   if (request.headers.get('Authorization') !== `Bearer ${env.API_KEY}`) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

3. **Rate limiting**
   - Configure in Cloudflare Dashboard
   - Or implement custom rate limiting with Durable Objects

## Troubleshooting

### Common Issues

**1. Module not found**
```
Error: Cannot find module './utils/browserslist.js'
```
**Solution:** Ensure all imports use `.js` extensions

**2. TypeScript errors**
```
error TS2304: Cannot find name 'ExecutionContext'
```
**Solution:** Install `@cloudflare/workers-types` and add to `tsconfig.json`

**3. Bundle size too large**
```
Error: Worker size exceeds 1MB limit
```
**Solution:** 
- Check imported dependencies
- Use dynamic imports
- Consider splitting into multiple workers

**4. CORS errors**
```
Access to fetch blocked by CORS policy
```
**Solution:** Verify CORS headers are set correctly in worker responses

### Getting Help

- **Wrangler docs:** https://developers.cloudflare.com/workers/wrangler/
- **Workers docs:** https://developers.cloudflare.com/workers/
- **Community:** https://discord.gg/cloudflaredev

## Cost Estimation

### Free Tier
- **100,000 requests/day**
- **10ms CPU time per request**
- Perfect for personal projects and testing

### Paid Plans

**Workers Paid ($5/month):**
- 10 million requests included
- $0.50 per additional million
- No daily limits
- Up to 50ms CPU time

**Example costs:**
- 1M requests/month: $5
- 10M requests/month: $5
- 20M requests/month: $10

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Worker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

## Advanced Usage

### Multiple Workers

Deploy to multiple environments:

```toml
[env.staging]
name = "browserslist-mcp-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
name = "browserslist-mcp-production"
vars = { ENVIRONMENT = "production" }
```

### Workers KV

Add key-value storage:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### Durable Objects

For stateful operations:

```toml
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"
```

## Further Reading

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Examples](https://github.com/cloudflare/workers-sdk/tree/main/templates)
- [Browserslist Documentation](https://github.com/browserslist/browserslist)
