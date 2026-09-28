import { randomUUID } from 'node:crypto';

import { calcInvoice } from '../../../shared/invoice.js';

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  return error;
}

function badStock(message) {
  const error = new Error(message);
  error.status = 409;
  error.code = 'INSUFFICIENT_STOCK';
  return error;
}

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw invalid(`${label} must be a valid number`);
  return number;
}

export async function buildSale(input, { getProduct, setQuantity }) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw invalid('Request body must be a sale object');
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw invalid('A sale must contain at least one item');
  }
  const methods = ['Cash', 'UPI', 'Card', 'Udhaar'];
  if (!methods.includes(input.paymentMethod)) throw invalid('Payment method is not supported');

  const discountPercent = finiteNumber(input.discountPercent ?? 0, 'Discount');
  const taxPercent = finiteNumber(input.taxPercent ?? 0, 'Tax');
  if (discountPercent < 0 || discountPercent > 100) {
    throw invalid('Discount must be between 0 and 100 percent');
  }
  if (taxPercent < 0 || taxPercent > 100) {
    throw invalid('Tax must be between 0 and 100 percent');
  }

  const productQuantities = new Map();
  const inventoryProducts = new Map();
  const items = [];

  for (const line of input.items) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) {
      throw invalid('Each sale item must be an object');
    }
    const quantity = finiteNumber(line?.qty, 'Item quantity');
    const rate = finiteNumber(line?.rate, 'Item price');
    if (quantity <= 0) throw invalid('Item quantity must be greater than zero');
    if (rate <= 0) throw invalid('Item price must be greater than zero');

    if (line.isCustom === true) {
      const name = typeof line.name === 'string' ? line.name.trim() : '';
      if (!name) throw invalid('Custom item name is required');
      items.push({
        id: String(line.id || `custom-${randomUUID()}`),
        name,
        qty: quantity,
        rate,
        cost: 0,
        isCustom: true,
      });
      continue;
    }

    const id = String(line.id || line.pid || '');
    if (!id) throw invalid('Inventory item ID is required');
    const currentQuantity = productQuantities.get(id) || 0;
    productQuantities.set(id, currentQuantity + quantity);
    if (!inventoryProducts.has(id)) {
      const product = await getProduct(id);
      if (!product) {
        const error = new Error('A product in this bill no longer exists');
        error.status = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }
      inventoryProducts.set(id, product);
    }
    const product = inventoryProducts.get(id);
    const today = new Date().toISOString().slice(0, 10);
    if (product.expiry_date && product.expiry_date < today) {
      throw badStock(`${product.name} is expired`);
    }
    items.push({
      id,
      name: product.name,
      qty: quantity,
      rate,
      cost: finiteNumber(product.cost, 'Stored product cost'),
      isCustom: false,
    });
  }

  for (const [id, quantity] of productQuantities) {
    const product = inventoryProducts.get(id);
    if (quantity > Number(product.quantity))
      throw badStock(`Insufficient stock for ${product.name}`);
  }

  const paidInput =
    input.paid === undefined || input.paid === '' ? '' : finiteNumber(input.paid, 'Paid amount');
  const calculated = calcInvoice(
    items,
    discountPercent,
    taxPercent,
    paidInput,
    input.paymentMethod
  );
  if (calculated.paidAmount < 0 || calculated.paidAmount > calculated.finalTotal) {
    throw invalid('Paid amount must be between zero and the bill total');
  }

  const customerId = input.customerId ? String(input.customerId) : null;
  const customerName = typeof input.customerName === 'string' ? input.customerName.trim() : '';
  if (
    (calculated.dueAmount > 0 || input.paymentMethod === 'Udhaar') &&
    (!customerId || !customerName)
  ) {
    throw invalid('Select a customer when a bill has an outstanding balance');
  }

  const now = new Date().toISOString();
  const sale = {
    id: `INV-${Date.now()}-${randomUUID().slice(0, 8)}`,
    date: now,
    customerId,
    customerName: customerName || 'Walk-in',
    customerPhone: typeof input.customerPhone === 'string' ? input.customerPhone : '',
    items,
    subtotal: calculated.subtotal,
    discount: calculated.discountAmount,
    discountPercent,
    tax: calculated.taxAmount,
    taxPercent,
    total: calculated.finalTotal,
    paid: calculated.paidAmount,
    due: calculated.dueAmount,
    paymentMethod: input.paymentMethod,
    status: calculated.status,
    profit: calculated.totalProfit,
    notes: typeof input.notes === 'string' ? input.notes.trim() : '',
    _createdAt: now,
  };

  for (const [id, quantity] of productQuantities) {
    const currentQuantity = Number(inventoryProducts.get(id).quantity);
    await setQuantity(id, currentQuantity - quantity);
  }

  return sale;
}
