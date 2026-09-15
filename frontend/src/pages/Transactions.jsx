import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, FileText, Printer, Search, X } from 'lucide-react';

import { InvoicePrint } from '../components/UI/InvoicePrint';
import { Modal } from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { deriveStatus, formatCurrency } from '../lib/calc';
import { toDateLabel, toDateTime, toYM, toYMD } from '../lib/dates';

const PAGE_SIZE = 20;

export function Transactions() {
  const { user } = useAuth();
  const { t = (k) => k } = useTranslation();
  const { sales } = useData();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(toYMD());
  const [selectedMonth, setSelectedMonth] = useState(toYM());
  const [page, setPage] = useState(1);

  const [previewInvoice, setPreviewInvoice] = useState(null);
  const printRef = useRef(null);

  // ─── FILTER + SORT ───────────────────────────────────────
  const filtered = useMemo(() => {
    const q = String(search || '').toLowerCase();

    return [...sales]
      .sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1)) // newest first
      .filter((s) => {
        const idMatch = String(s.id || '')
          .toLowerCase()
          .includes(q);
        const custMatch = String(s.customerName || s.name || '')
          .toLowerCase()
          .includes(q);
        if (!idMatch && !custMatch) return false;

        // Status filter
        const status = deriveStatus(s.paid, s.due, s.total);
        if (filterStatus === 'PAID' && status !== 'PAID') return false;
        if (filterStatus === 'DUE' && status === 'PAID') return false;
        if (filterStatus === 'PARTIAL' && status !== 'PARTIAL') return false;

        // Date filter
        const dateStr = s.date || '';
        if (dateFilter === 'DAY' && !dateStr.startsWith(selectedDate)) return false;
        if (dateFilter === 'MONTH' && !dateStr.startsWith(selectedMonth)) return false;

        return true;
      });
  }, [sales, search, filterStatus, dateFilter, selectedDate, selectedMonth]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // ─── SUMMARY STATS ───────────────────────────────────────
  const stats = useMemo(
    () => ({
      revenue: filtered.reduce((a, s) => a + (Number(s.total) || 0), 0),
      paid: filtered.reduce((a, s) => a + (Number(s.paid) || 0), 0),
      due: filtered.reduce((a, s) => a + Math.max(0, Number(s.due) || 0), 0),
      count: filtered.length,
    }),
    [filtered]
  );

  const StatusBadge = ({ sale }) => {
    const status = deriveStatus(sale.paid, sale.due, sale.total);
    if (status === 'PAID')
      return (
        <span className="badge badge-paid">
          <CheckCircle2 className="w-3 h-3" /> {t('transactions.paid')}
        </span>
      );
    if (status === 'PARTIAL')
      return (
        <span className="badge badge-partial">
          <AlertCircle className="w-3 h-3" /> {t('transactions.partialBadge')}
        </span>
      );
    return (
      <span className="badge badge-due animate-pulse">
        <AlertCircle className="w-3 h-3" /> {t('transactions.udhaar')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── FILTER BAR ── */}
      <div className="page-header flex-wrap gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            className="brutalist-input !pl-12 text-sm"
            placeholder={t('transactions.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex border-2 border-[var(--border-color)] overflow-hidden">
            {['ALL', 'PAID', 'DUE', 'PARTIAL'].map((s) => (
              <button
                key={s}
                className={`px-3 py-2 text-[11px] font-black uppercase transition-all ${filterStatus === s ? 'bg-[var(--color-brand)] text-[#111111]' : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                onClick={() => {
                  setFilterStatus(s);
                  resetPage();
                }}
              >
                {s === 'ALL'
                  ? t('transactions.filterAll')
                  : s === 'PAID'
                    ? t('transactions.filterPaid')
                    : s === 'DUE'
                      ? t('transactions.filterDue')
                      : t('transactions.filterPartial')}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <div className="flex border-2 border-[var(--border-color)] overflow-hidden">
            {['ALL', 'MONTH', 'DAY'].map((d) => (
              <button
                key={d}
                className={`px-3 py-2 text-[11px] font-black uppercase transition-all ${dateFilter === d ? 'bg-[var(--color-secondary)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                onClick={() => {
                  setDateFilter(d);
                  resetPage();
                }}
              >
                {d === 'ALL'
                  ? t('transactions.allTime')
                  : d === 'MONTH'
                    ? t('transactions.filterMonth')
                    : t('transactions.filterDay')}
              </button>
            ))}
          </div>

          {dateFilter === 'DAY' && (
            <input
              type="date"
              className="brutalist-input !w-auto text-xs py-2 px-3"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                resetPage();
              }}
            />
          )}
          {dateFilter === 'MONTH' && (
            <input
              type="month"
              className="brutalist-input !w-auto text-xs py-2 px-3"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                resetPage();
              }}
            />
          )}
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('transactions.transactions'), val: stats.count, color: 'var(--color-accent)' },
          {
            label: t('transactions.revenue'),
            val: formatCurrency(stats.revenue),
            color: 'var(--color-brand)',
          },
          {
            label: t('transactions.collected'),
            val: formatCurrency(stats.paid),
            color: 'var(--color-success)',
          },
          {
            label: t('transactions.outstanding'),
            val: formatCurrency(stats.due),
            color: 'var(--color-error)',
          },
        ].map((item) => (
          <div key={item.label} className="brutalist-card flex items-center gap-3 py-3">
            <div className="w-3 h-10 shrink-0" style={{ background: item.color }} />
            <div>
              <p className="text-xl font-black leading-none">{item.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-0.5">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="brutalist-table-wrap">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>{t('transactions.invoice')}</th>
              <th>{t('transactions.customer')}</th>
              <th>{t('transactions.date')}</th>
              <th className="text-right">{t('transactions.total')}</th>
              <th className="text-right">{t('transactions.paidDue')}</th>
              <th>{t('transactions.mode')}</th>
              <th>{t('transactions.status')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((s) => {
                const total = Number(s.total) || Number(s.amt) || 0;
                const paid = Number(s.paid) || 0;
                const due = Math.max(0, Number(s.due) || 0);

                return (
                  <tr key={s.id}>
                    <td>
                      <p className="font-black text-xs uppercase tracking-widest">{s.id}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold">
                        {s.items?.length || 1} item(s)
                      </p>
                    </td>
                    <td>
                      <p className="font-black text-sm uppercase italic">
                        {s.customerName || s.name || 'Walk-in'}
                      </p>
                    </td>
                    <td>
                      <p className="text-xs font-bold whitespace-nowrap">{toDateLabel(s.date)}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {toDateTime(s.date).split(',')[1]?.trim()}
                      </p>
                    </td>
                    <td className="text-right">
                      <span className="font-black text-base">{formatCurrency(total)}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className="text-xs font-bold text-[var(--color-success)]">
                          Paid: {formatCurrency(paid)}
                        </span>
                        {due > 0 && (
                          <span className="text-xs font-bold text-[var(--color-error)]">
                            Due: {formatCurrency(due)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral text-[10px]">
                        {s.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge sale={s} />
                    </td>
                    <td>
                      <button
                        className="brutalist-btn btn-sm btn-icon bg-[var(--color-brand)] text-[#111111]"
                        title="View Invoice"
                        onClick={() => setPreviewInvoice(s)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-24">
                  <div className="flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] opacity-30">
                    <FileText className="w-16 h-16" />
                    <p className="text-lg font-black uppercase tracking-widest">
                      {t('transactions.noTransactions')}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-2 border-[var(--border-color)] p-4 bg-[var(--card-bg)]">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            {t('transactions.showingOf')} {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} {t('transactions.of')} {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              className="brutalist-btn btn-sm brutalist-btn-ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('transactions.prev')}
            </button>
            <span className="px-4 py-2 border-2 border-[var(--border-color)] font-black text-sm bg-[var(--color-brand)] text-[#111111]">
              {page} / {totalPages}
            </span>
            <button
              className="brutalist-btn btn-sm brutalist-btn-ghost"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('transactions.next')}
            </button>
          </div>
        </div>
      )}

      {/* ── INVOICE PREVIEW MODAL ── */}
      {previewInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice — ${previewInvoice.id}`}
          actions={
            <div className="flex gap-3">
              <button
                className="brutalist-btn brutalist-btn-ghost gap-2"
                onClick={() => setPreviewInvoice(null)}
              >
                <X className="w-4 h-4" /> Close
              </button>
              <button
                className="brutalist-btn bg-[var(--color-accent)] text-[#111111] gap-2"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> {t('sales.printReceipt')}
              </button>
            </div>
          }
        >
          <div className="bg-[#f5f5f5] p-2 overflow-auto max-h-[65vh]">
            <style>{`@media screen { .print-preview-container .print-only { display: block !important; position: static !important; } }`}</style>
            <div className="print-preview-container">
              <InvoicePrint
                ref={printRef}
                invoice={previewInvoice}
                shopDetails={{ name: user?.store || 'My Shop' }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
