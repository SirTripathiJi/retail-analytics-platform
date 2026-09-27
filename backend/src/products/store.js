import { randomUUID } from 'node:crypto';

export function createProductStore() {
  const products = new Map();
  const sales = [];
  let pendingSale = Promise.resolve();

  return {
    list() {
      return [...products.values()].map((product) => ({ ...product }));
    },
    get(id) {
      const product = products.get(id);
      return product ? { ...product } : null;
    },
    create(product) {
      const duplicate = [...products.values()].some(
        (existing) => existing.name.toLowerCase() === product.name.toLowerCase()
      );
      if (duplicate) {
        const error = new Error('A product with this name already exists');
        error.status = 409;
        error.code = 'DUPLICATE_PRODUCT';
        throw error;
      }

      const saved = { ...product, id: randomUUID() };
      products.set(saved.id, saved);
      return { ...saved };
    },
    update(id, product) {
      if (!products.has(id)) return null;
      const duplicate = [...products.values()].some(
        (existing) =>
          existing.id !== id && existing.name.toLowerCase() === product.name.toLowerCase()
      );
      if (duplicate) {
        const error = new Error('A product with this name already exists');
        error.status = 409;
        error.code = 'DUPLICATE_PRODUCT';
        throw error;
      }

      const saved = { ...product, id };
      products.set(id, saved);
      return { ...saved };
    },
    remove(id) {
      return products.delete(id);
    },
    listSales() {
      return sales.map((sale) => ({ ...sale, items: sale.items.map((item) => ({ ...item })) }));
    },
    createSale(buildSale) {
      const operation = pendingSale.then(async () => {
        const stockChanges = new Map();
        const quantitiesAtRead = new Map();
        const sale = await buildSale({
          getProduct: async (id) => {
            const product = products.get(id);
            if (product) quantitiesAtRead.set(id, Number(product.quantity));
            return product ? { ...product } : null;
          },
          setQuantity: async (id, quantity) => stockChanges.set(id, quantity),
        });

        for (const [id, quantity] of stockChanges) {
          const product = products.get(id);
          if (!product || Number(product.quantity) !== quantitiesAtRead.get(id)) {
            const error = new Error('Stock changed while this bill was being saved; try again');
            error.status = 409;
            error.code = 'INSUFFICIENT_STOCK';
            throw error;
          }
          products.set(id, { ...product, quantity });
        }
        sales.push(sale);
        return sale;
      });
      pendingSale = operation.then(
        () => undefined,
        () => undefined
      );
      return operation;
    },
  };
}
