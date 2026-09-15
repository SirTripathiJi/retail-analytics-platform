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
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Calc margin percent: (sell - cost) / cost * 100 */
export const calcMargin = (cost, sell) => {
  const c = Number(cost) || 0;
  const s = Number(sell) || 0;
  if (c <= 0) return 0;
  return round2(((s - c) / c) * 100);
};

/** Calc gross profit per item: (sell - cost) * qty */
export const calcItemProfit = (cost, sell, qty) =>
  round2((Number(sell) - Number(cost)) * Number(qty));

/**
 * Full invoice calculation — use everywhere billing math is needed.
 * @param {Array}  cart          - [{qty, rate, cost, isCustom}]
 * @param {number} discountPct   - 0–100
 * @param {number} taxPct        - 0–100
 * @param {number|string} paidAmt - amount entered by cashier
 * @param {string} method        - Cash | UPI | Card | Udhaar
 * @returns {Object}             - all derived values, all rounded to 2dp
 */
export const calcInvoice = (
  cart = [],
  discountPct = 0,
  taxPct = 0,
  paidAmt = '',
  method = 'Cash'
) => {
  const subtotal = round2(
    cart.reduce((acc, item) => acc + round2((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0)
  );
  const discountAmount = round2(subtotal * (Number(discountPct) / 100));
  const afterDiscount = round2(subtotal - discountAmount);
  const taxAmount = round2(afterDiscount * (Number(taxPct) / 100));
  const finalTotal = round2(afterDiscount + taxAmount);
  const totalProfit = round2(
    cart.reduce(
      (acc, item) => acc + calcItemProfit(item.cost || 0, item.rate || 0, item.qty || 0),
      0
    ) - discountAmount
  );

  const resolvedPaid =
    paidAmt === '' || paidAmt === undefined
      ? method === 'Udhaar'
        ? 0
        : finalTotal
      : round2(Number(paidAmt));

  const dueAmount = round2(Math.max(0, finalTotal - resolvedPaid));

  const status = dueAmount <= 0 ? 'PAID' : resolvedPaid <= 0 ? 'DUE' : 'PARTIAL';

  return {
    subtotal,
    discountAmount,
    taxAmount,
    finalTotal,
    paidAmount: resolvedPaid,
    dueAmount,
    totalProfit,
    status,
  };
};

/**
 * Derive the canonical status of a transaction from its stored paid/due/total.
 * Handles legacy records that may have stale status fields.
 */
export const deriveStatus = (paid, due, total) => {
  const d = Number(due) || 0;
  const p = Number(paid) || 0;
  const t = Number(total) || 0;
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
