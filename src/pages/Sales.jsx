import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';

import { InvoicePrint } from '../components/UI/InvoicePrint';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { calcInvoice, formatCurrency, round2 } from '../lib/calc';
import { isExpired } from '../lib/dates';
import { DB } from '../services/db';

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Udhaar'];

export function Sales() {
  const { user } = useAuth();
  const toast = useToast();
  const { t = (k) => k } = useTranslation();
  const { products, customers, confirmSale } = useData();

  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paid, setPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  // Search & modals
  const [searchItem, setSearchItem] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const printRef = useRef(null);
  const searchRef = useRef(null);

  // ─── CALCULATIONS (single source of truth) ────────────────
  const calc = useMemo(
    () => calcInvoice(cart, discountPercent, taxPercent, paid, paymentMethod),
    [cart, discountPercent, taxPercent, paid, paymentMethod]
  );
  const { subtotal, discountAmount, taxAmount, finalTotal, paidAmount, dueAmount, status } = calc;

  // ─── ITEM SEARCH ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const q = String(searchItem || '').toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) =>
        String(p.name || '')
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 12);
  }, [products, searchItem]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') setShowSearch(false);
    if (e.key === 'Enter' && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearchItem('');
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  // ─── CART ACTIONS ─────────────────────────────────────────
  const addToCart = useCallback(
    (product) => {
      if (!product.isCustom) {
        if (Number(product.quantity) <= 0) return toast.error(`${product.name} is out of stock`);
        if (isExpired(product.expiry_date))
          return toast.error(`${product.name} is expired — cannot sell`);
      }

      setCart((prev) => {
        const existing = prev.find((p) => String(p.id) === String(product.id));
        if (existing) {
          const newQty = existing.qty + 1;
          const stockProduct = products.find((pd) => String(pd.id) === String(product.id));
          if (!product.isCustom && stockProduct && newQty > Number(stockProduct.quantity)) {
            toast.error(`Only ${stockProduct.quantity} in stock`);
            return prev;
          }
          return prev.map((p) => (String(p.id) === String(product.id) ? { ...p, qty: newQty } : p));
        }
        return [
          ...prev,
          {
            id: String(product.id),
            name: product.name,
            rate: round2(Number(product.sell || product.rate || 0)),
            cost: round2(Number(product.cost || 0)),
            qty: 1,
            isCustom: product.isCustom || false,
          },
        ];
      });
      setShowSearch(false);
      setSearchItem('');
    },
    [products, toast]
  );

  const updateCartQty = useCallback(
    (id, delta) => {
      setCart((prev) =>
        prev
          .map((p) => {
            if (String(p.id) !== String(id)) return p;
            const newQty = p.qty + delta;
            if (newQty <= 0) return null;
            if (!p.isCustom) {
              const stock = products.find((pd) => String(pd.id) === String(id));
              if (stock && newQty > Number(stock.quantity)) {
                toast.error(`Only ${stock.quantity} in stock`);
                return p;
              }
            }
            return { ...p, qty: newQty };
          })
          .filter(Boolean)
      );
    },
    [products, toast]
  );

  const updateCartRate = useCallback((id, newRate) => {
    const r = round2(Math.max(0, Number(newRate) || 0));
    setCart((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, rate: r } : p)));
  }, []);

  const removeFromCart = useCallback(
    (id) => {
      setCart((prev) => prev.filter((p) => String(p.id) !== String(id)));
      toast.info('Item removed');
    },
    [toast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerId('');
    setDiscountPercent(0);
    setTaxPercent(0);
    setPaid('');
    setPaymentMethod('Cash');
    setNotes('');
  }, []);

  const addCustomCharge = () => {
    if (!customName.trim()) return toast.error('Enter item name');
    if (!customPrice || Number(customPrice) <= 0) return toast.error('Enter valid price');
    addToCart({
      id: 'custom_' + Date.now(),
      name: customName.trim(),
      sell: Number(customPrice),
      cost: 0,
      qty: 1,
      isCustom: true,
    });
    setIsCustomItemModalOpen(false);
    setCustomName('');
    setCustomPrice('');
  };

  // ─── CONFIRM SALE ─────────────────────────────────────────
  const confirmBill = useCallback(() => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (paymentMethod === 'Udhaar' && !customerId)
      return toast.error('Select a customer for Udhaar payment');
    if (dueAmount > 0 && !customerId) return toast.error('Select a customer to record balance due');

    const selectedCustomer = customers.find((c) => String(c.id) === String(customerId));
    const invId = DB.getNextInvoiceId(user.uid);

    const invoice = {
      id: invId,
      date: new Date().toISOString(),
      customerId: customerId || null,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in',
      customerPhone: selectedCustomer?.phone || '',
      items: cart,
      subtotal,
      discount: discountAmount,
      discountPercent: Number(discountPercent),
      tax: taxAmount,
      taxPercent: Number(taxPercent),
      total: finalTotal,
      paid: paidAmount,
      due: dueAmount,
      paymentMethod,
      status,
      profit: round2(
        cart.reduce((a, i) => a + (Number(i.rate) - Number(i.cost)) * Number(i.qty), 0) -
          discountAmount
      ),
      notes: notes.trim(),
      _createdAt: new Date().toISOString(),
    };

    confirmSale(invoice, cart);

    setLastInvoice(invoice);
    setIsReceiptModalOpen(true);
    clearCart();

    toast.success(`Invoice ${invId} generated`);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD600', '#FF4081', '#00E5FF'],
    });
  }, [
    cart,
    paymentMethod,
    customerId,
    dueAmount,
    customers,
    subtotal,
    discountAmount,
    taxAmount,
    finalTotal,
    paidAmount,
    status,
    discountPercent,
    taxPercent,
    notes,
    confirmSale,
    clearCart,
    toast,
    user,
  ]);

  return (
    <div className="space-y-0">
      {/* Hidden print target */}
      <InvoicePrint
        ref={printRef}
        invoice={lastInvoice}
        shopDetails={{ name: user?.store || 'My Shop' }}
      />

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* ── LEFT: Item selector + customer ── */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Search bar */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                  ref={searchRef}
                  className="brutalist-input !pl-12 text-base"
                  placeholder={t('sales.searchPlaceholder')}
                  value={searchItem}
                  onChange={(e) => {
                    setSearchItem(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <button
                className="brutalist-btn btn-sm whitespace-nowrap gap-2 bg-[var(--color-secondary)] text-white"
                onClick={() => setIsCustomItemModalOpen(true)}
              >
                <Plus className="w-4 h-4" /> {t('sales.extraCharge')}
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSearch && (
              <div className="absolute top-full left-0 right-0 z-50 bg-[var(--card-bg)] border-4 border-[var(--border-color)] shadow-[8px_8px_0_var(--shadow-color)] max-h-72 overflow-y-auto mt-1">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-sm font-bold text-[var(--text-secondary)] uppercase">
                    {t('sales.noProductsFound')}
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-brand)] hover:text-[#111111] transition-colors border-b border-[var(--border-color)] last:border-b-0 text-left"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addToCart(p);
                      }}
                    >
                      <div>
                        <p className="font-black text-sm uppercase">{p.name}</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">
                          {p.category} · Stock: {p.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-black text-base">{formatCurrency(p.sell)}</p>
                        {Number(p.quantity) <= 0 && (
                          <span className="badge badge-outstock text-[9px]">
                            {t('sales.outOfStockBadge')}
                          </span>
                        )}
                        {isExpired(p.expiry_date) && (
                          <span className="badge badge-expired text-[9px]">
                            {t('sales.expiredBadge')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Click away to close search */}
          {showSearch && (
            <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)} />
          )}

          {/* Customer picker */}
          <div className="brutalist-card">
            <p className="section-title flex items-center gap-2">
              <User className="w-4 h-4" /> {t('sales.customerDetails')}
            </p>
            <select
              className="brutalist-input"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">{t('sales.walkIn')}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>
            {customerId && (
              <p className="text-xs font-bold text-[var(--color-secondary)] uppercase mt-2">
                {t('sales.khataNote')}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <input
              className="brutalist-input text-sm"
              placeholder={t('sales.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* ── RIGHT: Cart + Totals ── */}
        <div className="flex-[1.4] border-4 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[8px_8px_0_var(--shadow-color)] flex flex-col min-h-[600px] w-full xl:w-auto">
          {/* Cart header */}
          <div className="px-5 py-4 border-b-4 border-[var(--border-color)] bg-[var(--color-brand)] flex justify-between items-center shrink-0">
            <h2 className="text-xl font-black uppercase flex items-center gap-2 text-[#111111]">
              <ShoppingCart className="w-5 h-5" /> {t('sales.currentBill')}
              {cart.length > 0 && (
                <span className="text-sm bg-[#111111] text-[var(--color-brand)] px-2 py-0.5 font-black">
                  {cart.length}
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-black uppercase underline text-[#111111] hover:text-red-700"
              >
                {t('sales.clearAll')}
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] opacity-30 py-16">
                <Receipt className="w-16 h-16" />
                <p className="text-base font-black uppercase tracking-widest">
                  {t('sales.cartEmpty')}
                </p>
                <p className="text-sm font-bold">{t('sales.addItemsCta')}</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-[var(--border-color)]">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm uppercase truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Rate edit */}
                        <span className="text-xs text-[var(--text-secondary)] font-bold">₹</span>
                        <input
                          type="number"
                          className="w-20 text-xs font-black border-b-2 border-[var(--border-color)] bg-transparent outline-none focus:border-[var(--color-brand)] text-right"
                          value={item.rate}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => updateCartRate(item.id, e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    {/* Qty stepper */}
                    <div className="flex items-center border-2 border-[var(--border-color)] shrink-0">
                      <button
                        className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--bg-secondary)] transition-colors"
                        onClick={() => updateCartQty(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-black text-sm border-x-2 border-[var(--border-color)] h-8 flex items-center justify-center">
                        {item.qty}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--bg-secondary)] transition-colors"
                        onClick={() => updateCartQty(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Line total */}
                    <div className="text-right shrink-0 w-20">
                      <p className="font-black text-sm">{formatCurrency(item.qty * item.rate)}</p>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals + payment */}
          {cart.length > 0 && (
            <div className="p-5 border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4 shrink-0">
              {/* Discount + Tax row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-title text-[10px]">{t('sales.discount')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="brutalist-input text-center text-base font-black py-2"
                    value={discountPercent}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                    }
                  />
                </div>
                <div>
                  <label className="section-title text-[10px]">{t('sales.taxGst')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    className="brutalist-input text-center text-base font-black py-2"
                    value={taxPercent}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>

              {/* Live calculation */}
              <div className="space-y-1.5 text-sm font-bold">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{t('sales.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[var(--color-error)]">
                    <span>
                      {t('sales.discount')} ({discountPercent}%)
                    </span>
                    <span>− {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>GST ({taxPercent}%)</span>
                    <span>+ {formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#111111] bg-[var(--color-brand)] -mx-2 px-2 py-2 font-black text-lg border-y-4 border-[var(--border-color)]">
                  <span>{t('sales.netTotal')}</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Payment mode */}
              <div>
                <label className="section-title text-[10px]">{t('sales.paymentMode')}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PAYMENT_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPaymentMethod(mode);
                        if (mode === 'Udhaar') setPaid('0');
                      }}
                      className={`text-[11px] font-black py-2 border-2 border-[var(--border-color)] transition-all ${paymentMethod === mode ? 'bg-[var(--color-brand)] shadow-[2px_2px_0_var(--shadow-color)] text-[#111111]' : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid input */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="section-title text-[10px]">{t('sales.paidAmount')} (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="brutalist-input text-lg font-black py-2"
                    placeholder={formatCurrency(finalTotal)}
                    value={paid}
                    disabled={paymentMethod === 'Udhaar'}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setPaid(e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-1">
                    {t('sales.balanceDue')}
                  </p>
                  <p
                    className={`text-3xl font-black ${dueAmount > 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}
                  >
                    {formatCurrency(dueAmount)}
                  </p>
                </div>
              </div>

              <button className="brutalist-btn btn-lg w-full gap-3" onClick={confirmBill}>
                <Zap className="w-5 h-5" /> {t('sales.generateInvoice')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CUSTOM ITEM MODAL ── */}
      <Modal
        isOpen={isCustomItemModalOpen}
        onClose={() => setIsCustomItemModalOpen(false)}
        title={t('sales.extraCharge')}
        actions={
          <div className="flex gap-4">
            <button
              className="text-sm font-black uppercase underline"
              onClick={() => setIsCustomItemModalOpen(false)}
            >
              {t('sales.close')}
            </button>
            <button className="brutalist-btn px-8" onClick={addCustomCharge}>
              {t('sales.findItem')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="section-title text-[10px]">{t('sales.itemNameLabel')}</label>
            <input
              className="brutalist-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Delivery Charge"
            />
          </div>
          <div>
            <label className="section-title text-[10px]">{t('sales.amountLabel')}</label>
            <input
              type="number"
              min="0"
              className="brutalist-input text-2xl font-black"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>
      </Modal>

      {/* ── RECEIPT MODAL ── */}
      {isReceiptModalOpen && lastInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setIsReceiptModalOpen(false)}
          title={t('sales.invoiceGenerated')}
          actions={
            <div className="flex gap-4">
              <button
                className="brutalist-btn bg-[var(--color-accent)] text-[#111111] gap-2"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> {t('sales.printReceipt')}
              </button>
              <button
                className="brutalist-btn brutalist-btn-ghost"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                <X className="w-4 h-4" /> {t('sales.close')}
              </button>
            </div>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 border-4 border-[var(--border-color)] bg-[var(--color-success)] flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_var(--shadow-color)]">
              <CheckCircle2 className="w-8 h-8 text-[#111111]" />
            </div>
            <p className="text-3xl font-black tracking-tighter">
              {formatCurrency(lastInvoice.total)}
            </p>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">
              {lastInvoice.id}
            </p>
            {lastInvoice.due > 0 && (
              <p className="text-sm font-bold text-[var(--color-error)] mt-2">
                Balance Due: {formatCurrency(lastInvoice.due)}
                {lastInvoice.customerName !== 'Walk-in' &&
                  ` — added to ${lastInvoice.customerName}'s khata`}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
