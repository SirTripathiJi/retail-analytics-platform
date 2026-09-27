import { round2 } from './calc.js';

/** Allocate a customer payment against their oldest outstanding invoices. */
export function settleSalesDues(sales, customerId, amountToPay, method, settledAt) {
  let amountLeft = round2(Number(amountToPay));
  const updatedSales = sales.map((sale) => {
    if (String(sale.customerId) !== String(customerId) || !(sale.due > 0) || amountLeft <= 0) {
      return sale;
    }

    const payment = Math.min(round2(sale.due), amountLeft);
    const due = round2(sale.due - payment);
    amountLeft = round2(amountLeft - payment);

    return {
      ...sale,
      due,
      paid: round2((Number(sale.paid) || 0) + payment),
      status: due <= 0 ? 'PAID' : 'PARTIAL',
      paymentMethod: method,
      _settledAt: settledAt,
    };
  });

  return { sales: updatedSales, remaining: amountLeft };
}
