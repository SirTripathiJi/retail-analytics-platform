/**
 * DataContext — Central data store for the entire app.
 * All pages read from this context and call refresh helpers after mutations.
 * This ensures real-time sync across Billing → Inventory, Customers, Transactions.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { calcCustomerStats, round2 } from '../lib/calc';
import { DB } from '../services/db';

import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data for the current user
  const loadAll = useCallback(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    setProducts(DB.getProducts(user.uid));
    setSales(DB.getSales(user.uid));
    setCustomers(DB.getCustomers(user.uid));
    setIsLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshProducts = useCallback(() => {
    if (user?.uid) setProducts(DB.getProducts(user.uid));
  }, [user?.uid]);

  const refreshSales = useCallback(() => {
    if (user?.uid) setSales(DB.getSales(user.uid));
  }, [user?.uid]);

  const refreshCustomers = useCallback(() => {
    if (user?.uid) setCustomers(DB.getCustomers(user.uid));
  }, [user?.uid]);

  const refreshAll = useCallback(() => {
    if (!user?.uid) return;
    setProducts(DB.getProducts(user.uid));
    setSales(DB.getSales(user.uid));
    setCustomers(DB.getCustomers(user.uid));
  }, [user?.uid]);

  /**
   * confirmSale — atomic multi-table write:
   * 1. Deduct stock from products
   * 2. Add invoice to sales
   * 3. Returns the saved invoice
   */
  const confirmSale = useCallback(
    (invoice, cartItems) => {
      if (!user?.uid) return null;

      // 1. Deduct inventory stock
      const updatedProducts = DB.getProducts(user.uid).map((p) => {
        const cartItem = cartItems.find((c) => !c.isCustom && String(c.id) === String(p.id));
        if (cartItem) {
          return { ...p, quantity: Math.max(0, Number(p.quantity) - Number(cartItem.qty)) };
        }
        return p;
      });
      DB.setProducts(user.uid, updatedProducts);
      setProducts(updatedProducts);

      // 2. Add invoice to sales
      const existingSales = DB.getSales(user.uid);
      existingSales.push(invoice);
      DB.setSales(user.uid, existingSales);
      setSales([...existingSales]);

      return invoice;
    },
    [user?.uid]
  );

  /**
   * settleCustomerDues — atomically update matching sales records to reduce due.
   * Works oldest-first, marks each as PAID/PARTIAL when due reaches 0.
   * Returns the remaining unallocated amount (0 if all dues cleared).
   */
  const settleCustomerDues = useCallback(
    (customerId, amountToPay, method) => {
      if (!user?.uid) return 0;
      let amountLeft = round2(Number(amountToPay));

      const allSales = DB.getSales(user.uid);
      const updatedSales = allSales.map((s) => {
        if (String(s.customerId) !== String(customerId)) return s;
        if (!(s.due > 0) || amountLeft <= 0) return s;

        const payment = Math.min(round2(s.due), amountLeft);
        const newDue = round2(s.due - payment);
        const newPaid = round2((Number(s.paid) || 0) + payment);
        amountLeft = round2(amountLeft - payment);

        return {
          ...s,
          due: newDue,
          paid: newPaid,
          status: newDue <= 0 ? 'PAID' : 'PARTIAL',
          paymentMethod: method,
          _settledAt: new Date().toISOString(),
        };
      });

      DB.setSales(user.uid, updatedSales);
      setSales([...updatedSales]);
      return amountLeft; // 0 = fully cleared, >0 = surplus/advance
    },
    [user?.uid]
  );

  /**
   * deleteProduct — remove product and return updated list.
   */
  const deleteProduct = useCallback(
    (productId) => {
      if (!user?.uid) return;
      const updated = DB.getProducts(user.uid).filter((p) => String(p.id) !== String(productId));
      DB.setProducts(user.uid, updated);
      setProducts(updated);
    },
    [user?.uid]
  );

  /**
   * saveProduct — add or update a product.
   */
  const saveProduct = useCallback(
    (productData, editId = null) => {
      if (!user?.uid) return;
      let updated = DB.getProducts(user.uid);
      if (editId) {
        updated = updated.map((p) =>
          String(p.id) === String(editId) ? { ...p, ...productData } : p
        );
      } else {
        updated.push({ ...productData, id: String(Date.now()) });
      }
      DB.setProducts(user.uid, updated);
      setProducts(updated);
    },
    [user?.uid]
  );

  /**
   * saveCustomer — add or update a customer.
   */
  const saveCustomer = useCallback(
    (customerData, editId = null) => {
      if (!user?.uid) return;
      let updated = DB.getCustomers(user.uid);
      if (editId) {
        updated = updated.map((c) =>
          String(c.id) === String(editId) ? { ...c, ...customerData } : c
        );
      } else {
        updated.push({ ...customerData, id: String(Date.now()) });
      }
      DB.setCustomers(user.uid, updated);
      setCustomers([...updated]);
    },
    [user?.uid]
  );

  /**
   * deleteCustomer — remove customer record.
   */
  const deleteCustomer = useCallback(
    (customerId) => {
      if (!user?.uid) return;
      const updated = DB.getCustomers(user.uid).filter((c) => String(c.id) !== String(customerId));
      DB.setCustomers(user.uid, updated);
      setCustomers([...updated]);
    },
    [user?.uid]
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
    if (!user?.uid) return;
    DB.setProducts(user.uid, []);
    DB.setSales(user.uid, []);
    DB.setCustomers(user.uid, []);
    setProducts([]);
    setSales([]);
    setCustomers([]);
  }, [user?.uid]);

  const value = {
    products,
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
