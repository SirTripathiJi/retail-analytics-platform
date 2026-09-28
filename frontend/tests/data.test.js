import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { calcInvoice, deriveStatus } from '../src/lib/calc.js';
import { settleSalesDues } from '../src/lib/payments.js';
import { DB } from '../src/services/db.js';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

afterEach(() => values.clear());

test('invoice totals include discount and tax and classify partial payment', () => {
  const invoice = calcInvoice([{ qty: 2, rate: 50, cost: 30 }], 10, 5, 50, 'Cash');

  assert.deepEqual(invoice, {
    subtotal: 100,
    discountAmount: 10,
    taxAmount: 4.5,
    finalTotal: 94.5,
    paidAmount: 50,
    dueAmount: 44.5,
    totalProfit: 30,
    status: 'PARTIAL',
  });
  assert.equal(deriveStatus(0, 94.5, 94.5), 'DUE');
});

test('customer payments settle oldest matching dues and report excess payment', () => {
  const sales = [
    { id: 'INV-1', customerId: 'c1', paid: 10, due: 20 },
    { id: 'INV-2', customerId: 'c1', paid: 0, due: 30 },
    { id: 'INV-3', customerId: 'c2', paid: 0, due: 40 },
  ];
  const result = settleSalesDues(sales, 'c1', 55, 'UPI', '2026-09-27T00:00:00.000Z');

  assert.equal(result.sales[0].due, 0);
  assert.equal(result.sales[0].paid, 30);
  assert.equal(result.sales[0].status, 'PAID');
  assert.equal(result.sales[1].due, 0);
  assert.equal(result.sales[1].paid, 30);
  assert.equal(result.sales[2], sales[2]);
  assert.equal(result.remaining, 5);
});

test('product records survive a DB reload and normalize old field names', () => {
  DB.setProducts('user1', [{ id: 'p1', name: 'Tea', qty: 4, expiry: '2027-01-01', lowStock: 2 }]);

  const loaded = DB.getProducts('user1');
  assert.deepEqual(loaded[0], {
    id: 'p1',
    name: 'Tea',
    qty: 4,
    expiry: '2027-01-01',
    lowStock: 2,
    quantity: 4,
    expiry_date: '2027-01-01',
    low_stock_threshold: 2,
  });

  DB.setProducts(
    'user1',
    loaded.filter((product) => product.id !== 'p1')
  );
  assert.deepEqual(DB.getProducts('user1'), []);
});

test('sales persistence migrates legacy single-item bills on read', () => {
  localStorage.setItem(
    'as_s_user1',
    JSON.stringify([{ id: 'INV-1', pid: 'p1', name: 'Tea', qty: 2, amt: 20, status: 'PAID' }])
  );

  const [sale] = DB.getSales('user1');
  assert.equal(sale.total, 20);
  assert.equal(sale.paid, 20);
  assert.equal(sale.due, 0);
  assert.deepEqual(sale.items[0], {
    id: 'p1',
    pid: 'p1',
    name: 'Tea',
    qty: 2,
    rate: 20,
    cost: 0,
  });
});
