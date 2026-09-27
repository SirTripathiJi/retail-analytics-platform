/**
 * DataContext — Central data store for the entire app.
 * All pages read from this context and call refresh helpers after mutations.
 * This ensures real-time sync across Billing → Inventory, Customers, Transactions.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { calcCustomerStats } from '../lib/calc';
import { settleSalesDues } from '../lib/payments';
import { productApi, saleApi } from '../services/api';
import { DB } from '../services/db';

import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.uid;

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  // Load all data for the current user
  const loadAll = useCallback(async () => {
    if (!userId) {
      setProducts([]);
      setSales([]);
      setCustomers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setProductsError('');
    const localSales = DB.getSales(userId);
    setSales(localSales);
    setCustomers(DB.getCustomers(userId));
    try {
      setProducts(await productApi.list());
    } catch (error) {
      setProducts([]);
      setProductsError(error.message || 'Could not load inventory');
    } finally {
      setIsLoading(false);
    }
    try {
      const remoteSales = await saleApi.list();
      const localIds = new Set(localSales.map((sale) => String(sale.id)));
      setSales([...localSales, ...remoteSales.filter((sale) => !localIds.has(String(sale.id)))]);
    } catch {
      // Keep previously saved local transaction history available offline.
    }
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshProducts = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setProductsError('');
    try {
      setProducts(await productApi.list());
    } catch (error) {
      setProductsError(error.message || 'Could not load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshSales = useCallback(() => {
    if (userId) setSales(DB.getSales(userId));
  }, [userId]);

  const refreshCustomers = useCallback(() => {
    if (userId) setCustomers(DB.getCustomers(userId));
  }, [userId]);

  const refreshAll = useCallback(() => loadAll(), [loadAll]);

  /** Create a validated server-side sale, then refresh shared UI state. */
  const confirmSale = useCallback(
    async (invoice, cartItems) => {
      if (!userId) throw new Error('Sign in before creating a sale');
      const savedSale = await saleApi.create({ ...invoice, items: cartItems });
      const existingSales = DB.getSales(userId);
      const updatedSales = [
        ...existingSales.filter((sale) => String(sale.id) !== String(savedSale.id)),
        savedSale,
      ];
      DB.setSales(userId, updatedSales);
      setSales((current) => [
        ...current.filter((sale) => String(sale.id) !== String(savedSale.id)),
        savedSale,
      ]);
      await refreshProducts();
      return savedSale;
    },
    [userId, refreshProducts]
  );

  /**
   * settleCustomerDues — atomically update matching sales records to reduce due.
   * Works oldest-first, marks each as PAID/PARTIAL when due reaches 0.
   * Returns the remaining unallocated amount (0 if all dues cleared).
   */
  const settleCustomerDues = useCallback(
    (customerId, amountToPay, method) => {
      if (!userId) return 0;
      const allSales = DB.getSales(userId);
      const { sales: updatedSales, remaining } = settleSalesDues(
        allSales,
        customerId,
        amountToPay,
        method,
        new Date().toISOString()
      );

      DB.setSales(userId, updatedSales);
      setSales([...updatedSales]);
      return remaining; // 0 = fully cleared, >0 = surplus/advance
    },
    [userId]
  );

  /**
   * deleteProduct — remove product and return updated list.
   */
  const deleteProduct = useCallback(async (productId) => {
    await productApi.remove(productId);
    setProducts((current) => current.filter((product) => String(product.id) !== String(productId)));
  }, []);

  /**
   * saveProduct — add or update a product.
   */
  const saveProduct = useCallback(async (productData, editId = null) => {
    const saved = editId
      ? await productApi.update(editId, productData)
      : await productApi.create(productData);
    setProducts((current) =>
      editId
        ? current.map((product) => (String(product.id) === String(editId) ? saved : product))
        : [...current, saved]
    );
    setProductsError('');
    return saved;
  }, []);

  /**
   * saveCustomer — add or update a customer.
   */
  const saveCustomer = useCallback(
    (customerData, editId = null) => {
      if (!userId) return;
      let updated = DB.getCustomers(userId);
      if (editId) {
        updated = updated.map((c) =>
          String(c.id) === String(editId) ? { ...c, ...customerData } : c
        );
      } else {
        updated.push({ ...customerData, id: String(Date.now()) });
      }
      DB.setCustomers(userId, updated);
      setCustomers([...updated]);
    },
    [userId]
  );

  /**
   * deleteCustomer — remove customer record.
   */
  const deleteCustomer = useCallback(
    (customerId) => {
      if (!userId) return;
      const updated = DB.getCustomers(userId).filter((c) => String(c.id) !== String(customerId));
      DB.setCustomers(userId, updated);
      setCustomers([...updated]);
    },
    [userId]
  );

  /**
   * getCustomerStats — derived stats from in-memory sales (no DB re-fetch).
   */
  const getCustomerStats = useCallback(
    (customerId) => {
      const customerSales = sales.filter((s) => String(s.customerId) === String(customerId));
      return calcCustomerStats(customerSales);
    },
    [sales]
  );

  /**
   * resetAllData — wipe products and sales for the current user.
   */
  const resetAllData = useCallback(() => {
    if (!userId) return;
    DB.setProducts(userId, []);
    DB.setSales(userId, []);
    DB.setCustomers(userId, []);
    setProducts([]);
    setSales([]);
    setCustomers([]);
  }, [userId]);

  const value = {
    products,
    productsError,
    sales,
    customers,
    isLoading,
    refreshAll,
    refreshProducts,
    refreshSales,
    refreshCustomers,
    confirmSale,
    settleCustomerDues,
    deleteProduct,
    saveProduct,
    saveCustomer,
    deleteCustomer,
    getCustomerStats,
    resetAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
};
