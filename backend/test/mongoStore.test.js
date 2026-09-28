import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createMongoProductStore } from '../src/products/mongoStore.js';
import { buildSale } from '../src/sales/buildSale.js';

function createFakeCollection() {
  const documents = new Map();
  return {
    async createIndex() {},
    find() {
      return {
        sort() {
          return this;
        },
        async toArray() {
          return [...documents.values()].map((document) => ({ ...document }));
        },
      };
    },
    async findOne(filter) {
      const document = documents.get(filter._id);
      return document ? { ...document } : null;
    },
    async insertOne(document) {
      if ([...documents.values()].some((existing) => existing.nameKey === document.nameKey)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
      }
      documents.set(document._id, { ...document });
    },
    async updateOne(filter, update) {
      const document = documents.get(filter._id);
      if (!document) return { matchedCount: 0 };
      if (filter.quantity?.$gte !== undefined && document.quantity < filter.quantity.$gte) {
        return { matchedCount: 0 };
      }
      if (update.$set) Object.assign(document, update.$set);
      if (update.$inc) {
        for (const [key, value] of Object.entries(update.$inc)) document[key] += value;
      }
      return { matchedCount: 1 };
    },
    async deleteOne(filter) {
      return { deletedCount: documents.delete(filter._id) ? 1 : 0 };
    },
    documents,
  };
}

function createFakeClient(transactionError = null) {
  return {
    startSession() {
      return {
        async withTransaction(callback) {
          if (transactionError) throw transactionError;
          return callback();
        },
        async endSession() {},
      };
    },
  };
}

test('Mongo adapter uses product collections and the transaction session for a sale', async () => {
  const products = createFakeCollection();
  const sales = createFakeCollection();
  const store = createMongoProductStore(products, sales, createFakeClient());
  await store.ensureIndexes();
  const product = await store.create({
    name: 'Tea',
    category: 'Grocery',
    cost: 5,
    sell: 10,
    quantity: 5,
    low_stock_threshold: 2,
    expiry_date: '',
  });

  const createdSale = await store.createSale((operations) =>
    buildSale({ items: [{ id: product.id, qty: 2, rate: 10 }], paymentMethod: 'Cash' }, operations)
  );

  assert.equal(createdSale.items[0].cost, 5);
  assert.equal((await store.get(product.id)).quantity, 3);
  assert.equal((await store.listSales()).length, 1);
});

test('Mongo adapter fails sales closed when deployment does not support transactions', async () => {
  const transactionError = new Error(
    'Transaction numbers are only allowed on a replica set member'
  );
  transactionError.code = 20;
  const store = createMongoProductStore(
    createFakeCollection(),
    createFakeCollection(),
    createFakeClient(transactionError)
  );

  await assert.rejects(
    () => store.createSale(async () => ({ id: 'invoice' })),
    (error) => error.status === 503 && error.code === 'TRANSACTIONS_REQUIRED'
  );
});
