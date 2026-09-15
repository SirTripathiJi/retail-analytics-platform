import { forwardRef } from 'react';

import { useTranslation } from '../../context/LanguageContext';

// A component designed strictly for printing. Hidden on screen via CSS.
export const InvoicePrint = forwardRef(({ invoice, shopDetails, type = 'a4' }, ref) => {
  const { t = (k) => k } = useTranslation();
  if (!invoice) return null;

  const isThermal = type === 'thermal';

  return (
    <div className="invoice-print-container flex justify-center w-full bg-[#f0f0f0] p-4 sm:p-10">
      <div
        ref={ref}
        className={`print-only bg-white text-black shadow-2xl ${isThermal ? 'w-[80mm] p-4 text-xs font-sans' : 'w-full max-w-3xl p-12 font-sans border-[12px] border-double border-black'}`}
      >
        {/* Header */}
        <div
          className={`text-center border-b-2 border-black pb-4 mb-4 ${isThermal ? '' : 'border-b-4'}`}
        >
          <h1
            className={`${isThermal ? 'text-xl font-bold uppercase' : 'text-4xl font-black uppercase tracking-tighter'}`}
          >
            {shopDetails?.name || 'ArthSathi Store'}
          </h1>
          <p className={`${isThermal ? 'text-[10px]' : 'text-sm font-bold uppercase mt-1'}`}>
            {shopDetails?.address || '123 Main Street, City'}
          </p>
          <p className={`${isThermal ? 'text-[10px]' : 'text-sm font-bold uppercase'}`}>
            {shopDetails?.phone && `Ph: ${shopDetails.phone}`}
          </p>
          {shopDetails?.gst && (
            <p className={`${isThermal ? 'text-[10px]' : 'text-sm font-bold uppercase'}`}>
              GSTIN: {shopDetails.gst}
            </p>
          )}
        </div>

        {/* Invoice Details */}
        <div
          className={`flex justify-between mb-4 ${isThermal ? 'text-[10px] flex-col gap-1' : 'text-sm font-bold uppercase'}`}
        >
          <div>
            <p>
              {t('transactions.invoice')}: {invoice.id}
            </p>
            <p>
              {t('transactions.date')}:{' '}
              {invoice.date ? new Date(invoice.date).toLocaleString() : '-'}
            </p>
          </div>
          <div className={isThermal ? '' : 'text-right'}>
            {invoice.customerName ? (
              <>
                <p>
                  {t('sales.customer')}: {invoice.customerName}
                </p>
                <p>
                  {t('customers.phone')}: {invoice.customerPhone || '-'}
                </p>
              </>
            ) : (
              <p>{t('sales.walkIn')}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left mb-4 border-collapse">
          <thead>
            <tr
              className={`border-b-2 border-black ${isThermal ? 'text-[10px]' : 'text-sm uppercase'}`}
            >
              <th className="py-2">{t('inventory.product')}</th>
              <th className="py-2 text-center">{t('inventory.stockQty')}</th>
              <th className="py-2 text-right">{t('inventory.sellingPrice')}</th>
              <th className="py-2 text-right">{t('sales.subtotal')}</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-300 ${isThermal ? 'text-[10px]' : 'text-sm font-bold'}`}
              >
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.qty}</td>
                <td className="py-2 text-right">
                  {(item.rate || item.sell || 0).toLocaleString()}
                </td>
                <td className="py-2 text-right">
                  {(item.qty * (item.rate || item.sell || 0)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          className={`flex flex-col items-end border-b-2 border-black pb-4 mb-4 ${isThermal ? 'text-[10px]' : 'text-sm font-bold uppercase'}`}
        >
          <div className="flex justify-between w-48 mb-1">
            <span>{t('sales.subtotal')}:</span>
            <span>{(invoice.subtotal || invoice.total || 0).toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between w-48 mb-1">
              <span>{t('sales.discount')}:</span>
              <span>-{(invoice.discount || 0).toLocaleString()}</span>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="flex justify-between w-48 mb-1">
              <span>{t('sales.taxGst')}:</span>
              <span>+{(invoice.tax || 0).toLocaleString()}</span>
            </div>
          )}
          <div
            className={`flex justify-between w-48 mt-2 pt-2 border-t-2 border-black ${isThermal ? 'font-bold text-sm' : 'text-xl font-black'}`}
          >
            <span>{t('sales.total')}:</span>
            <span>₹{(invoice.total || invoice.amt || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between w-48 mt-2 text-gray-600">
            <span>{t('sales.paidAmount')}:</span>
            <span>₹{(invoice.paid || invoice.total || 0).toLocaleString()}</span>
          </div>
          {invoice.due > 0 && (
            <div className="flex justify-between w-48 text-gray-600">
              <span>{t('sales.balanceDue')}:</span>
              <span>₹{(invoice.due || 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className={`${isThermal ? 'text-[10px] font-bold' : 'text-lg font-black uppercase'}`}>
            {t('sales.thankYou')}
          </p>
          {!isThermal && <p className="text-xs uppercase mt-2">{t('sales.poweredBy')}</p>}
        </div>
      </div>
    </div>
  );
});

InvoicePrint.displayName = 'InvoicePrint';
