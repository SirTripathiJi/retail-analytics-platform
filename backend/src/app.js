import express from 'express';

import { createProductsRouter } from './products/router.js';
import { createProductStore } from './products/store.js';
import { createSalesRouter } from './sales/router.js';

export function createApp({ productStore = createProductStore() } = {}) {
  const app = express();
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  app.use((request, response, next) => {
    const origin = request.get('origin');
    if (origin === allowedOrigin) {
      response.set('Access-Control-Allow-Origin', allowedOrigin);
      response.set('Vary', 'Origin');
      response.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (request.method === 'OPTIONS') return response.status(204).end();
    return next();
  });

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/products', createProductsRouter(productStore));
  app.use('/api/sales', createSalesRouter(productStore));

  app.use((_request, _response, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    next(error);
  });

  app.use((error, _request, response, _next) => {
    const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
    const code = error.code || (status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR');
    const message = status === 500 ? 'An unexpected server error occurred' : error.message;
    response.status(status).json({ error: { code, message } });
  });

  return app;
}
