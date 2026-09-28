import { Router } from 'express';

import { buildSale } from './buildSale.js';

export function createSalesRouter(store) {
  const router = Router();

  router.get('/', async (_request, response, next) => {
    try {
      response.json({ sales: await store.listSales() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      const sale = await store.createSale((operations) => buildSale(request.body, operations));
      response.status(201).json({ sale });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
