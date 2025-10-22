import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { executeBrowserslistQuery, getBrowserslistCoverage, getBrowserslistDefaults } from '../utils/browserslist.js';
import { BrowserslistQuerySchema } from '../types/index.js';
import { BROWSERSLIST_DOCUMENTATION, BROWSERSLIST_EXAMPLES } from '../resources/documentation.js';

/**
 * Create Koa application for HTTP-based browserslist service
 */
export function createKoaApp() {
  const app = new Koa();
  const router = new Router();

  // Body parser middleware
  app.use(bodyParser());

  // Error handling middleware
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      const error = err as Error;
      ctx.status = 400;
      ctx.body = {
        error: error.message || 'Internal server error',
      };
    }
  });

  // Health check endpoint
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', service: 'browserslist-mcp' };
  });

  // Query browsers endpoint
  router.post('/api/query', async (ctx) => {
    const input = BrowserslistQuerySchema.parse(ctx.request.body);
    const result = executeBrowserslistQuery(input);
    ctx.body = result;
  });

  // Get defaults endpoint
  router.get('/api/defaults', (ctx) => {
    const defaults = getBrowserslistDefaults();
    ctx.body = { defaults };
  });

  // Get coverage endpoint
  router.post('/api/coverage', async (ctx) => {
    const { browsers } = ctx.request.body as { browsers: string[] };
    if (!Array.isArray(browsers)) {
      ctx.throw(400, 'browsers must be an array');
    }
    const coverage = getBrowserslistCoverage(browsers);
    ctx.body = coverage;
  });

  // Documentation endpoint
  router.get('/api/documentation', (ctx) => {
    ctx.type = 'text/markdown';
    ctx.body = BROWSERSLIST_DOCUMENTATION;
  });

  // Examples endpoint
  router.get('/api/examples', (ctx) => {
    ctx.body = BROWSERSLIST_EXAMPLES;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

/**
 * Start the Koa server
 */
export function startKoaServer(port = 3000) {
  const app = createKoaApp();
  
  app.listen(port, () => {
    console.log(`Browserslist HTTP server listening on port ${port}`);
  });
}
