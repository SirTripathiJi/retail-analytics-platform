import { deriveStatus, round2 } from '../lib/calc';

export const DB = {
  getUsers: () => {
    try {
      return JSON.parse(localStorage.getItem('as_users') || '[]');
    } catch {
      return [];
    }
  },
  setUsers: (u) => {
    try {
      localStorage.setItem('as_users', JSON.stringify(u));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },
  getSession: () => {
    try {
      return JSON.parse(localStorage.getItem('as_session') || 'null');
    } catch {
      return null;
    }
  },
  setSession: (s) => {
    try {
      localStorage.setItem('as_session', JSON.stringify(s));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },
  clearSession: () => {
    try {
      localStorage.removeItem('as_session');
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },

  getProducts: (uid) => {
    try {
      const raw = JSON.parse(localStorage.getItem(`as_p_${uid}`) || '[]');
      return raw.map((p) => ({
        ...p,
        quantity: p.quantity !== undefined ? p.quantity : p.qty !== undefined ? p.qty : 0,
        expiry_date: p.expiry_date !== undefined ? p.expiry_date : p.expiry || '',
        low_stock_threshold:
          p.low_stock_threshold !== undefined ? p.low_stock_threshold : p.lowStock || 5,
      }));
    } catch {
      return [];
    }
  },
  setProducts: (uid, p) => {
    try {
      localStorage.setItem(`as_p_${uid}`, JSON.stringify(p));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },

  /**
   * getSales — migrates legacy single-item records on read.
   * Legacy: { id, pid, name, qty, amt, profit, date }
   * New:    { id, items[], total, paid, due, status, ... }
   */
  getSales: (uid) => {
    try {
      const raw = JSON.parse(localStorage.getItem(`as_s_${uid}`) || '[]');
      return raw.map((s) => {
        // Migrate legacy records that lack the `items` array
        if (!Array.isArray(s.items)) {
          s.items = s.pid
            ? [
                {
                  id: String(s.pid),
                  pid: String(s.pid),
                  name: s.name || 'Unknown Item',
                  qty: Number(s.qty) || 1,
                  rate: Number(s.sell || s.rate || s.amt) || 0,
                  cost: Number(s.cost) || 0,
                },
              ]
            : [];
        }
        // Ensure monetary fields exist and are numbers
        const total = Number(s.total || s.amt) || 0;
        const paid = Number(s.paid) || (s.status === 'PAID' ? total : 0);
        const due = round2(Math.max(0, Number(s.due !== undefined ? s.due : total - paid)));
        const status = deriveStatus(paid, due, total);

        return { ...s, total, paid, due, status };
      });
    } catch {
      return [];
    }
  },
  setSales: (uid, s) => {
    try {
      localStorage.setItem(`as_s_${uid}`, JSON.stringify(s));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },

  /**
   * updateSale — atomically patch a single sale record by id.
   */
  updateSale: (uid, id, patch) => {
    const sales = DB.getSales(uid);
    const idx = sales.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) return false;
    sales[idx] = { ...sales[idx], ...patch, _updatedAt: new Date().toISOString() };
    DB.setSales(uid, sales);
    return true;
  },

  /**
   * getNextInvoiceId — reads all sales and returns the next sequential INV-XXXXX id.
   */
  getNextInvoiceId: (uid) => {
    const sales = JSON.parse(localStorage.getItem(`as_s_${uid}`) || '[]');
    let maxNum = 10000;
    sales.forEach((s) => {
      if (s.id && String(s.id).startsWith('INV-')) {
        const n = parseInt(String(s.id).split('-')[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    return `INV-${maxNum + 1}`;
  },

  getCustomers: (uid) => {
    try {
      return JSON.parse(localStorage.getItem(`as_c_${uid}`) || '[]');
    } catch {
      return [];
    }
  },
  setCustomers: (uid, c) => {
    try {
      localStorage.setItem(`as_c_${uid}`, JSON.stringify(c));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  },

  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
};
