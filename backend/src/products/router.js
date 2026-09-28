import { Router } from 'express';

const productFields = [
  'name',
  'category',
  'cost',
  'sell',
  'quantity',
  'low_stock_threshold',
  'expiry_date',
];

function validateProduct(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    const error = new Error('Request body must be a product object');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) {
    const error = new Error('Product name is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  for (const field of Object.keys(input)) {
    if (!productFields.includes(field) && field !== 'id') {
      const error = new Error(`Unknown product field: ${field}`);
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
  }

  const readNumber = (field, label, { min = 0, defaultValue } = {}) => {
    const raw = input[field] === undefined ? defaultValue : input[field];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min) {
      const error = new Error(`${label} must be a number greater than or equal to ${min}`);
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    return value;
  };

  const category = input.category === undefined ? 'General' : input.category;
  if (typeof category !== 'string') {
    const error = new Error('Category must be text');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const expiryDate = input.expiry_date === undefined ? '' : input.expiry_date;
  let validExpiryDate = typeof expiryDate === 'string';
  if (validExpiryDate && expiryDate !== '') {
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
      ? new Date(`${expiryDate}T00:00:00.000Z`)
      : null;
    validExpiryDate =
      parsedDate !== null &&
      Number.isFinite(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === expiryDate;
  }
  if (!validExpiryDate) {
    const error = new Error('Expiry date must be a valid YYYY-MM-DD date');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  return {
    name,
    category: category.trim() || 'General',
    cost: readNumber('cost', 'Cost price'),
    sell: readNumber('sell', 'Selling price', { min: Number.MIN_VALUE }),
    quantity: readNumber('quantity', 'Quantity', { defaultValue: 0 }),
    low_stock_threshold: readNumber('low_stock_threshold', 'Low-stock threshold', {
      defaultValue: 5,
    }),
    expiry_date: expiryDate,
  };
}

export function createProductsRouter(store) {
  const router = Router();

  router.get('/', async (_request, response, next) => {
    try {
      response.json({ products: await store.list() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      const product = await store.create(validateProduct(request.body));
      response.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (request, response, next) => {
    try {
      const product = await store.get(request.params.id);
      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        return next(error);
      }
      return response.json({ product });
    } catch (error) {
      return next(error);
    }
  });

  router.put('/:id', async (request, response, next) => {
    try {
      const product = await store.update(request.params.id, validateProduct(request.body));
      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        return next(error);
      }
      return response.json({ product });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', async (request, response, next) => {
    try {
      if (!(await store.remove(request.params.id))) {
        const error = new Error('Product not found');
        error.status = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        return next(error);
      }
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
