import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { createApp } from '../src/app.js';

let server;
let baseUrl;

beforeEach(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  if (server)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

const validProduct = {
  name: 'Tea',
  category: 'Grocery',
  cost: 30,
  sell: 45,
  quantity: 12,
  low_stock_threshold: 5,
  expiry_date: '2027-01-01',
};

test('health route returns a JSON success status', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('product CRUD creates, reads, updates, lists, and deletes records', async () => {
  const created = await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validProduct),
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.product.name, 'Tea');
  assert.ok(created.body.product.id);

  const id = created.body.product.id;
  const read = await request(`/api/products/${id}`);
  assert.equal(read.body.product.quantity, 12);

  const updated = await request(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...validProduct, quantity: 8 }),
  });
  assert.equal(updated.body.product.quantity, 8);

  const listed = await request('/api/products');
  assert.equal(listed.body.products.length, 1);

  const removed = await request(`/api/products/${id}`, { method: 'DELETE' });
  assert.equal(removed.response.status, 204);
  assert.equal((await request('/api/products')).body.products.length, 0);
});

test('product validation rejects bad numbers and invalid dates', async () => {
  for (const invalid of [
    { ...validProduct, sell: 0 },
    { ...validProduct, quantity: -1 },
    { ...validProduct, cost: 'not a number' },
    { ...validProduct, expiry_date: '2027-02-30' },
  ]) {
    const { response, body } = await request('/api/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(invalid),
    });
    assert.equal(response.status, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  }
  assert.equal((await request('/api/products')).body.products.length, 0);
});

test('duplicate product names and missing IDs return consistent errors', async () => {
  await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validProduct),
  });
  const duplicate = await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...validProduct, name: ' tea ' }),
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.error.code, 'DUPLICATE_PRODUCT');

  const missing = await request('/api/products/not-a-real-id');
  assert.equal(missing.response.status, 404);
  assert.equal(missing.body.error.code, 'PRODUCT_NOT_FOUND');
});

test('sales recalculate totals, save price/cost snapshots, and deduct stock', async () => {
  const product = await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validProduct),
  });

  const created = await request('/api/sales', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: product.body.product.id, qty: 2, rate: 45 }],
      discountPercent: 10,
      taxPercent: 5,
      paid: 10,
      paymentMethod: 'Cash',
      customerId: 'customer-1',
      customerName: 'Asha Shop',
    }),
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.sale.subtotal, 90);
  assert.equal(created.body.sale.discount, 9);
  assert.equal(created.body.sale.tax, 4.05);
  assert.equal(created.body.sale.total, 85.05);
  assert.equal(created.body.sale.due, 75.05);
  assert.equal(created.body.sale.status, 'PARTIAL');
  assert.equal(created.body.sale.profit, 21);
  assert.equal(created.body.sale.items[0].cost, 30);

  const updatedProduct = await request(`/api/products/${product.body.product.id}`);
  assert.equal(updatedProduct.body.product.quantity, 10);
  assert.equal((await request('/api/sales')).body.sales.length, 1);
});

test('sales reject overpayment and insufficient stock without changing stock or history', async () => {
  const product = await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...validProduct, name: 'Rice', quantity: 1 }),
  });
  const saleRequest = {
    items: [{ id: product.body.product.id, qty: 1, rate: 45 }],
    paymentMethod: 'Cash',
  };

  const overpaid = await request('/api/sales', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...saleRequest, paid: 100 }),
  });
  assert.equal(overpaid.response.status, 400);
  assert.equal(overpaid.body.error.code, 'VALIDATION_ERROR');

  const insufficient = await request('/api/sales', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...saleRequest, items: [{ ...saleRequest.items[0], qty: 2 }] }),
  });
  assert.equal(insufficient.response.status, 409);
  assert.equal(insufficient.body.error.code, 'INSUFFICIENT_STOCK');
  assert.equal(
    (await request(`/api/products/${product.body.product.id}`)).body.product.quantity,
    1
  );
  assert.equal((await request('/api/sales')).body.sales.length, 0);
});

test('concurrent sales cannot oversell the same final unit in memory mode', async () => {
  const product = await request('/api/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...validProduct, name: 'Coffee', quantity: 1 }),
  });
  const saleRequest = {
    items: [{ id: product.body.product.id, qty: 1, rate: 45 }],
    paymentMethod: 'Cash',
  };
  const makeSale = () =>
    request('/api/sales', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(saleRequest),
    });

  const results = await Promise.all([makeSale(), makeSale()]);
  assert.deepEqual(results.map(({ response }) => response.status).sort(), [201, 409]);
  assert.equal(
    (await request(`/api/products/${product.body.product.id}`)).body.product.quantity,
    0
  );
  assert.equal((await request('/api/sales')).body.sales.length, 1);
});
