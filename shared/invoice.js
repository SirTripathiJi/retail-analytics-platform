/** Shared billing calculations used for the React preview and server check. */
export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const calcItemProfit = (cost, sell, quantity) =>
  round2((Number(sell) - Number(cost)) * Number(quantity));

export const calcInvoice = (
  cart = [],
  discountPct = 0,
  taxPct = 0,
  paidAmount = '',
  method = 'Cash'
) => {
  const subtotal = round2(
    cart.reduce(
      (total, item) => total + round2((Number(item.qty) || 0) * (Number(item.rate) || 0)),
      0
    )
  );
  const discountAmount = round2(subtotal * (Number(discountPct) / 100));
  const afterDiscount = round2(subtotal - discountAmount);
  const taxAmount = round2(afterDiscount * (Number(taxPct) / 100));
  const finalTotal = round2(afterDiscount + taxAmount);
  const totalProfit = round2(
    cart.reduce(
      (total, item) => total + calcItemProfit(item.cost || 0, item.rate || 0, item.qty || 0),
      0
    ) - discountAmount
  );
  const resolvedPaid =
    paidAmount === '' || paidAmount === undefined
      ? method === 'Udhaar'
        ? 0
        : finalTotal
      : round2(Number(paidAmount));
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
