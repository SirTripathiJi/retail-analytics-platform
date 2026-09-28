const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const baseUrl = configuredBaseUrl.replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request failed (${response.status})`);
  }
  return payload;
}

export const productApi = {
  async list() {
    const payload = await request('/products');
    return payload.products;
  },
  async create(product) {
    const payload = await request('/products', { method: 'POST', body: JSON.stringify(product) });
    return payload.product;
  },
  async update(id, product) {
    const payload = await request(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return payload.product;
  },
  async remove(id) {
    await request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const saleApi = {
  async list() {
    const payload = await request('/sales');
    return payload.sales;
  },
  async create(sale) {
    const payload = await request('/sales', { method: 'POST', body: JSON.stringify(sale) });
    return payload.sale;
  },
};
