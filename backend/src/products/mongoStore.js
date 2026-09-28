import { randomUUID } from 'node:crypto';

function duplicateNameError(error) {
  if (error?.code !== 11000) return error;
  const duplicate = new Error('A product with this name already exists');
  duplicate.status = 409;
  duplicate.code = 'DUPLICATE_PRODUCT';
  return duplicate;
}

function toProduct(document) {
  if (!document) return null;
  const { _id, nameKey: _nameKey, ...fields } = document;
  return { ...fields, id: String(_id) };
}

export function createMongoProductStore(collection, salesCollection, client) {
  return {
    async ensureIndexes() {
      await collection.createIndex({ nameKey: 1 }, { unique: true });
      await salesCollection.createIndex({ id: 1 }, { unique: true });
    },
    async list() {
      const products = await collection.find({}).toArray();
      return products.map(toProduct);
    },
    async get(id) {
      return toProduct(await collection.findOne({ _id: id }));
    },
    async create(product) {
      const document = { _id: randomUUID(), ...product, nameKey: product.name.toLowerCase() };
      try {
        await collection.insertOne(document);
      } catch (error) {
        throw duplicateNameError(error);
      }
      return toProduct(document);
    },
    async update(id, product) {
      try {
        const result = await collection.updateOne(
          { _id: id },
          { $set: { ...product, nameKey: product.name.toLowerCase() } }
        );
        if (result.matchedCount === 0) return null;
        return toProduct(await collection.findOne({ _id: id }));
      } catch (error) {
        throw duplicateNameError(error);
      }
    },
    async remove(id) {
      const result = await collection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
    async listSales() {
      return salesCollection.find({}).sort({ date: -1 }).toArray();
    },
    async createSale(buildSale) {
      const session = client.startSession();
      try {
        return await session.withTransaction(async () => {
          const quantities = new Map();
          const sale = await buildSale({
            getProduct: async (id) => {
              const product = toProduct(await collection.findOne({ _id: id }, { session }));
              if (product) quantities.set(id, Number(product.quantity));
              return product;
            },
            setQuantity: async (id, newQuantity) => {
              const currentQuantity = quantities.get(id);
              const soldQuantity = currentQuantity - newQuantity;
              const result = await collection.updateOne(
                { _id: id, quantity: { $gte: soldQuantity } },
                { $inc: { quantity: -soldQuantity } },
                { session }
              );
              if (result.matchedCount === 0) {
                const error = new Error('Stock changed while this bill was being saved; try again');
                error.status = 409;
                error.code = 'INSUFFICIENT_STOCK';
                throw error;
              }
            },
          });
          await salesCollection.insertOne(sale, { session });
          return sale;
        });
      } catch (error) {
        if (error.code === 20 || /Transaction numbers are only allowed/i.test(error.message)) {
          const unsupported = new Error(
            'Sales require a MongoDB replica set or sharded cluster to protect stock updates'
          );
          unsupported.status = 503;
          unsupported.code = 'TRANSACTIONS_REQUIRED';
          throw unsupported;
        }
        throw error;
      } finally {
        await session.endSession();
      }
    },
  };
}
