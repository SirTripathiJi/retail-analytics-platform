/**
 * Canonical calculation library — single source of truth for all POS math.
 * All monetary values rounded to 2 decimal places.
 */

/** Format a number as Indian Rupee string */
export const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** Round to 2 decimal places */
export { calcItemProfit, round2 };

/** Calc margin percent: (sell - cost) / cost * 100 */
export const calcMargin = (cost, sell) => {
  const c = Number(cost) || 0;
  const s = Number(sell) || 0;
  if (c <= 0) return 0;
  return round2(((s - c) / c) * 100);
};

/**
 * Derive the canonical status of a transaction from its stored paid/due/total.
 * Handles legacy records that may have stale status fields.
 */
export const deriveStatus = (paid, due) => {
  const d = Number(due) || 0;
  const p = Number(paid) || 0;
  if (d <= 0) return 'PAID';
  if (p <= 0 || p === 0) return 'DUE';
  return 'PARTIAL';
};

/**
 * Aggregate customer stats from their sales records.
 * @param {Array} salesForCustomer - filtered sales array
 */
export const calcCustomerStats = (salesForCustomer = []) => {
  const lifetimeValue = round2(
    salesForCustomer.reduce((a, s) => a + (Number(s.total) || Number(s.amt) || 0), 0)
  );
  const totalDue = round2(
    salesForCustomer.reduce((a, s) => a + Math.max(0, Number(s.due) || 0), 0)
  );
  const totalPaid = round2(salesForCustomer.reduce((a, s) => a + (Number(s.paid) || 0), 0));
  const txnCount = salesForCustomer.length;
  const lastVisit =
    salesForCustomer.length > 0
      ? salesForCustomer.reduce((latest, s) => (s.date > latest ? s.date : latest), '')
      : null;

  const isRisky = totalDue > 500 || (txnCount > 0 && totalDue / lifetimeValue > 0.3);

  return { lifetimeValue, totalDue, totalPaid, txnCount, lastVisit, isRisky };
};
import { calcItemProfit, round2 } from '../../../shared/invoice.js';

export { calcInvoice } from '../../../shared/invoice.js';
